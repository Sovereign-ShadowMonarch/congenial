Backend API Documentation - Part 2
##################################################

Bitcoin Management
==================

Add Bitcoin XPUB
-----------------

.. http:put:: /api/(version)/blockchains/BTC/xpub

   Add a Bitcoin extended public key for tracking.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/blockchains/BTC/xpub HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "xpub": "xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz",
          "derivation_path": "m/44'/0'/0'",
          "label": "Main Bitcoin Wallet",
          "tags": ["bitcoin", "main"],
          "async_query": false
      }

   :reqjson string xpub: Extended public key
   :reqjson string derivation_path: Optional derivation path
   :reqjson string label: Optional label for the XPUB
   :reqjson array tags: Optional tags
   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "xpub": "xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz",
              "derivation_path": "m/44'/0'/0'",
              "label": "Main Bitcoin Wallet",
              "tags": ["bitcoin", "main"]
          },
          "message": ""
      }

   :resjson object result: Added XPUB information
   :statuscode 200: XPUB added successfully
   :statuscode 400: Invalid XPUB data
   :statuscode 409: User not logged in or XPUB already exists
   :statuscode 500: Internal server error

Update Bitcoin XPUB
--------------------

.. http:patch:: /api/(version)/blockchains/BTC/xpub

   Update Bitcoin XPUB metadata.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/blockchains/BTC/xpub HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "xpub": "xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz",
          "derivation_path": "m/44'/0'/0'",
          "label": "Updated Bitcoin Wallet",
          "tags": ["bitcoin", "main", "updated"]
      }

   :reqjson string xpub: Extended public key
   :reqjson string derivation_path: Optional derivation path
   :reqjson string label: Optional updated label
   :reqjson array tags: Optional updated tags

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: XPUB updated successfully
   :statuscode 400: Invalid XPUB data
   :statuscode 409: User not logged in or XPUB not found
   :statuscode 500: Internal server error

Delete Bitcoin XPUB
--------------------

.. http:delete:: /api/(version)/blockchains/BTC/xpub

   Remove a Bitcoin XPUB from tracking.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      DELETE /api/1/blockchains/BTC/xpub HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "xpub": "xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz",
          "derivation_path": "m/44'/0'/0'",
          "async_query": false
      }

   :reqjson string xpub: Extended public key to remove
   :reqjson string derivation_path: Optional derivation path
   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: XPUB deleted successfully
   :statuscode 400: Invalid XPUB
   :statuscode 409: User not logged in or XPUB not found
   :statuscode 500: Internal server error

DeFi Integration
================

Get DeFi Balances
-----------------

.. http:get:: /api/(version)/blockchains/ETH/defi

   Get DeFi protocol balances across all supported protocols.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/defi HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": {
                  "makerdao_dsr": {
                      "balance": {
                          "amount": "1000.0",
                          "usd_value": "1000.0"
                      }
                  },
                  "aave": {
                      "lending": {
                          "DAI": {
                              "balance": {
                                  "amount": "500.0",
                                  "usd_value": "500.0"
                              },
                              "apy": "0.05"
                          }
                      }
                  }
              }
          },
          "message": ""
      }

   :resjson object result: DeFi balances by address and protocol
   :statuscode 200: DeFi balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

MakerDAO DSR Balance
--------------------

.. http:get:: /api/(version)/blockchains/ETH/modules/makerdao/dsrbalance

   Get MakerDAO DSR (Dai Savings Rate) balance.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/makerdao/dsrbalance HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "current_dsr": "0.05",
              "balances": {
                  "0x1234...": {
                      "amount": "1000.0",
                      "usd_value": "1000.0"
                  }
              }
          },
          "message": ""
      }

   :resjson object result: DSR balance information
   :statuscode 200: DSR balance retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

MakerDAO DSR History
---------------------

.. http:get:: /api/(version)/blockchains/ETH/modules/makerdao/dsrhistory

   Get MakerDAO DSR history.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/makerdao/dsrhistory HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": {
                  "movements": [
                      {
                          "movement_type": "deposit",
                          "gain_so_far": {
                              "amount": "10.0",
                              "usd_value": "10.0"
                          },
                          "value": {
                              "amount": "1000.0",
                              "usd_value": "1000.0"
                          },
                          "block_number": 9500000,
                          "timestamp": 1609459200,
                          "tx_hash": "0xabc123..."
                      }
                  ],
                  "gain_so_far": {
                      "amount": "10.0",
                      "usd_value": "10.0"
                  }
              }
          },
          "message": ""
      }

   :resjson object result: DSR history by address
   :statuscode 200: DSR history retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

MakerDAO Vaults
----------------

