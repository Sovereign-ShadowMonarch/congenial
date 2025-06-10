Backend API Documentation
##################################################

Introduction
*************

This document provides comprehensive documentation for the Backend API, covering all 73 endpoints with detailed request/response formats, status codes, and examples. The API follows REST principles and all responses are wrapped in a standard JSON format.

When the Backend runs, it exposes an HTTP REST API accessible via HTTP requests. All endpoints accept and return JSON encoded objects with the prefix: ``/api/<version>/`` where version is currently ``1``.

Request Parameters
********************

All endpoints that take parameters accept a JSON body with said parameters. GET requests also accept query parameters for compatibility with multiple implementations.

Response Format
*****************

All endpoints wrap their response in the following JSON object:

::

    {
        "result": <data>,
        "message": ""
    }

For successful responses, ``"result"`` contains the data and ``"message"`` is empty.
For failed responses, ``"result"`` is ``null`` and ``"message"`` contains error information.

Async Queries
==============

Some endpoints accept ``"async_query": true``. When used, the query returns immediately with a task ID:

::

    {
        "result": {"task_id": 10},
        "message": ""
    }

Use the task ID with the ``/api/1/tasks/{task_id}`` endpoint to get results when ready.

Endpoints
***********

User Management
===============

Get All Users
-------------

.. http:get:: /api/(version)/users

   Retrieve all existing users and their login status.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/users HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {"john": "loggedin", "maria": "loggedout"},
          "message": ""
      }

   :resjson object result: Dictionary with usernames as keys and login status as values
   :statuscode 200: Users query successful
   :statuscode 500: Internal server error

Create New User
---------------

.. http:put:: /api/(version)/users

   Create a new user account.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/users HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "name": "john",
          "password": "supersecurepassword",
          "initial_settings": {
              "submit_usage_analytics": false,
              "main_currency": "USD"
          }
      }

   :reqjson string name: Username for the new user
   :reqjson string password: Password to encrypt the user's database
   :reqjson object initial_settings: Optional initial settings for the user

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "exchanges": [],
              "settings": {
                  "have_premium": true,
                  "version": "6",
                  "last_write_ts": 1571552172,
                  "include_crypto2crypto": true,
                  "anonymized_logs": true,
                  "ui_floating_precision": 2,
                  "taxfree_after_period": 31536000,
                  "balance_save_frequency": 24,
                  "include_gas_costs": true,
                  "eth_rpc_endpoint": "http://localhost:8545",
                  "ksm_rpc_endpoint": "http://localhost:9933",
                  "main_currency": "USD",
                  "date_display_format": "%d/%m/%Y %H:%M:%S %Z",
                  "last_balance_save": 1571552172,
                  "submit_usage_analytics": true,
                  "kraken_account_type": "intermediate",
                  "active_modules": ["makerdao_dsr", "makerdao_vaults", "aave"],
                  "current_price_oracles": ["cryptocompare", "coingecko"],
                  "historical_price_oracles": ["cryptocompare", "coingecko"],
                  "taxable_ledger_actions": ["income", "airdrop"]
              }
          },
          "message": ""
      }

   :resjson object result: Contains connected exchanges and user settings
   :statuscode 200: User created successfully
   :statuscode 400: Malformed JSON or invalid data
   :statuscode 409: User already exists or other conflict
   :statuscode 500: Internal server error

User Login
----------

.. http:patch:: /api/(version)/users/(username)

   Login to a user account.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/users/john HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "action": "login",
          "password": "supersecurepassword",
          "sync_approval": "unknown"
      }

   :reqjson string action: Must be "login"
   :reqjson string password: User's password
   :reqjson string sync_approval: Sync approval status ("unknown", "yes", "no")

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "exchanges": ["kraken", "poloniex"],
              "settings": {
                  "have_premium": true,
                  "version": "6",
                  "main_currency": "USD",
                  "ui_floating_precision": 2,
                  "include_crypto2crypto": true,
                  "anonymized_logs": true,
                  "submit_usage_analytics": true
              }
          },
          "message": ""
      }

   :resjson object result: Contains connected exchanges and user settings
   :statuscode 200: Login successful
   :statuscode 400: Malformed JSON
   :statuscode 401: Wrong password or authentication error
   :statuscode 409: Another user logged in or user doesn't exist
   :statuscode 500: Internal server error

