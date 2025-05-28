#!/usr/bin/env python
"""
Minimal test script to check if the backend API server can start.
This script creates a simple Flask API server that mimics the core functionality
but doesn't require all the dependencies.
"""
import json
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource

app = Flask(__name__)
CORS(app)
api = Api(app, prefix='/api/1')

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

# Add resources to API
api.add_resource(VersionResource, '/version')
api.add_resource(PingResource, '/ping')

if __name__ == '__main__':
    print("Starting minimal test API server...")
    print("API will be available at:")
    print("  - http://127.0.0.1:5042/api/1/version")
    print("  - http://127.0.0.1:5042/api/1/ping")
    print("\nPress CTRL+C to stop the server")
    
    # Run the Flask server
    app.run(host='127.0.0.1', port=5042, debug=True)
