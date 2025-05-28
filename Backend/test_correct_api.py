#!/usr/bin/env python3
"""
Comprehensive test script for backend API endpoints with correct paths.
This script tests all major API endpoints to ensure they're working correctly.
"""
import requests
import json
import sys
import time
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
            if isinstance(json_response, dict) and len(str(json_response)) < 500:
                print(f"Response: {json.dumps(json_response, indent=2)}")
            elif isinstance(json_response, list) and len(json_response) < 5:
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
    print("🚀 BACKEND API TEST SUITE (CORRECT ENDPOINTS)")
    print("=" * 80)
    
    test_results = {}
    
    # Test if server is running
    print("\nChecking if server is running...")
    ping_response = test_endpoint("/api/1/ping")
    test_results["ping"] = ping_response is not None and ping_response.get("result") == "pong"
    
    # Basic server information
    print("\n--- Testing Basic Server Information ---")
    
    # Version endpoint
    version_response = test_endpoint("/api/version")
    test_results["version"] = version_response is not None
    
    # Health check
    health_response = test_endpoint("/api/health")
    test_results["health"] = health_response is not None
    
    # Portfolio management
    print("\n--- Testing Portfolio Management ---")
    
    # Portfolio data
    portfolio_response = test_endpoint("/api/portfolio")
    test_results["portfolio"] = portfolio_response is not None
    
    # User settings
    print("\n--- Testing User Settings ---")
    
    # Get user settings
    user_settings = test_endpoint("/api/user/settings")
    test_results["user_settings_get"] = user_settings is not None
    
    # Update user settings
    test_settings = {"theme": "dark", "currency": "USD"}
    update_settings = test_endpoint("/api/user/settings", method="POST", data=test_settings)
    test_results["user_settings_update"] = update_settings is not None
    
    # Verify settings were updated
    updated_settings = test_endpoint("/api/user/settings")
    if updated_settings and isinstance(updated_settings, dict) and updated_settings.get("theme") == "dark":
        print("✅ Settings update verified")
        test_results["user_settings_verified"] = True
    else:
        print("❌ Settings update failed or not reflected")
        test_results["user_settings_verified"] = False
    
    # Asset management
    print("\n--- Testing Asset Management ---")
    
    # Test balance endpoints
    balances = test_endpoint("/api/1/balances/all")
    test_results["balances"] = balances is not None
    
    # Blockchain endpoints
    blockchains = test_endpoint("/api/1/blockchains")
    test_results["blockchains"] = blockchains is not None
    
    # Exchange endpoints
    exchanges = test_endpoint("/api/1/exchanges")
    test_results["exchanges"] = exchanges is not None
    
    # Transactions
    print("\n--- Testing Transaction History ---")
    
    # Test transactions
    transactions = test_endpoint("/api/1/transactions")
    test_results["transactions"] = transactions is not None
    
    # Financial data
    print("\n--- Testing Financial Analytics ---")
    
    # Test PnL report
    pnl = test_endpoint("/api/1/pnl_report")
    test_results["pnl"] = pnl is not None
    
    # Statistics
    print("\n--- Testing Statistics and Analytics ---")
    
    # Test netvalue statistics
    stats = test_endpoint("/api/1/statistics/netvalue")
    test_results["netvalue_stats"] = stats is not None
    
    # Test value distribution
    distribution = test_endpoint("/api/1/statistics/value_distribution")
    test_results["value_distribution"] = distribution is not None
    
    # History status
    print("\n--- Testing History Status ---")
    
    # Test history status
    history = test_endpoint("/api/1/history/status")
    test_results["history_status"] = history is not None
    
    # Summary
    print("\n" + "=" * 80)
    success_count = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    
    print("\n🧪 TEST RESULTS SUMMARY:")
    for test_name, result in test_results.items():
        print(f"{'✅' if result else '❌'} {test_name}")
    
    if success_count == total_tests:
        print(f"\n✅ ALL TESTS PASSED: {success_count}/{total_tests} endpoints working correctly!")
    else:
        print(f"\n⚠️ SOME TESTS FAILED: {success_count}/{total_tests} endpoints working correctly")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