User Logout
-----------

.. http:patch:: /api/(version)/users/(username)

   Logout from current user account.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/users/john HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "action": "logout"
      }

   :reqjson string action: Must be "logout"

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Logout successful
   :statuscode 400: Malformed JSON
   :statuscode 409: No user logged in or wrong user
   :statuscode 500: Internal server error

Change User Password
--------------------

.. http:patch:: /api/(version)/users/(username)/password

   Change the password for the logged-in user.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/users/john/password HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "current_password": "oldsecret",
          "new_password": "newsecret"
      }

   :reqjson string current_password: Current password
   :reqjson string new_password: New password

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Password changed successfully
   :statuscode 400: Malformed JSON
   :statuscode 401: Wrong current password
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Settings Management
===================

Get User Settings
-----------------

.. http:get:: /api/(version)/settings

   Retrieve current user settings.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/settings HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "have_premium": true,
              "version": "6",
              "last_write_ts": 1571552172,
              "include_crypto2crypto": true,
              "anonymized_logs": true,
              "ui_floating_precision": 2,
              "taxfree_after_period": 31536000,
              "balance_save_frequency": 24,
              "include_gas_costs": true,
              "eth_rpc_endpoint": "http://localhost:8545",
              "ksm_rpc_endpoint": "http://localhost:9933",
              "main_currency": "USD",
              "date_display_format": "%d/%m/%Y %H:%M:%S %Z",
              "last_balance_save": 1571552172,
              "submit_usage_analytics": true,
              "kraken_account_type": "intermediate",
              "active_modules": ["makerdao_dsr", "makerdao_vaults", "aave"],
              "current_price_oracles": ["cryptocompare", "coingecko"],
              "historical_price_oracles": ["cryptocompare", "coingecko"],
              "taxable_ledger_actions": ["income", "airdrop"]
          },
          "message": ""
      }

   :resjson object result: Complete user settings object
   :statuscode 200: Settings retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Update User Settings
--------------------

.. http:put:: /api/(version)/settings

   Update user settings.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/settings HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "settings": {
              "ui_floating_precision": 4,
              "main_currency": "EUR",
              "include_gas_costs": false,
              "submit_usage_analytics": false
          }
      }

   :reqjson object settings: Settings object with fields to update

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "have_premium": true,
              "version": "6",
              "ui_floating_precision": 4,
              "main_currency": "EUR",
              "include_gas_costs": false,
              "submit_usage_analytics": false
          },
          "message": ""
      }

   :resjson object result: Updated settings object
   :statuscode 200: Settings updated successfully
   :statuscode 400: Invalid settings data
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Exchange Management
===================

Get Connected Exchanges
------------------------

.. http:get:: /api/(version)/exchanges

   Get all currently connected exchanges.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/exchanges HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": ["kraken", "binance", "coinbase"],
          "message": ""
      }

   :resjson array result: List of connected exchange names
   :statuscode 200: Exchanges retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Connect Exchange
----------------

.. http:put:: /api/(version)/exchanges

   Connect a new exchange.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/exchanges HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "name": "kraken",
          "api_key": "your_api_key_here",
          "api_secret": "your_api_secret_here",
          "passphrase": "optional_passphrase"
      }

   :reqjson string name: Exchange name (kraken, binance, coinbase, etc.)
   :reqjson string api_key: Exchange API key
   :reqjson string api_secret: Exchange API secret
   :reqjson string passphrase: Optional passphrase (for some exchanges)

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Exchange connected successfully
   :statuscode 400: Invalid exchange data or credentials
   :statuscode 409: User not logged in or exchange already connected
   :statuscode 500: Internal server error

Disconnect Exchange
-------------------

.. http:delete:: /api/(version)/exchanges

   Disconnect an exchange.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      DELETE /api/1/exchanges HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "name": "kraken"
      }

   :reqjson string name: Exchange name to disconnect

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Exchange disconnected successfully
   :statuscode 400: Invalid exchange name
   :statuscode 409: User not logged in or exchange not connected
   :statuscode 500: Internal server error

