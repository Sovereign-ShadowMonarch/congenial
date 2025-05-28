#!/usr/bin/env python
"""
Enhanced test script that implements all the required API endpoints.
This script creates a more complete Flask API server that mimics the full functionality
without requiring all the dependencies.
"""
import json
import sys
import datetime
import uuid
import time
import random
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from flask_restful import Api, Resource

app = Flask(__name__)
CORS(app)
api = Api(app, prefix='/api/1')

# In-memory storage for demo data
USERS = {'default': {'logged_in': True}}
BLOCKCHAINS = []
EXCHANGES = []
BALANCES = {}
TRANSACTIONS = []
SNAPSHOTS = []

# Mock data for charts and statistics
def generate_mock_balances():
    coins = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'DOGE', 'AVAX']
    balances = {}
    total_value = 0
    
    for coin in coins:
        amount = round(random.uniform(0.1, 10) * (100 if coin == 'DOGE' else 1), 6)
        price = random.uniform(
            {'BTC': 55000, 'ETH': 3000, 'USDT': 1, 'BNB': 300, 'SOL': 100, 
             'ADA': 1.2, 'XRP': 0.8, 'DOT': 30, 'DOGE': 0.1, 'AVAX': 80}[coin],
            {'BTC': 60000, 'ETH': 3500, 'USDT': 1, 'BNB': 350, 'SOL': 120, 
             'ADA': 1.5, 'XRP': 1.0, 'DOT': 35, 'DOGE': 0.15, 'AVAX': 100}[coin]
        )
        usd_value = amount * price
        total_value += usd_value
        balances[coin] = {
            'amount': amount,
            'usd_value': usd_value,
            'price': price
        }
    
    return balances, total_value

# Generate initial mock data
BALANCES, TOTAL_VALUE = generate_mock_balances()

# Historical net worth data for charts
def generate_historical_networth(days=30):
    base_value = TOTAL_VALUE
    today = datetime.datetime.now()
    result = []
    
    for i in range(days):
        date = today - datetime.timedelta(days=days-i-1)
        # Add some randomness to create realistic chart data
        daily_change = random.uniform(-0.05, 0.05)  # -5% to +5% daily change
        value = base_value * (1 + (daily_change * i/3))  # Gradual trend with daily fluctuations
        result.append({
            'timestamp': int(date.timestamp()),
            'date': date.strftime('%Y-%m-%d'),
            'usd_value': round(value, 2)
        })
    
    return result

HISTORICAL_NETWORTH = generate_historical_networth()

# API Endpoints
class VersionResource(Resource):
    def get(self):
        """Return the API version information"""
        return jsonify({
            'result': {
                'version': '1.14.2',
                'api_version': '1',
                'backend_state': 'running'
            },
            'message': ''
        })

class PingResource(Resource):
    def get(self):
        """Simple ping endpoint"""
        return jsonify({
            'result': 'pong',
            'message': ''
        })

class UsersResource(Resource):
    def get(self):
        """List users and their login state"""
        return jsonify({
            'result': USERS,
            'message': ''
        })
    
    def put(self):
        """Create a new user"""
        data = request.get_json()
        username = data.get('name', 'default')
        password = data.get('password', '')
        
        if username in USERS:
            return jsonify({
                'result': False,
                'message': 'User already exists'
            })
        
        USERS[username] = {'logged_in': True}
        return jsonify({
            'result': True,
            'message': 'User created successfully'
        })

class BlockchainsResource(Resource):
    def get(self):
        """List all registered wallet addresses"""
        return jsonify({
            'result': BLOCKCHAINS,
            'message': ''
        })
    
    def post(self):
        """Register a new wallet address"""
        data = request.get_json()
        blockchain = data.get('blockchain', 'ETH')
        address = data.get('address', '')
        label = data.get('label', '')
        
        new_wallet = {
            'id': str(uuid.uuid4()),
            'blockchain': blockchain,
            'address': address,
            'label': label
        }
        
        BLOCKCHAINS.append(new_wallet)
        return jsonify({
            'result': new_wallet,
            'message': 'Wallet added successfully'
        })
    
    def delete(self):
        """Remove a wallet address"""
        data = request.get_json()
        wallet_id = data.get('id', '')
        
        for i, wallet in enumerate(BLOCKCHAINS):
            if wallet.get('id') == wallet_id:
                del BLOCKCHAINS[i]
                return jsonify({
                    'result': True,
                    'message': 'Wallet removed successfully'
                })
        
        return jsonify({
            'result': False,
            'message': 'Wallet not found'
        })

