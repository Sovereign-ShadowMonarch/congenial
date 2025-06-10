#!/bin/bash

# Test health endpoint
echo "Testing health endpoint..."
curl -X GET http://localhost:4242/api/1/health

echo -e "

Testing user creation..."
curl -X PUT http://localhost:4242/api/1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "testuser", "password": "testpass123", "premium_api_key": "test_key", "premium_api_secret": "test_secret"}'

echo -e "

Testing user login..."
curl -X POST http://localhost:4242/api/1/users/login \
  -H "Content-Type: application/json" \
  -d '{"name": "testuser", "password": "testpass123"}'

echo -e "

Testing update user settings..."
curl -X PUT http://localhost:4242/api/1/users/testuser/settings \
  -H "Content-Type: application/json" \
  -d '{"submit_usage_analytics": false}'

echo -e "

Testing delete user..."
curl -X DELETE http://localhost:4242/api/1/users/testuser
