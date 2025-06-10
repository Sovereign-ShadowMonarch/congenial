import itertools
import logging
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple, Union, cast

from rotkehlchen.accounting.structures import (
    Balance,
    DefiEvent,
    LedgerAction,
)
from rotkehlchen.assets.asset import Asset
from rotkehlchen.chain.ethereum.trades import AMMTRADE_LOCATION_NAMES, AMMTrade, AMMTradeLocations
from rotkehlchen.constants.assets import A_USD
from rotkehlchen.constants.misc import ZERO
from rotkehlchen.constants.timing import QUERY_LIMIT_MULTIPLIER
from rotkehlchen.db.dbhandler import DBHandler
from rotkehlchen.errors import RemoteError
from rotkehlchen.exchanges.data_structures import AssetMovement, MarginPosition, Trade
from rotkehlchen.exchanges.manager import ExchangeManager
from rotkehlchen.exchanges.poloniex import process_polo_loans
from rotkehlchen.fval import FVal
from rotkehlchen.history.price import PriceHistorian
from rotkehlchen.logging import RotkehlchenLogsAdapter
from rotkehlchen.premium.premium import Premium
from rotkehlchen.typing import EthereumTransaction, Location, Timestamp
from rotkehlchen.user_messages import MessagesAggregator
from rotkehlchen.utils.misc import ts_now, write_history_data_in_file

logger = logging.getLogger(__name__)
log = RotkehlchenLogsAdapter(logger)

# Define constants
FREE_LEDGER_ACTIONS_LIMIT = 250
NUM_HISTORY_QUERY_STEPS_EXCL_EXCHANGES = 12

# Define local types
NumericMetric = Dict[str, FVal]
HistoryResult = Dict[str, Any]


def action_get_timestamp(action: Union[Trade, MarginPosition, AssetMovement, LedgerAction]) -> Timestamp:
    if isinstance(action, (Trade, MarginPosition, LedgerAction)):
        metric_obj = action
    elif isinstance(action, AssetMovement):
        metric_obj = action
    else:
        raise ValueError(f'Unknown history action object {type(action)}')

    return metric_obj.timestamp


def action_get_type(
        action: Union[Trade, MarginPosition, AssetMovement, LedgerAction],
) -> str:
    if isinstance(action, Trade):
        return 'trade'
    if isinstance(action, LedgerAction):
        return 'ledger_action'
    if isinstance(action, MarginPosition):
        return 'margin_position'
    if isinstance(action, AssetMovement):
        return 'asset_movement'
    raise ValueError(f'Unknown history action object {type(action)}')


def limit_trade_list_to_period(
        trades_list: List[Union[Trade, MarginPosition]],
        start_ts: Timestamp,
        end_ts: Timestamp,
) -> List[Union[Trade, MarginPosition]]:
    """Accepts a SORTED by timestamp trades_list and returns a shortened version
    of that list limited to a specific time period"""

    if not trades_list:
        return []

    if trades_list[0].timestamp >= start_ts:
        # needs no trimming in the start
        start_idx = 0
    else:
        # find the element to start
        # bisect does not work here since we want to find the last element that is
        # less than or equal to start_ts
        for idx, trade in enumerate(trades_list):
            if trade.timestamp >= start_ts:
                start_idx = idx
                break
        else:
            return []

    if trades_list[-1].timestamp <= end_ts:
        # needs no trimming in the end
        end_idx = len(trades_list)
    else:
        # find the element to end
        for idx, trade in enumerate(trades_list[start_idx:]):
            if trade.timestamp > end_ts:
                end_idx = start_idx + idx
                break
        else:
            # no element found greater than end_ts so we include the entire list from start_idx
            end_idx = len(trades_list)

    return trades_list[start_idx:end_idx]


