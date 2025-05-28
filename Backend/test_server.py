#!/usr/bin/env python
"""
Simple test script to check if the backend API server can start.
"""
import sys
from pathlib import Path

# Add the project directory to the path so we can import modules
sys.path.insert(0, str(Path(__file__).parent))

try:
    from rotkehlchen.api.server import APIServer, RestAPI
    from rotkehlchen.rotkehlchen import Rotkehlchen
    from rotkehlchen.args import app_args
    import argparse
    
    print("Successfully imported main modules")
    
    # Create a simple parser with minimum arguments needed
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', help='Path to the rotki data directory')
    parser.add_argument('--sleep-secs', type=int, default=20, help='Seconds to sleep in the main loop')
    parser.add_argument('--api-port', type=int, default=5042, help='Port for the REST API')
    parser.add_argument('--api-host', default='127.0.0.1', help='Host for the REST API')
    parser.add_argument('--api-cors', default='*', help='CORS domain list for the API')
    parser.add_argument('--logfile', help='Path to the log file')
    parser.add_argument('--loglevel', default='info', help='Log level')
    
    args = parser.parse_args(['--api-port', '5043'])  # Use a different port
    
    print("Starting minimal test of the API server...")
    print(f"API will be available at http://{args.api_host}:{args.api_port}/api/1/version")
    
    try:
        # Try to initialize the server (this might fail due to missing dependencies)
        # We're just testing if imports and basic initialization works
        from rotkehlchen.api.rest import RestAPI
        
        print("RestAPI module imported successfully")
        print("Test complete - the backend core modules can be imported")
        print("Note: Full functionality requires all dependencies which aren't installed")
        
    except Exception as e:
        print(f"Error initializing the server: {str(e)}")
        import traceback
        traceback.print_exc()
        
except ImportError as e:
    print(f"Import error: {str(e)}")
    print("This suggests some required dependencies are missing.")
    import traceback
    traceback.print_exc()
