#!/bin/bash
set -e

echo -e "\n\033[1;36m[1/4] Starting the Relay API Gateway locally...\033[0m"
cd /home/mohit/projects/relay/gateway
export PORT=8080
export DATABASE_URL="postgresql://neondb_owner:npg_rKmP4Mws9xoq@ep-falling-cell-axrlzm3b-pooler.c-4.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
export REDIS_URL="redis://localhost:6379"

# Build and start in background
go build -o relay-gateway .
./relay-gateway > /dev/null 2>&1 &
GATEWAY_PID=$!
sleep 2 # Give it a moment to boot

echo -e "\n\033[1;36m[2/4] Creating a brand new API target with Rate Limits (Max 2 requests)...\033[0m"
API_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer relay_ws_1349b23a795aa2f26337664e188e9478461a584b1b396d5d67170de5b08efde6" -H "Content-Type: application/json" \
  -d '{
    "name": "E2E Rate Limit Test",
    "slug": "e2e-limit-test",
    "upstream_url": "https://jsonplaceholder.typicode.com",
    "environment": "production",
    "rate_limit_enabled": true,
    "rate_limit_max": 2,
    "rate_limit_window": 60
  }' https://relay-g0ia.onrender.com/apis)

echo "API Created!"

echo -e "\n\033[1;36m[3/4] Creating a fresh Workspace API Key...\033[0m"
KEY_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer relay_ws_1349b23a795aa2f26337664e188e9478461a584b1b396d5d67170de5b08efde6" -H "Content-Type: application/json" \
  -d '{
    "name": "E2E Test Key",
    "environment": "production"
  }' https://relay-g0ia.onrender.com/workspace-keys)

# Extract raw key using grep/sed for simplicity since jq might not be installed
RAW_KEY=$(echo $KEY_RESPONSE | grep -o '"rawKey":"[^"]*' | cut -d'"' -f4)
echo "API Key Created: $RAW_KEY"


echo -e "\n\033[1;36m[4/4] Firing 3 requests at the Gateway to test Rate Limits...\033[0m"

echo -e "\n\033[1;32m👉 Request 1 (Should Pass - Remaining: 1)\033[0m"
curl -s -i -H "Authorization: Bearer $RAW_KEY" http://localhost:8080/e2e-limit-test/posts/1 | head -n 10

echo -e "\n\033[1;32m👉 Request 2 (Should Pass - Remaining: 0)\033[0m"
curl -s -i -H "Authorization: Bearer $RAW_KEY" http://localhost:8080/e2e-limit-test/posts/1 | head -n 10

echo -e "\n\033[1;31m👉 Request 3 (Should FAIL - 429 Too Many Requests)\033[0m"
curl -s -i -H "Authorization: Bearer $RAW_KEY" http://localhost:8080/e2e-limit-test/posts/1 | head -n 10


# Cleanup
echo -e "\n\033[1;36m[+] Cleaning up Gateway process...\033[0m"
kill $GATEWAY_PID
echo "Done! E2E Test Completed."