Get Exchange Rates
-------------------

.. http:get:: /api/(version)/exchangerates

   Get current exchange rates for specified currencies.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/exchangerates HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "currencies": ["USD", "EUR", "BTC", "ETH"]
      }

   :reqjson array currencies: List of currency symbols

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "USD": "1.0",
              "EUR": "0.85",
              "BTC": "0.000023",
              "ETH": "0.00035"
          },
          "message": ""
      }

   :resjson object result: Currency rates relative to main currency
   :statuscode 200: Rates retrieved successfully
   :statuscode 400: Invalid currency list
   :statuscode 500: Internal server error

Balance Queries
===============

Get All Balances
----------------

.. http:get:: /api/(version)/balances

   Get balances from all sources (exchanges, blockchain, manual).

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "save_data": true,
          "async_query": false,
          "ignore_cache": false
      }

   :reqjson bool save_data: Whether to save balance data to database
   :reqjson bool async_query: Whether to query asynchronously
   :reqjson bool ignore_cache: Whether to ignore cached data

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "assets": {
                  "BTC": {
                      "amount": "1.5",
                      "usd_value": "45000.00"
                  },
                  "ETH": {
                      "amount": "10.0",
                      "usd_value": "25000.00"
                  }
              },
              "liabilities": {},
              "total_net_worth": "70000.00"
          },
          "message": ""
      }

   :resjson object result: Complete balance information
   :statuscode 200: Balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Get Exchange Balances
----------------------

.. http:get:: /api/(version)/exchanges/balances/(name)

   Get balances from a specific exchange or all exchanges.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/exchanges/balances/kraken HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false,
          "ignore_cache": false
      }

   :reqjson bool async_query: Whether to query asynchronously
   :reqjson bool ignore_cache: Whether to ignore cached data

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "kraken": {
                  "BTC": {
                      "amount": "0.5",
                      "usd_value": "15000.00"
                  },
                  "ETH": {
                      "amount": "5.0",
                      "usd_value": "12500.00"
                  }
              }
          },
          "message": ""
      }

   :resjson object result: Exchange balance information
   :statuscode 200: Exchange balances retrieved successfully
   :statuscode 400: Invalid exchange name
   :statuscode 409: User not logged in or exchange not connected
   :statuscode 500: Internal server error

Get Blockchain Balances
------------------------

.. http:get:: /api/(version)/blockchains/(blockchain)/balances

   Get balances from blockchain accounts.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/balances HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false,
          "ignore_cache": false
      }

   :reqjson bool async_query: Whether to query asynchronously
   :reqjson bool ignore_cache: Whether to ignore cached data

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "per_account": {
                  "ETH": {
                      "0x1234...": {
                          "assets": {
                              "ETH": {
                                  "amount": "5.0",
                                  "usd_value": "12500.00"
                              }
                          },
                          "liabilities": {}
                      }
                  }
              },
              "totals": {
                  "assets": {
                      "ETH": {
                          "amount": "5.0",
                          "usd_value": "12500.00"
                      }
                  },
                  "liabilities": {}
              }
          },
          "message": ""
      }

   :resjson object result: Blockchain balance information
   :statuscode 200: Blockchain balances retrieved successfully
   :statuscode 400: Invalid blockchain
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Get Manually Tracked Balances
------------------------------

