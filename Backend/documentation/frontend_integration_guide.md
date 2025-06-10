# Frontend Integration Guide

This document provides comprehensive information for developing a frontend application that integrates with the Backend API. It covers authentication, API endpoints, data models, and best practices.

## Table of Contents
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Asynchronous Operations](#asynchronous-operations)
- [CORS Configuration](#cors-configuration)
- [Example Integration](#example-integration)
- [Best Practices](#best-practices)

## API Overview

The Backend exposes a RESTful API that follows these conventions:

- Base URL: `http://<host>:4242/api/1/`
- All API endpoints accept and return JSON data
- Standard HTTP methods are used (GET, POST, PUT, PATCH, DELETE)
- All responses follow a consistent format
- Authentication is required for most endpoints

### Response Format

All endpoints wrap their response in the following JSON structure:

```json
{
    "result": <data>,
    "message": ""
}
```

For successful responses, `"result"` contains the data and `"message"` is empty.
For failed responses, `"result"` is `null` and `"message"` contains error information.

## Authentication

The Backend API uses a session-based authentication system:

1. **Create a user** (if needed):
   ```
   PUT /api/1/users
   {
       "name": "username",
       "password": "secure_password",
       "initial_settings": {
           "submit_usage_analytics": false
       }
   }
   ```

2. **Login to create a session**:
   ```
   PATCH /api/1/users/username
   {
       "action": "login",
       "password": "secure_password"
   }
   ```

3. **Sessions are maintained via cookies** - the backend will set cookies that need to be included in subsequent requests.

4. **Logout when done**:
   ```
   PATCH /api/1/users/username
   {
       "action": "logout"
   }
   ```

## API Endpoints

The Backend exposes 73 API endpoints categorized as follows:

### User Management
- `GET /api/1/users` - List all users
- `PUT /api/1/users` - Create a new user
- `PATCH /api/1/users/{username}` - Login/logout/update user
- `DELETE /api/1/users/{username}` - Delete a user
- `PATCH /api/1/users/{username}/password` - Change user password
- `GET /api/1/settings` - Get user settings
- `PUT /api/1/settings` - Update user settings

### Asset Data
- `GET /api/1/assets` - Get owned assets
- `GET /api/1/assets/all` - Get all supported assets
- `GET /api/1/assets/ethereum` - Get Ethereum tokens
- `GET /api/1/assets/prices/current` - Get current asset prices
- `GET /api/1/assets/prices/historical` - Get historical asset prices
- `GET /api/1/assets/ignored` - Get ignored assets
- `PUT /api/1/assets/ignored` - Add ignored assets
- `DELETE /api/1/assets/ignored` - Remove ignored assets

### Balances
- `GET /api/1/balances` - Get all balances
- `GET /api/1/balances/exchanges/{exchange}` - Get exchange balances
- `GET /api/1/balances/blockchain` - Get blockchain balances
- `GET /api/1/balances/manual` - Get manually tracked balances
- `PUT /api/1/balances/manual` - Add manual balances
- `PATCH /api/1/balances/manual` - Update manual balances
- `DELETE /api/1/balances/manual` - Delete manual balances

### Trades and Movements
- `GET /api/1/trades` - Get trades
- `PUT /api/1/trades` - Add a trade
- `PATCH /api/1/trades` - Edit a trade
- `DELETE /api/1/trades` - Delete a trade
- `GET /api/1/movements` - Get asset movements

### Blockchain Data
- `GET /api/1/blockchains/{blockchain}` - Get blockchain accounts
- `PUT /api/1/blockchains/{blockchain}` - Add blockchain accounts
- `PATCH /api/1/blockchains/{blockchain}` - Edit blockchain accounts
- `DELETE /api/1/blockchains/{blockchain}` - Delete blockchain accounts
- `GET /api/1/blockchains/ETH/transactions` - Get Ethereum transactions

### Statistics
- `GET /api/1/statistics/netvalue` - Get net value over time
- `GET /api/1/statistics/asset_balance` - Get asset balance over time
- `GET /api/1/statistics/value_distribution` - Get value distribution

### System
- `GET /api/1/version` - Get version information
- `GET /api/1/ping` - Check API availability
- `GET /api/1/tasks/{task_id}` - Check status of async task

For a complete list of all API endpoints with request/response formats, see `backend_api_comprehensive.rst` and `backend_api_comprehensive_part2.rst` in the documentation directory.

## Data Models

Key data models you'll need to work with:

### Asset
An asset represents a currency or token:
```json
{
    "identifier": "BTC",
    "name": "Bitcoin",
    "symbol": "BTC",
    "type": "own chain"
}
```

### Balance
Balance information for an asset:
```json
{
    "amount": "5.5",
    "usd_value": "275000.0" 
}
```

### Trade
A trading transaction:
```json
{
    "trade_id": "1234567",
    "timestamp": 1588664668,
    "location": "kraken",
    "pair": "BTC_ETH",
    "trade_type": "buy",
    "amount": "5.5",
    "rate": "0.0655",
    "fee": "0.001",
    "fee_currency": "BTC",
    "link": "",
    "notes": "Example trade"
}
```

## Error Handling

The API uses standard HTTP status codes:
- `200 OK` - Successful operation
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Server Error` - Backend error

Error responses include a descriptive message:
```json
{
    "result": null,
    "message": "User not found: username"
}
```

## Asynchronous Operations

Some endpoints support asynchronous execution for long-running operations:

1. Add `"async_query": true` to the request body
2. The endpoint returns immediately with a task ID:
   ```json
   {
       "result": {"task_id": 123},
       "message": ""
   }
   ```
3. Poll the task status with `GET /api/1/tasks/123`
4. Once complete, get the full result from the task response

## CORS Configuration

The Backend is configured with CORS to allow cross-origin requests from specific origins. By default, it allows requests from `http://localhost:3000`.

To change the allowed origin:
- In local development: Use the `--api-cors` command-line option
- In Docker: Set the `CORS_ORIGIN` environment variable

Multiple origins can be specified with a comma-separated list: `http://localhost:3000,https://example.com`

## Example Integration

### Frontend Setup (React Example)

```javascript
// api.js - API client setup
const API_BASE = 'http://localhost:4242/api/1';

async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Important for cookies/sessions
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });
  
  const data = await response.json();
  
  if (response.ok) {
    return data.result;
  } else {
    throw new Error(data.message || 'Unknown error');
  }
}

// Authentication
export async function login(username, password) {
  return fetchApi(`/users/${username}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'login',
      password
    })
  });
}