class EventsHistorian():
    """Analyzes event history and returns information about various events.

    Information about profit, loss, historical trades, events and so on.
    """

    def __init__(
            self,
            user_directory: Path,
            db: 'DBHandler',
            msg_aggregator: MessagesAggregator,
            exchange_manager: ExchangeManager,
            chain_manager: 'ChainManager',
    ) -> None:
        self.db = db
        self.user_directory = user_directory
        self.msg_aggregator = msg_aggregator
        self.exchange_manager = exchange_manager
        self.chain_manager = chain_manager
        self.processing_state_name = 'initializing'
        self.progress = 0
        self.processing_state_percentage = 0
        self._reset_variables()

    def timestamp_to_date(self, timestamp: Timestamp) -> str:
        return timestamp.strftime('%d/%m/%Y %H:%M:%S')

    def _reset_variables(self) -> None:
        """Resets progress-related variables in case of consecutive calls.
        """
        self.processing_state_name = 'initializing'
        self.progress = 0
        self.processing_state_percentage = 0

    def _increase_progress(self, step: int, total_steps: int) -> int:
        self.progress = step * 100 / total_steps
        return step + 1

    def query_ledger_actions(
            self,
            has_premium: bool,
            from_ts: Optional[Timestamp],
            to_ts: Optional[Timestamp],
            location: Optional[Location] = None,
    ) -> Tuple[List['LedgerAction'], int]:
        """Queries all ledger actions either by location or throughout all locations
        in the given range
        """
        actions = self.db.get_ledger_actions(
            from_ts=from_ts,
            to_ts=to_ts,
            location=location,
        )
        original_length = len(actions)
        # Premium restrictions removed - always return all actions

        return actions, original_length

    def get_history(
            self,
            start_ts: Timestamp,
            end_ts: Timestamp,
            has_premium: bool,
    ) -> HistoryResult:
        """Creates trades and loans history from start_ts to end_ts"""
        self._reset_variables()
        step = 0
        total_steps = len(self.exchange_manager.connected_exchanges) + NUM_HISTORY_QUERY_STEPS_EXCL_EXCHANGES  # noqa: E501
        log.info(
            'Get/create trade history',
            start_ts=start_ts,
            end_ts=end_ts,
        )
        # start creating the all trades history list
        history: List[Union[Trade, MarginPosition, AMMTrade]] = []
        asset_movements = []
        loans = []
        empty_or_error = ''

        def populate_history_cb(
                trades_history: List[Trade],
                margin_history: List[MarginPosition],
                result_asset_movements: List[AssetMovement],
                exchange_specific_data: Any,
        ) -> None:
            """This callback will run for succesfull exchange history query"""
            history.extend(trades_history)
            history.extend(margin_history)
            asset_movements.extend(result_asset_movements)

            if exchange_specific_data:
                # This can only be poloniex at the moment
                polo_loans_data = exchange_specific_data
                loans.extend(process_polo_loans(
                    msg_aggregator=self.msg_aggregator,
                    data=polo_loans_data,
                    # We need to have history of loans since before the range
                    start_ts=Timestamp(0),
                    end_ts=end_ts,
                ))

        def fail_history_cb(error_msg: str) -> None:
            """This callback will run for failure in exchange history query"""
            nonlocal empty_or_error
            empty_or_error += '\n' + error_msg

        for name, exchange in self.exchange_manager.connected_exchanges.items():
            self.processing_state_name = f'Querying {name} exchange history'
            exchange.query_history_with_callbacks(
                # We need to have history of exchanges since before the range
                start_ts=Timestamp(0),
                end_ts=end_ts,
                success_callback=populate_history_cb,
                fail_callback=fail_history_cb,
            )
            step = self._increase_progress(step, total_steps)

        try:
            self.processing_state_name = 'Querying ethereum transactions history'
            eth_transactions = self.chain_manager.ethereum.transactions.query(
                addresses=None,  # all addresses
                # We need to have history of transactions since before the range
                from_ts=Timestamp(0),
                to_ts=end_ts,
                with_limit=False,  # at the moment ignore the limit for historical processing,
                recent_first=False,  # for history processing we need oldest first
            )
        except RemoteError as e:
            eth_transactions = []
            msg = str(e)
            self.msg_aggregator.add_error(
                f'There was an error when querying etherscan for ethereum transactions: {msg}'
                f'The final history result will not include ethereum transactions',
            )
            empty_or_error += '\n' + msg
        step = self._increase_progress(step, total_steps)

        # Include the external trades in the history
        self.processing_state_name = 'Querying external trades history'
        external_trades = self.db.get_trades(
            # We need to have history of trades since before the range
            from_ts=Timestamp(0),
            to_ts=end_ts,
            location=Location.EXTERNAL,
        )
        history.extend(external_trades)
        step = self._increase_progress(step, total_steps)

        # include the ledger actions
        self.processing_state_name = 'Querying ledger actions history'
        ledger_actions, _ = self.query_ledger_actions(has_premium, from_ts=start_ts, to_ts=end_ts)
        step = self._increase_progress(step, total_steps)

        # include AMM trades: balancer, uniswap
        for amm_location in AMMTradeLocations:
            amm_module_name = cast(AMMTRADE_LOCATION_NAMES, str(amm_location))
            amm_module = self.chain_manager.get_module(amm_module_name)
            if amm_module:  # Premium restrictions removed - always available
                self.processing_state_name = f'Querying {amm_module_name} trade history'
                amm_module_trades = amm_module.get_trades(
                    addresses=self.chain_manager.queried_addresses_for_module(amm_module_name),
                    from_timestamp=Timestamp(0),
                    to_timestamp=end_ts,
                    only_cache=False,
                )
                history.extend(amm_module_trades)
            step = self._increase_progress(step, total_steps)

        # Include makerdao DSR gains
        defi_events = []
        makerdao_dsr = self.chain_manager.get_module('makerdao_dsr')
        if makerdao_dsr:  # Premium restrictions removed - always available
            self.processing_state_name = 'Querying makerDAO DSR history'
            defi_events.extend(makerdao_dsr.get_history_events(
                from_timestamp=Timestamp(0),  # we need to process all events from history start
                to_timestamp=end_ts,
            ))
        step = self._increase_progress(step, total_steps)

        # Include makerdao vault events
        makerdao_vaults = self.chain_manager.get_module('makerdao_vaults')
        if makerdao_vaults:  # Premium restrictions removed - always available
            self.processing_state_name = 'Querying makerDAO vaults history'
            defi_events.extend(makerdao_vaults.get_history_events(
                from_timestamp=Timestamp(0),  # we need to process all events from history start
                to_timestamp=end_ts,
            ))
        step = self._increase_progress(step, total_steps)

        # include yearn vault events
        yearn_vaults = self.chain_manager.get_module('yearn_vaults')
        if yearn_vaults:  # Premium restrictions removed - always available
            self.processing_state_name = 'Querying yearn vaults history'
            defi_events.extend(yearn_vaults.get_history_events(
                from_timestamp=Timestamp(0),  # we need to process all events from history start
                to_timestamp=end_ts,
                addresses=self.chain_manager.queried_addresses_for_module('yearn_vaults'),
            ))
        step = self._increase_progress(step, total_steps)

        # include compound events
        compound = self.chain_manager.get_module('compound')
        if compound:  # Premium restrictions removed - always available
            self.processing_state_name = 'Querying compound history'
            defi_events.extend(compound.get_history_events(
                from_timestamp=Timestamp(0),  # we need to process all events from history start
                to_timestamp=end_ts,
                addresses=self.chain_manager.queried_addresses_for_module('compound'),
            ))
        step = self._increase_progress(step, total_steps)

        # include adex events
        adex = self.chain_manager.get_module('adex')
        if adex is not None:  # Premium restrictions removed - always available
            self.processing_state_name = 'Querying adex staking history'
            defi_events.extend(adex.get_history_events(
                from_timestamp=start_ts,
                to_timestamp=end_ts,
                addresses=self.chain_manager.queried_addresses_for_module('adex'),
            ))
        step = self._increase_progress(step, total_steps)

        # include aave events
        aave = self.chain_manager.get_module('aave')
        if aave is not None:  # Premium restrictions removed - always available
            self.processing_state_name = 'Querying aave history'
            defi_events.extend(aave.get_history_events(
                from_timestamp=start_ts,
                to_timestamp=end_ts,
                addresses=self.chain_manager.queried_addresses_for_module('aave'),
            ))
        self._increase_progress(step, total_steps)

        # include eth2 staking events
        # Premium restrictions removed - always include eth2 events
        self.processing_state_name = 'Querying ETH2 staking history'
        defi_events.extend(self.chain_manager.get_eth2_history_events(
            from_timestamp=start_ts,
            to_timestamp=end_ts,
        ))
        self._increase_progress(step, total_steps)

        history.sort(key=action_get_timestamp)
        return (
            empty_or_error,
            history,
            loans,
            asset_movements,
            eth_transactions,
            defi_events,
            ledger_actions,
        ) 