.. http:get:: /api/(version)/balances/manual

   Get manually tracked balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/balances/manual HTTP/1.1
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
              "balances": [
                  {
                      "asset": "BTC",
                      "label": "Cold Storage",
                      "amount": "1.0",
                      "location": "blockchain",
                      "tags": ["cold-storage", "long-term"]
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: Manual balance information
   :statuscode 200: Manual balances retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Add Manual Balance
------------------

.. http:put:: /api/(version)/balances/manual

   Add a manually tracked balance.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/balances/manual HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false,
          "balances": [
              {
                  "asset": "BTC",
                  "label": "Hardware Wallet",
                  "amount": "2.5",
                  "location": "blockchain",
                  "tags": ["hardware", "secure"]
              }
          ]
      }

   :reqjson bool async_query: Whether to query asynchronously
   :reqjson array balances: Array of balance objects to add

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "balances": [
                  {
                      "asset": "BTC",
                      "label": "Hardware Wallet",
                      "amount": "2.5",
                      "location": "blockchain",
                      "tags": ["hardware", "secure"]
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: Added balance information
   :statuscode 200: Manual balance added successfully
   :statuscode 400: Invalid balance data
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Update Manual Balance
---------------------

.. http:patch:: /api/(version)/balances/manual

   Update a manually tracked balance.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/balances/manual HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false,
          "balances": [
              {
                  "asset": "BTC",
                  "label": "Hardware Wallet",
                  "amount": "3.0",
                  "location": "blockchain",
                  "tags": ["hardware", "secure", "updated"]
              }
          ]
      }

   :reqjson bool async_query: Whether to query asynchronously
   :reqjson array balances: Array of balance objects to update

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "balances": [
                  {
                      "asset": "BTC",
                      "label": "Hardware Wallet",
                      "amount": "3.0",
                      "location": "blockchain",
                      "tags": ["hardware", "secure", "updated"]
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: Updated balance information
   :statuscode 200: Manual balance updated successfully
   :statuscode 400: Invalid balance data
   :statuscode 409: User not logged in or balance not found
   :statuscode 500: Internal server error

Delete Manual Balance
---------------------

.. http:delete:: /api/(version)/balances/manual

   Delete manually tracked balances.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      DELETE /api/1/balances/manual HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false,
          "labels": ["Hardware Wallet", "Cold Storage"]
      }

   :reqjson bool async_query: Whether to query asynchronously
   :reqjson array labels: Array of balance labels to delete

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Manual balances deleted successfully
   :statuscode 400: Invalid labels
   :statuscode 409: User not logged in or balances not found
   :statuscode 500: Internal server error

Trading Data
============

Get Trades
----------

.. http:get:: /api/(version)/trades

   Get trading history with optional filtering.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/trades HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "from_timestamp": 1609459200,
          "to_timestamp": 1640995200,
          "location": "kraken",
          "async_query": false,
          "only_cache": false
      }

   :reqjson int from_timestamp: Start timestamp for trade history
   :reqjson int to_timestamp: End timestamp for trade history
   :reqjson string location: Optional exchange location filter
   :reqjson bool async_query: Whether to query asynchronously
   :reqjson bool only_cache: Whether to use only cached data

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "entries": [
                  {
                      "trade_id": "trade_123",
                      "timestamp": 1609459200,
                      "location": "kraken",
                      "pair": "BTC_USD",
                      "trade_type": "buy",
                      "amount": "0.5",
                      "rate": "30000.00",
                      "fee": "15.00",
                      "fee_currency": "USD",
                      "link": "",
                      "notes": ""
                  }
              ],
              "entries_found": 1,
              "entries_limit": 500
          },
          "message": ""
      }

   :resjson object result: Trade history data with pagination info
   :statuscode 200: Trades retrieved successfully
   :statuscode 400: Invalid parameters
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Add Trade
---------

.. http:put:: /api/(version)/trades

   Add a new trade manually.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/trades HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "timestamp": 1609459200,
          "location": "external",
          "pair": "BTC_USD",
          "trade_type": "buy",
          "amount": "0.25",
          "rate": "32000.00",
          "fee": "8.00",
          "fee_currency": "USD",
          "link": "https://example.com/trade",
          "notes": "Manual trade entry"
      }

   :reqjson int timestamp: Trade timestamp
   :reqjson string location: Trade location/exchange
   :reqjson string pair: Trading pair (e.g., "BTC_USD")
   :reqjson string trade_type: "buy" or "sell"
   :reqjson string amount: Trade amount
   :reqjson string rate: Trade rate/price
   :reqjson string fee: Trade fee
   :reqjson string fee_currency: Fee currency
   :reqjson string link: Optional link to trade
   :reqjson string notes: Optional notes

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "trade_id": "trade_456"
          },
          "message": ""
      }

   :resjson object result: Contains the new trade ID
   :statuscode 200: Trade added successfully
   :statuscode 400: Invalid trade data
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Update Trade
------------