.. http:get:: /api/(version)/blockchains/ETH/modules/makerdao/vaults

   Get MakerDAO vault information.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/makerdao/vaults HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": [
              {
                  "identifier": 12345,
                  "owner": "0x1234...",
                  "collateral_type": "ETH-A",
                  "collateral": {
                      "amount": "10.0",
                      "usd_value": "25000.0"
                  },
                  "debt": {
                      "amount": "15000.0",
                      "usd_value": "15000.0"
                  },
                  "collateralization_ratio": "166.67",
                  "liquidation_ratio": "150.0",
                  "liquidation_price": "2250.0",
                  "stability_fee": "0.025"
              }
          ],
          "message": ""
      }

   :resjson array result: List of MakerDAO vaults
   :statuscode 200: Vaults retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Aave Balances
-------------

.. http:get:: /api/(version)/blockchains/ETH/modules/aave/balances

   Get Aave lending/borrowing balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/aave/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": {
                  "lending": {
                      "DAI": {
                          "balance": {
                              "amount": "1000.0",
                              "usd_value": "1000.0"
                          },
                          "apy": "0.05"
                      }
                  },
                  "borrowing": {
                      "USDC": {
                          "balance": {
                              "amount": "500.0",
                              "usd_value": "500.0"
                          },
                          "variable_apr": "0.08",
                          "stable_apr": "0.10"
                      }
                  }
              }
          },
          "message": ""
      }

   :resjson object result: Aave balances by address
   :statuscode 200: Aave balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Compound Balances
-----------------

.. http:get:: /api/(version)/blockchains/ETH/modules/compound/balances

   Get Compound lending/borrowing balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/compound/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": {
                  "lending": {
                      "DAI": {
                          "balance": {
                              "amount": "1000.0",
                              "usd_value": "1000.0"
                          },
                          "apy": "0.04"
                      }
                  },
                  "borrowing": {},
                  "rewards": {
                      "COMP": {
                          "balance": {
                              "amount": "5.0",
                              "usd_value": "250.0"
                          }
                      }
                  }
              }
          },
          "message": ""
      }

   :resjson object result: Compound balances by address
   :statuscode 200: Compound balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Uniswap Balances
----------------

