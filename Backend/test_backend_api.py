#!/usr/bin/env python3
"""
Comprehensive test script for backend API endpoints.
This script tests all major API endpoints to ensure they're working correctly.
"""
import requests
import json
import sys
import subprocess
import time
import os
import signal
from pprint import pprint

BASE_URL = "http://localhost:8081"

def test_endpoint(endpoint, method="GET", data=None, expected_status=200):
    """Test an API endpoint and return the response."""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🔍 Testing {method} {url}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url, json=data)
        else:
            print(f"❌ Unsupported method: {method}")
            return None
        
        # Check status code
        if response.status_code == expected_status:
            print(f"✅ Status: {response.status_code}")
        else:
            print(f"❌ Status: {response.status_code} (expected {expected_status})")
        
        # Return the JSON response if available
        try:
            return response.json()
        except:
            return response.text
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error: Could not connect to {url}")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def start_server():
    """Start the backend server as a subprocess and return the process object."""
    print("Starting backend server...")
    server_process = subprocess.Popen(
        ["python", "simple_backend.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    
    # Wait for server to start
    print("Waiting for server to start...")
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{BASE_URL}/api/ping")
            if response.status_code == 200:
                print(f"✅ Server started successfully after {attempt + 1} attempts")
                return server_process
        except requests.exceptions.ConnectionError:
            print(f"Attempt {attempt + 1}/{max_attempts}: Server not ready yet, waiting...")
            time.sleep(1)
    
    print("❌ Failed to start server after multiple attempts")
    if server_process:
        server_process.terminate()
    return None

def main():
    """Run all API tests."""
    print("=" * 80)
    print("🚀 BACKEND API TEST SUITE")
    print("=" * 80)
    
    # Start server
    server_process = start_server()
    if not server_process:
        print("❌ Could not start server. Exiting.")
        sys.exit(1)
    
    try:
        # Test if server is running
        ping_response = test_endpoint("/api/ping")
        if ping_response is None:
            print("❌ Server is not responding to ping. Exiting.")
            sys.exit(1)
        
        # Version endpoint
        version_response = test_endpoint("/api/version")
        print("Version info:", json.dumps(version_response, indent=2) if version_response else "N/A")
        
        # Health check
        health_response = test_endpoint("/api/healthcheck")
        print("Health check:", json.dumps(health_response, indent=2) if health_response else "N/A")
        
        # Portfolio data
        portfolio_response = test_endpoint("/api/portfolio")
        if portfolio_response:
            print("Portfolio contains data:", bool(portfolio_response))
        
        # User settings
        user_settings = test_endpoint("/api/settings")
        print("User settings:", json.dumps(user_settings, indent=2) if user_settings else "N/A")
        
        # Test updating settings
        test_settings = {"theme": "dark", "currency": "USD"}
        update_settings = test_endpoint("/api/settings", method="PUT", data=test_settings)
        print("Updated settings:", json.dumps(update_settings, indent=2) if update_settings else "N/A")
        
        # Verify settings were updated
        updated_settings = test_endpoint("/api/settings")
        if updated_settings:
            if updated_settings.get("theme") == "dark":
                print("✅ Settings update verified")
            else:
                print("❌ Settings update failed")
        
        # Test balance endpoints
        balances = test_endpoint("/api/balances")
        print("Balances data available:", bool(balances))
        
        # Test transactions
        transactions = test_endpoint("/api/transactions")
        if transactions:
            print(f"Transactions found: {len(transactions) if isinstance(transactions, list) else 'N/A'}")
        
        # Test PnL report
        pnl = test_endpoint("/api/pnl")
        print("PnL data available:", bool(pnl))
        
        # Test netvalue statistics
        stats = test_endpoint("/api/statistics/netvalue")
        print("Statistics data available:", bool(stats))
        
        # Test value distribution
        distribution = test_endpoint("/api/statistics/distribution")
        print("Distribution data available:", bool(distribution))
        
        # Test history status
        history = test_endpoint("/api/history/status")
        print("History status data available:", bool(history))
        
        # Summary of test results
        print("\n" + "=" * 80)
        print("✅ API TEST COMPLETE - All endpoints tested")
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
    finally:
        # Clean up: terminate the server process
        if server_process:
            print("\nShutting down server...")
            server_process.terminate()
            server_process.wait(timeout=5)
            print("Server shut down successfully")

if __name__ == "__main__":
    main()