.. http:patch:: /api/(version)/trades

   Update an existing trade.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/trades HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "trade_id": "trade_456",
          "timestamp": 1609459200,
          "location": "external",
          "pair": "BTC_USD",
          "trade_type": "buy",
          "amount": "0.3",
          "rate": "32000.00",
          "fee": "9.60",
          "fee_currency": "USD",
          "link": "https://example.com/trade",
          "notes": "Updated trade entry"
      }

   :reqjson string trade_id: ID of trade to update
   :reqjson int timestamp: Trade timestamp
   :reqjson string location: Trade location/exchange
   :reqjson string pair: Trading pair
   :reqjson string trade_type: "buy" or "sell"
   :reqjson string amount: Trade amount
   :reqjson string rate: Trade rate/price
   :reqjson string fee: Trade fee
   :reqjson string fee_currency: Fee currency
   :reqjson string link: Optional link to trade
   :reqjson string notes: Optional notes

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Trade updated successfully
   :statuscode 400: Invalid trade data
   :statuscode 409: User not logged in or trade not found
   :statuscode 500: Internal server error

Delete Trade
------------

.. http:delete:: /api/(version)/trades

   Delete a trade.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      DELETE /api/1/trades HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "trade_id": "trade_456"
      }

   :reqjson string trade_id: ID of trade to delete

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Trade deleted successfully
   :statuscode 400: Invalid trade ID
   :statuscode 409: User not logged in or trade not found
   :statuscode 500: Internal server error

Get Asset Movements
-------------------

.. http:get:: /api/(version)/asset_movements

   Get asset movement history (deposits/withdrawals).

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/asset_movements HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "from_timestamp": 1609459200,
          "to_timestamp": 1640995200,
          "location": "kraken",
          "async_query": false,
          "only_cache": false
      }

   :reqjson int from_timestamp: Start timestamp
   :reqjson int to_timestamp: End timestamp
   :reqjson string location: Optional exchange location filter
   :reqjson bool async_query: Whether to query asynchronously
   :reqjson bool only_cache: Whether to use only cached data

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "entries": [
                  {
                      "identifier": "movement_123",
                      "location": "kraken",
                      "category": "deposit",
                      "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                      "transaction_id": "tx_456",
                      "timestamp": 1609459200,
                      "asset": "BTC",
                      "amount": "1.0",
                      "fee_asset": "BTC",
                      "fee": "0.0005",
                      "link": ""
                  }
              ],
              "entries_found": 1,
              "entries_limit": 500
          },
          "message": ""
      }

   :resjson object result: Asset movement history with pagination
   :statuscode 200: Asset movements retrieved successfully
   :statuscode 400: Invalid parameters
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Get Ledger Actions
------------------

.. http:get:: /api/(version)/ledgeractions

   Get ledger actions (income, expenses, etc.).

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/ledgeractions HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "from_timestamp": 1609459200,
          "to_timestamp": 1640995200,
          "location": "external",
          "async_query": false
      }

   :reqjson int from_timestamp: Start timestamp
   :reqjson int to_timestamp: End timestamp
   :reqjson string location: Optional location filter
   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "entries": [
                  {
                      "identifier": 1,
                      "timestamp": 1609459200,
                      "action_type": "income",
                      "location": "external",
                      "amount": "1000.00",
                      "asset": "USD",
                      "link": "",
                      "notes": "Salary payment"
                  }
              ],
              "entries_found": 1,
              "entries_limit": 500
          },
          "message": ""
      }

   :resjson object result: Ledger actions with pagination
   :statuscode 200: Ledger actions retrieved successfully
   :statuscode 400: Invalid parameters
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Add Ledger Action
-----------------