.. http:get:: /api/(version)/blockchains/ETH/modules/uniswap/balances

   Get Uniswap liquidity provider balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/uniswap/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": [
                  {
                      "address": "0x5678...",
                      "assets": [
                          {
                              "asset": "ETH",
                              "total_amount": "10.0",
                              "user_balance": {
                                  "amount": "1.0",
                                  "usd_value": "2500.0"
                              },
                              "usd_price": "2500.0"
                          },
                          {
                              "asset": "DAI",
                              "total_amount": "25000.0",
                              "user_balance": {
                                  "amount": "2500.0",
                                  "usd_value": "2500.0"
                              },
                              "usd_price": "1.0"
                          }
                      ],
                      "total_supply": "100.0",
                      "user_balance": {
                          "amount": "10.0",
                          "usd_value": "5000.0"
                      }
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: Uniswap LP balances by address
   :statuscode 200: Uniswap balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Yearn Vaults Balances
---------------------

.. http:get:: /api/(version)/blockchains/ETH/modules/yearn_vaults/balances

   Get Yearn vault balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/yearn_vaults/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": [
                  {
                      "vault": "yvDAI",
                      "underlying_token": "DAI",
                      "vault_token": {
                          "amount": "950.0",
                          "usd_value": "1000.0"
                      },
                      "underlying_token_balance": {
                          "amount": "1000.0",
                          "usd_value": "1000.0"
                      },
                      "roi": "0.05"
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: Yearn vault balances by address
   :statuscode 200: Yearn balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Balancer Balances
-----------------

.. http:get:: /api/(version)/blockchains/ETH/modules/balancer/balances

   Get Balancer liquidity provider balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/balancer/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": [
                  {
                      "pool_token": {
                          "address": "0x5678...",
                          "total_amount": "1000.0"
                      },
                      "underlying_tokens": [
                          {
                              "asset": "BAL",
                              "total_amount": "100.0",
                              "user_balance": {
                                  "amount": "10.0",
                                  "usd_value": "200.0"
                              },
                              "weight": "0.8"
                          },
                          {
                              "asset": "WETH",
                              "total_amount": "20.0",
                              "user_balance": {
                                  "amount": "2.0",
                                  "usd_value": "5000.0"
                              },
                              "weight": "0.2"
                          }
                      ],
                      "user_balance": {
                          "amount": "100.0",
                          "usd_value": "5200.0"
                      }
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: Balancer LP balances by address
   :statuscode 200: Balancer balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

AdEx Balances
-------------

.. http:get:: /api/(version)/blockchains/ETH/modules/adex/balances

   Get AdEx staking balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/adex/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": [
                  {
                      "pool_id": "0x5678...",
                      "pool_name": "ADX Staking",
                      "adx_balance": {
                          "amount": "1000.0",
                          "usd_value": "500.0"
                      },
                      "adx_unclaimed_balance": {
                          "amount": "50.0",
                          "usd_value": "25.0"
                      },
                      "dai_unclaimed_balance": {
                          "amount": "10.0",
                          "usd_value": "10.0"
                      }
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: AdEx staking balances by address
   :statuscode 200: AdEx balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Loopring Balances
-----------------

.. http:get:: /api/(version)/blockchains/ETH/modules/loopring/balances

   Get Loopring L2 balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/modules/loopring/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false
      }

   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "0x1234...": [
                  {
                      "asset": "LRC",
                      "balance": {
                          "amount": "1000.0",
                          "usd_value": "300.0"
                      }
                  },
                  {
                      "asset": "ETH",
                      "balance": {
                          "amount": "1.0",
                          "usd_value": "2500.0"
                      }
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: Loopring L2 balances by address
   :statuscode 200: Loopring balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Asset Management
================

Get Owned Assets
----------------

.. http:get:: /api/(version)/assets

   Get all assets owned by the user.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/assets HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": ["BTC", "ETH", "DAI", "USDC", "UNI"],
          "message": ""
      }

   :resjson array result: List of owned asset symbols
   :statuscode 200: Assets retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Get All Assets
--------------

.. http:get:: /api/(version)/assets/all

   Get information about all supported assets.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/assets/all HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "BTC": {
                  "name": "Bitcoin",
                  "symbol": "BTC",
                  "asset_type": "own chain",
                  "started": 1230940800,
                  "forked": null,
                  "swapped_for": null,
                  "ethereum_address": null,
                  "decimals": null
              },
              "ETH": {
                  "name": "Ethereum",
                  "symbol": "ETH",
                  "asset_type": "own chain",
                  "started": 1438214400,
                  "forked": null,
                  "swapped_for": null,
                  "ethereum_address": null,
                  "decimals": null
              }
          },
          "message": ""
      }

   :resjson object result: Asset information dictionary
   :statuscode 200: All assets retrieved successfully
   :statuscode 500: Internal server error

Get Ethereum Tokens
--------------------

.. http:get:: /api/(version)/assets/ethereum

   Get Ethereum token information.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/assets/ethereum HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "address": "0xA0b86a33E6441E6C8D3c8C8C8C8C8C8C8C8C8C8C"
      }

   :reqjson string address: Optional specific token address

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": [
              {
                  "address": "0xA0b86a33E6441E6C8D3c8C8C8C8C8C8C8C8C8C8C",
                  "decimals": 18,
                  "name": "Uniswap",
                  "symbol": "UNI",
                  "started": 1600300800,
                  "coingecko": "uniswap",
                  "cryptocompare": "UNI",
                  "underlying_tokens": null
              }
          ],
          "message": ""
      }

   :resjson array result: List of Ethereum tokens
   :statuscode 200: Ethereum tokens retrieved successfully
   :statuscode 400: Invalid address
   :statuscode 500: Internal server error

Add Custom Ethereum Token
--------------------------

.. http:put:: /api/(version)/assets/ethereum

   Add a custom Ethereum token.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/assets/ethereum HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "token": {
              "address": "0x1234567890123456789012345678901234567890",
              "decimals": 18,
              "name": "Custom Token",
              "symbol": "CUSTOM",
              "started": 1609459200,
              "coingecko": "custom-token",
              "cryptocompare": "CUSTOM"
          }
      }

   :reqjson object token: Token information object

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "address": "0x1234567890123456789012345678901234567890",
              "decimals": 18,
              "name": "Custom Token",
              "symbol": "CUSTOM",
              "started": 1609459200,
              "coingecko": "custom-token",
              "cryptocompare": "CUSTOM"
          },
          "message": ""
      }

   :resjson object result: Added token information
   :statuscode 200: Token added successfully
   :statuscode 400: Invalid token data
   :statuscode 409: User not logged in or token already exists
   :statuscode 500: Internal server error

Update Custom Ethereum Token
-----------------------------

.. http:patch:: /api/(version)/assets/ethereum

   Update a custom Ethereum token.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/assets/ethereum HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "token": {
              "address": "0x1234567890123456789012345678901234567890",
              "decimals": 18,
              "name": "Updated Custom Token",
              "symbol": "CUSTOM",
              "started": 1609459200,
              "coingecko": "updated-custom-token",
              "cryptocompare": "CUSTOM"
          }
      }

   :reqjson object token: Updated token information

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Token updated successfully
   :statuscode 400: Invalid token data
   :statuscode 409: User not logged in or token not found
   :statuscode 500: Internal server error