class ExchangesResource(Resource):
    def get(self):
        """List all exchange API keys"""
        # Don't return actual secrets in response
        sanitized = []
        for exchange in EXCHANGES:
            sanitized.append({
                'id': exchange['id'],
                'name': exchange['name'],
                'api_key': exchange['api_key'],
                'api_secret': '**********'  # Hide actual secret
            })
        
        return jsonify({
            'result': sanitized,
            'message': ''
        })
    
    def post(self):
        """Add a new exchange key"""
        data = request.get_json()
        name = data.get('name', '')
        api_key = data.get('api_key', '')
        api_secret = data.get('api_secret', '')
        
        new_exchange = {
            'id': str(uuid.uuid4()),
            'name': name,
            'api_key': api_key,
            'api_secret': api_secret
        }
        
        EXCHANGES.append(new_exchange)
        return jsonify({
            'result': {
                'id': new_exchange['id'],
                'name': new_exchange['name'],
                'api_key': new_exchange['api_key'],
                'api_secret': '**********'  # Hide actual secret
            },
            'message': 'Exchange added successfully'
        })
    
    def delete(self):
        """Remove an exchange key"""
        data = request.get_json()
        exchange_id = data.get('id', '')
        
        for i, exchange in enumerate(EXCHANGES):
            if exchange.get('id') == exchange_id:
                del EXCHANGES[i]
                return jsonify({
                    'result': True,
                    'message': 'Exchange removed successfully'
                })
        
        return jsonify({
            'result': False,
            'message': 'Exchange not found'
        })

class BalancesAllResource(Resource):
    def get(self):
        """Get all balances"""
        result = {
            'assets': BALANCES,
            'total_usd_value': TOTAL_VALUE,
            'timestamp': int(time.time())
        }
        
        return jsonify({
            'result': result,
            'message': ''
        })

class BalanceSnapshotResource(Resource):
    def post(self):
        """Trigger a balance snapshot"""
        snapshot = {
            'id': str(uuid.uuid4()),
            'timestamp': int(time.time()),
            'assets': BALANCES,
            'total_usd_value': TOTAL_VALUE
        }
        
        SNAPSHOTS.append(snapshot)
        return jsonify({
            'result': snapshot,
            'message': 'Snapshot created successfully'
        })

class PnLReportResource(Resource):
    def get(self):
        """Get P&L report"""
        report = {}
        for asset, data in BALANCES.items():
            # Generate random cost basis and P&L data
            cost_basis = data['usd_value'] * random.uniform(0.7, 1.3)
            unrealized_pnl = data['usd_value'] - cost_basis
            realized_pnl = cost_basis * random.uniform(-0.2, 0.4)
            
            report[asset] = {
                'cost_basis': round(cost_basis, 2),
                'current_value': round(data['usd_value'], 2),
                'unrealized_pnl': round(unrealized_pnl, 2),
                'unrealized_pnl_percent': round((unrealized_pnl / cost_basis) * 100 if cost_basis else 0, 2),
                'realized_pnl': round(realized_pnl, 2)
            }
        
        return jsonify({
            'result': report,
            'message': ''
        })

class NetValueResource(Resource):
    def get(self):
        """Get net value time series data"""
        from_date = request.args.get('from', '')
        to_date = request.args.get('to', '')
        
        # Filter by date if provided
        filtered_data = HISTORICAL_NETWORTH
        if from_date and to_date:
            try:
                from_timestamp = datetime.datetime.strptime(from_date, '%Y-%m-%d').timestamp()
                to_timestamp = datetime.datetime.strptime(to_date, '%Y-%m-%d').timestamp()
                
                filtered_data = [d for d in HISTORICAL_NETWORTH 
                               if from_timestamp <= d['timestamp'] <= to_timestamp]
            except:
                pass
        
        return jsonify({
            'result': filtered_data,
            'message': ''
        })

class ValueDistributionResource(Resource):
    def get(self):
        """Get value distribution data"""
        distribution = []
        for asset, data in BALANCES.items():
            distribution.append({
                'asset': asset,
                'usd_value': data['usd_value'],
                'percentage': (data['usd_value'] / TOTAL_VALUE) * 100
            })
        
        return jsonify({
            'result': distribution,
            'message': ''
        })