.. http:put:: /api/(version)/ledgeractions

   Add a new ledger action.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/ledgeractions HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "timestamp": 1609459200,
          "action_type": "income",
          "location": "external",
          "amount": "500.00",
          "asset": "USD",
          "link": "https://example.com/payment",
          "notes": "Freelance payment"
      }

   :reqjson int timestamp: Action timestamp
   :reqjson string action_type: Type of action (income, expense, etc.)
   :reqjson string location: Action location
   :reqjson string amount: Action amount
   :reqjson string asset: Asset involved
   :reqjson string link: Optional link
   :reqjson string notes: Optional notes

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "identifier": 2
          },
          "message": ""
      }

   :resjson object result: Contains the new action identifier
   :statuscode 200: Ledger action added successfully
   :statuscode 400: Invalid action data
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Update Ledger Action
--------------------

.. http:patch:: /api/(version)/ledgeractions

   Update an existing ledger action.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/ledgeractions HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "action": {
              "identifier": 2,
              "timestamp": 1609459200,
              "action_type": "income",
              "location": "external",
              "amount": "600.00",
              "asset": "USD",
              "link": "https://example.com/payment",
              "notes": "Updated freelance payment"
          }
      }

   :reqjson object action: Complete action object with identifier

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Ledger action updated successfully
   :statuscode 400: Invalid action data
   :statuscode 409: User not logged in or action not found
   :statuscode 500: Internal server error

Delete Ledger Action
--------------------

.. http:delete:: /api/(version)/ledgeractions

   Delete a ledger action.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      DELETE /api/1/ledgeractions HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "identifier": 2
      }

   :reqjson int identifier: Action identifier to delete

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Ledger action deleted successfully
   :statuscode 400: Invalid identifier
   :statuscode 409: User not logged in or action not found
   :statuscode 500: Internal server error

Blockchain Management
=====================

Get Blockchain Accounts
------------------------

.. http:get:: /api/(version)/blockchains/(blockchain)

   Get accounts for a specific blockchain.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH HTTP/1.1
      Host: localhost:4242
      Accept: application/json

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": [
              {
                  "address": "0x1234567890123456789012345678901234567890",
                  "label": "Main Wallet",
                  "tags": ["trading", "main"]
              }
          ],
          "message": ""
      }

   :resjson array result: List of blockchain accounts
   :statuscode 200: Accounts retrieved successfully
   :statuscode 400: Invalid blockchain
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Add Blockchain Accounts
------------------------

.. http:put:: /api/(version)/blockchains/(blockchain)

   Add new blockchain accounts.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PUT /api/1/blockchains/ETH HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "accounts": [
              {
                  "address": "0x9876543210987654321098765432109876543210",
                  "label": "DeFi Wallet",
                  "tags": ["defi", "yield"]
              }
          ],
          "async_query": false
      }

   :reqjson array accounts: Array of account objects to add
   :reqjson bool async_query: Whether to query asynchronously

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": [
              {
                  "address": "0x9876543210987654321098765432109876543210",
                  "label": "DeFi Wallet",
                  "tags": ["defi", "yield"]
              }
          ],
          "message": ""
      }

   :resjson array result: Added account information
   :statuscode 200: Accounts added successfully
   :statuscode 400: Invalid account data
   :statuscode 409: User not logged in or account already exists
   :statuscode 500: Internal server error

Update Blockchain Accounts
---------------------------

.. http:patch:: /api/(version)/blockchains/(blockchain)

   Update existing blockchain accounts.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      PATCH /api/1/blockchains/ETH HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "accounts": [
              {
                  "address": "0x1234567890123456789012345678901234567890",
                  "label": "Updated Main Wallet",
                  "tags": ["trading", "main", "updated"]
              }
          ]
      }

   :reqjson array accounts: Array of account objects to update

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": [
              {
                  "address": "0x1234567890123456789012345678901234567890",
                  "label": "Updated Main Wallet",
                  "tags": ["trading", "main", "updated"]
              }
          ],
          "message": ""
      }

   :resjson array result: Updated account information
   :statuscode 200: Accounts updated successfully
   :statuscode 400: Invalid account data
   :statuscode 409: User not logged in or account not found
   :statuscode 500: Internal server error

Delete Blockchain Accounts
---------------------------

.. http:delete:: /api/(version)/blockchains/(blockchain)

   Delete blockchain accounts.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      DELETE /api/1/blockchains/ETH HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "accounts": ["0x1234567890123456789012345678901234567890"],
          "async_query": false
      }

   :reqjson array accounts: Array of account addresses to delete
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
   :statuscode 200: Accounts deleted successfully
   :statuscode 400: Invalid account addresses
   :statuscode 409: User not logged in or accounts not found
   :statuscode 500: Internal server error