// Get asset balances
export async function getBalances() {
  return fetchApi('/balances');
}

// Add a trade
export async function addTrade(tradeData) {
  return fetchApi('/trades', {
    method: 'PUT',
    body: JSON.stringify(tradeData)
  });
}

// Run async task
export async function runAsyncTask(endpoint, params) {
  const taskResponse = await fetchApi(endpoint, {
    method: 'GET',
    body: JSON.stringify({
      ...params,
      async_query: true
    })
  });
  
  const taskId = taskResponse.task_id;
  
  // Poll for task completion
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const status = await fetchApi(`/tasks/${taskId}`);
        if (status.state === 'completed') {
          clearInterval(interval);
          resolve(status.result);
        } else if (status.state === 'failed') {
          clearInterval(interval);
          reject(new Error(status.error));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 1000);
  });
}
```

## Best Practices

1. **Authentication Management**
   - Store authentication state in a global state manager (Redux, Context API)
   - Implement proper logout on session expiration
   - Consider refreshing user data periodically

2. **Error Handling**
   - Implement global error handling for API requests
   - Show meaningful error messages to users
   - Add retry logic for network failures

3. **Performance**
   - Use pagination where available (especially for large datasets)
   - Cache responses where appropriate
   - Use asynchronous requests for long-running operations

4. **State Management**
   - Keep a normalized store of entities (assets, balances, trades)
   - Implement optimistic updates for better UX
   - Periodically refresh critical data

5. **Security**
   - Never store passwords in local storage
   - Implement proper session timeout handling
   - Use HTTPS in production

6. **Testing**
   - Use the `/api/1/ping` endpoint for health checks
   - Implement a mock API for testing
   - Test both success and error paths

## API Dependencies

The Backend depends on various external services. When implementing a frontend, be aware that:

1. Some API endpoints may be slow due to external service dependencies
2. Rate limiting might affect certain operations
3. Network errors from external services can propagate to API responses

Consider implementing appropriate loading states, error handling, and retry logic to provide a smooth user experience.

## Development Workflow

For efficient frontend development:

1. Run the Backend locally or via Docker
2. Set up proper CORS configuration
3. Use the test endpoints script to validate API functionality
4. Implement incremental features based on API capabilities
5. Test thoroughly with varying network conditions
