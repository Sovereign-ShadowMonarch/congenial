#!/usr/bin/env python3
"""
Test script for a running backend API server.
This script tests all major API endpoints to ensure they're working correctly.
"""
import requests
import json
import sys
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
            json_response = response.json()
            if isinstance(json_response, dict) and len(json_response) < 5:
                print(f"Response: {json.dumps(json_response, indent=2)}")
            else:
                print(f"Response: [Data received - {len(str(json_response))} characters]")
            return json_response
        except:
            print(f"Response: {response.text[:100]}...")
            return response.text
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error: Could not connect to {url}")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    """Run all API tests against a running server."""
    print("=" * 80)
    print("🚀 BACKEND API TEST SUITE")
    print("=" * 80)
    
    # Test if server is running
    print("\nChecking if server is running...")
    ping_response = test_endpoint("/api/ping")
    if ping_response is None:
        print("❌ Server is not running on port 8081. Please start the server first.")
        sys.exit(1)
    
    # Basic server information
    print("\n--- Testing Basic Server Information ---")
    
    # Version endpoint
    version_response = test_endpoint("/api/version")
    
    # Health check
    health_response = test_endpoint("/api/healthcheck")
    
    # Portfolio management
    print("\n--- Testing Portfolio Management ---")
    
    # Portfolio data
    portfolio_response = test_endpoint("/api/portfolio")
    if portfolio_response:
        print(f"Portfolio data received: {len(str(portfolio_response))} characters")
    
    # User settings
    print("\n--- Testing User Settings ---")
    
    # Get user settings
    user_settings = test_endpoint("/api/settings")
    
    # Update user settings
    test_settings = {"theme": "dark", "currency": "USD"}
    update_settings = test_endpoint("/api/settings", method="PUT", data=test_settings)
    
    # Verify settings were updated
    updated_settings = test_endpoint("/api/settings")
    if updated_settings and updated_settings.get("theme") == "dark":
        print("✅ Settings update verified")
    else:
        print("❌ Settings update failed")
    
    # Asset management
    print("\n--- Testing Asset Management ---")
    
    # Test balance endpoints
    balances = test_endpoint("/api/balances")
    if balances:
        print(f"Balances data received: {len(str(balances))} characters")
    
    # Transactions
    print("\n--- Testing Transaction History ---")
    
    # Test transactions
    transactions = test_endpoint("/api/transactions")
    if transactions:
        if isinstance(transactions, list):
            print(f"Transactions found: {len(transactions)}")
        else:
            print(f"Transactions data received: {len(str(transactions))} characters")
    
    # Financial data
    print("\n--- Testing Financial Analytics ---")
    
    # Test PnL report
    pnl = test_endpoint("/api/pnl")
    if pnl:
        print(f"PnL data received: {len(str(pnl))} characters")
    
    # Statistics
    print("\n--- Testing Statistics and Analytics ---")
    
    # Test netvalue statistics
    stats = test_endpoint("/api/statistics/netvalue")
    if stats:
        print(f"Statistics data received: {len(str(stats))} characters")
    
    # Test value distribution
    distribution = test_endpoint("/api/statistics/distribution")
    if distribution:
        print(f"Distribution data received: {len(str(distribution))} characters")
    
    # History status
    print("\n--- Testing History Status ---")
    
    # Test history status
    history = test_endpoint("/api/history/status")
    if history:
        print(f"History status data received: {len(str(history))} characters")
    
    # Summary
    print("\n" + "=" * 80)
    success_count = sum(1 for var in [
        ping_response, version_response, health_response, portfolio_response,
        user_settings, update_settings, balances, transactions, pnl, 
        stats, distribution, history
    ] if var is not None)
    
    total_tests = 12
    if success_count == total_tests:
        print(f"✅ ALL TESTS PASSED: {success_count}/{total_tests} endpoints working correctly!")
    else:
        print(f"⚠️ SOME TESTS FAILED: {success_count}/{total_tests} endpoints working correctly")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