Delete Custom Ethereum Token
-----------------------------

.. http:delete:: /api/(version)/assets/ethereum

   Delete a custom Ethereum token.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      DELETE /api/1/assets/ethereum HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "address": "0x1234567890123456789012345678901234567890"
      }

   :reqjson string address: Token address to delete

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Token deleted successfully
   :statuscode 400: Invalid address
   :statuscode 409: User not logged in or token not found
   :statuscode 500: Internal server error

Get Current Asset Prices
-------------------------

.. http:get:: /api/(version)/assets/prices/current

   Get current prices for specified assets.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/assets/prices/current HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "assets": ["BTC", "ETH", "UNI"],
          "target_asset": "USD",
          "ignore_cache": false,
          "async_query": false
      }

   :reqjson array assets: List of assets to get prices for
   :reqjson string target_asset: Target currency for prices
   :reqjson bool ignore_cache: Whether to ignore cached prices
   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "assets": {
                  "BTC": "45000.00",
                  "ETH": "2500.00",
                  "UNI": "25.00"
              },
              "target_asset": "USD"
          },
          "message": ""
      }

   :resjson object result: Current asset prices
   :statuscode 200: Prices retrieved successfully
   :statuscode 400: Invalid assets or target asset
   :statuscode 500: Internal server error

Get Historical Asset Prices
----------------------------

.. http:post:: /api/(version)/assets/prices/historical

   Get historical prices for assets at specific timestamps.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      POST /api/1/assets/prices/historical HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "assets_timestamp": [
              ["BTC", 1609459200],
              ["ETH", 1609459200]
          ],
          "target_asset": "USD",
          "async_query": false
      }

   :reqjson array assets_timestamp: Array of [asset, timestamp] pairs
   :reqjson string target_asset: Target currency for prices
   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "assets": {
                  "BTC": {
                      "1609459200": "29000.00"
                  },
                  "ETH": {
                      "1609459200": "730.00"
                  }
              },
              "target_asset": "USD"
          },
          "message": ""
      }

   :resjson object result: Historical asset prices
   :statuscode 200: Historical prices retrieved successfully
   :statuscode 400: Invalid request data
   :statuscode 500: Internal server error

Get Asset Icons
---------------

.. http:get:: /api/(version)/assets/(asset)/icon/(size)

   Get asset icon in specified size.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/assets/BTC/icon/small HTTP/1.1
      Host: localhost:4242
      Accept: image/png

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: image/png
      ETag: "abc123def456"

      [Binary PNG data]

   :statuscode 200: Icon retrieved successfully
   :statuscode 304: Not modified (when using If-None-Match header)
   :statuscode 400: Invalid asset or size
   :statuscode 404: Icon not found
   :statuscode 500: Internal server error

Upload Asset Icon
-----------------

.. http:put:: /api/(version)/assets/(asset)/icon

   Upload a custom icon for an asset.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/assets/CUSTOM/icon HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "file": "/path/to/icon.png"
      }

   :reqjson string file: Path to icon file

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Icon uploaded successfully
   :statuscode 400: Invalid file or asset
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Statistics & Reporting
======================

Get Net Value Statistics
-------------------------

.. http:get:: /api/(version)/statistics/netvalue

   Get net value statistics over time.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/statistics/netvalue HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "times": [1609459200, 1609545600, 1609632000],
              "data": ["50000.00", "52000.00", "48000.00"]
          },
          "message": ""
      }

   :resjson object result: Net value data over time
   :statuscode 200: Statistics retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

System & Cache
==============

Get Version
-----------

.. http:get:: /api/(version)/version

   Get backend version information.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/version HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "version": "1.21.0",
              "data_directory": "/path/to/data"
          },
          "message": ""
      }

   :resjson object result: Version and system information
   :statuscode 200: Version retrieved successfully
   :statuscode 500: Internal server error

Health Check
------------

.. http:get:: /api/(version)/ping

   Health check endpoint.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/ping HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Always true if server is running
   :statuscode 200: Server is healthy
   :statuscode 500: Internal server error

Get Task Status
---------------

.. http:get:: /api/(version)/tasks/(task_id)

   Get the status and result of an async task.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/tasks/123 HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "outcome": {
                  "result": {"data": "task_result"},
                  "message": ""
              },
              "status": "completed"
          },
          "message": ""
      }

   :resjson object result: Task status and outcome
   :statuscode 200: Task status retrieved successfully
   :statuscode 400: Invalid task ID
   :statuscode 404: Task not found
   :statuscode 500: Internal server error 