class TransactionsResource(Resource):
    def get(self):
        """Get transaction history"""
        # Generate mock transactions if none exist
        if not TRANSACTIONS:
            assets = list(BALANCES.keys())
            for i in range(20):
                timestamp = int(time.time()) - random.randint(0, 60*60*24*30)  # Random time in last 30 days
                asset = random.choice(assets)
                tx_type = random.choice(['buy', 'sell', 'transfer'])
                amount = round(random.uniform(0.01, 1.0), 6)
                
                TRANSACTIONS.append({
                    'id': str(uuid.uuid4()),
                    'timestamp': timestamp,
                    'date': datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S'),
                    'asset': asset,
                    'type': tx_type,
                    'amount': amount,
                    'usd_value': amount * BALANCES[asset]['price'],
                    'fee': round(random.uniform(0.001, 0.01), 6),
                    'source': random.choice(['binance', 'coinbase', 'metamask'])
                })
        
        # Paginate results
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        start = (page - 1) * limit
        end = start + limit
        
        return jsonify({
            'result': {
                'entries': TRANSACTIONS[start:end],
                'total': len(TRANSACTIONS),
                'page': page,
                'limit': limit,
                'pages': (len(TRANSACTIONS) + limit - 1) // limit
            },
            'message': ''
        })

class HistoryStatusResource(Resource):
    def get(self):
        """Get history sync status"""
        return jsonify({
            'result': {
                'percentage_complete': 100,
                'processing_state': 'completed',
                'blocks_processed': 15_000_000,
                'transactions_processed': 1_234,
                'last_updated': int(time.time())
            },
            'message': ''
        })

class OracleCreateCacheResource(Resource):
    def post(self):
        """Pre-seed historical price cache"""
        return jsonify({
            'result': {
                'task_id': str(uuid.uuid4()),
                'status': 'scheduled',
                'message': 'Price cache creation scheduled'
            },
            'message': ''
        })

# Add resources to API
api.add_resource(VersionResource, '/version')
api.add_resource(PingResource, '/ping')
api.add_resource(UsersResource, '/users')
api.add_resource(BlockchainsResource, '/blockchains')
api.add_resource(ExchangesResource, '/exchanges')
api.add_resource(BalancesAllResource, '/balances/all')
api.add_resource(BalanceSnapshotResource, '/balances/snapshot')
api.add_resource(PnLReportResource, '/pnl_report')
api.add_resource(NetValueResource, '/statistics/netvalue')
api.add_resource(ValueDistributionResource, '/statistics/value_distribution')
api.add_resource(TransactionsResource, '/transactions')
api.add_resource(HistoryStatusResource, '/history/status')
api.add_resource(OracleCreateCacheResource, '/oracle/cache/create')

# Simple WebSocket emulation using Server-Sent Events
@app.route('/ws')
def websocket():
    def generate():
        yield 'data: {"type":"connected","message":"WebSocket connected"}\n\n'
        time.sleep(1)
        # Send a balance snapshot event
        yield f'data: {{"type":"balance_snapshot","data":{json.dumps({"assets": BALANCES, "total_usd_value": TOTAL_VALUE})}}}\n\n'
        time.sleep(1)
        # Send a PNL snapshot event with random data
        yield 'data: {"type":"pnl_snapshot","data":{"status":"completed"}}\n\n'
    
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    print("Starting enhanced API server with ALL endpoints...")
    print("API will be available at: http://127.0.0.1:5042/api/1/")
    print("Available endpoints:")
    print("  - GET  /api/1/ping")
    print("  - GET  /api/1/version")
    print("  - GET  /api/1/users")
    print("  - PUT  /api/1/users")
    print("  - GET  /api/1/blockchains")
    print("  - POST /api/1/blockchains")
    print("  - DELETE /api/1/blockchains")
    print("  - GET  /api/1/exchanges")
    print("  - POST /api/1/exchanges")
    print("  - DELETE /api/1/exchanges")
    print("  - GET  /api/1/balances/all")
    print("  - POST /api/1/balances/snapshot")
    print("  - GET  /api/1/pnl_report")
    print("  - GET  /api/1/statistics/netvalue")
    print("  - GET  /api/1/statistics/value_distribution")
    print("  - GET  /api/1/transactions")
    print("  - GET  /api/1/history/status")
    print("  - POST /api/1/oracle/cache/create")
    print("  - WS   ws://localhost:5042/ (emulated with SSE at /ws)")
    print("\nPress CTRL+C to stop the server")
    
    # Run the Flask server
    app.run(host='127.0.0.1', port=5042, debug=True)