Get Ethereum Transactions
--------------------------

.. http:get:: /api/(version)/blockchains/ETH/transactions

   Get Ethereum transaction history.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/transactions HTTP/1.1
      Host: localhost:4242
      Content-Type: application/json

      {
          "async_query": false,
          "address": "0x1234567890123456789012345678901234567890",
          "from_timestamp": 1609459200,
          "to_timestamp": 1640995200,
          "only_cache": false
      }

   :reqjson bool async_query: Whether to query asynchronously
   :reqjson string address: Optional specific address filter
   :reqjson int from_timestamp: Start timestamp
   :reqjson int to_timestamp: End timestamp
   :reqjson bool only_cache: Whether to use only cached data

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": {
              "entries": [
                  {
                      "tx_hash": "0xabc123...",
                      "timestamp": 1609459200,
                      "block_number": 11500000,
                      "from_address": "0x1234...",
                      "to_address": "0x5678...",
                      "value": "1000000000000000000",
                      "gas": "21000",
                      "gas_price": "20000000000",
                      "gas_used": "21000",
                      "input_data": "0x",
                      "nonce": 42
                  }
              ],
              "entries_found": 1,
              "entries_limit": 500
          },
          "message": ""
      }

   :resjson object result: Transaction history with pagination
   :statuscode 200: Transactions retrieved successfully
   :statuscode 400: Invalid parameters
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Delete Ethereum Transaction Data
---------------------------------

.. http:delete:: /api/(version)/blockchains/ETH/transactions

   Delete cached Ethereum transaction data.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      DELETE /api/1/blockchains/ETH/transactions HTTP/1.1
      Host: localhost:4242

   **Example Response**:

   .. sourcecode:: http

      HTTP/1.1 200 OK
      Content-Type: application/json

      {
          "result": true,
          "message": ""
      }

   :resjson bool result: Success indicator
   :statuscode 200: Transaction data deleted successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Get Ethereum Airdrops
----------------------

.. http:get:: /api/(version)/blockchains/ETH/airdrops

   Get Ethereum airdrop information.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH/airdrops HTTP/1.1
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
              "airdrops": [
                  {
                      "address": "0x1234...",
                      "asset": "UNI",
                      "amount": "400",
                      "timestamp": 1600300800,
                      "source": "uniswap"
                  }
              ]
          },
          "message": ""
      }

   :resjson object result: Airdrop information
   :statuscode 200: Airdrops retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Get ETH2 Stake Deposits
------------------------

.. http:get:: /api/(version)/blockchains/ETH2/stake/deposits

   Get ETH2 staking deposit information.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH2/stake/deposits HTTP/1.1
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
                  "from_address": "0x1234...",
                  "pubkey": "0xabcd...",
                  "withdrawal_credentials": "0x5678...",
                  "value": "32000000000000000000",
                  "validator_index": 12345,
                  "tx_hash": "0xdef456...",
                  "timestamp": 1609459200
              }
          ],
          "message": ""
      }

   :resjson array result: ETH2 deposit information
   :statuscode 200: Deposits retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error

Get ETH2 Stake Details
-----------------------

.. http:get:: /api/(version)/blockchains/ETH2/stake/details

   Get detailed ETH2 staking information.

   **Example Request**:

   .. http:example:: curl wget httpie python-requests

      GET /api/1/blockchains/ETH2/stake/details HTTP/1.1
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
                  "validator_index": 12345,
                  "public_key": "0xabcd...",
                  "status": "active_ongoing",
                  "balance": "32100000000000000000",
                  "performance_1d": "0.01",
                  "performance_1w": "0.07",
                  "performance_1m": "0.30",
                  "performance_1y": "3.65"
              }
          ],
          "message": ""
      }

   :resjson array result: Detailed staking information
   :statuscode 200: Stake details retrieved successfully
   :statuscode 409: User not logged in
   :statuscode 500: Internal server error 