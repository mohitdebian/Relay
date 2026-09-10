#!/bin/bash

# Register user and get token
echo "Registering user..."
TOKEN=$(curl -s -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d '{"email": "test-rl-4@example.com", "password": "password123"}' | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  TOKEN=$(curl -s -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email": "test-rl-4@example.com", "password": "password123"}' | jq -r '.token')
fi

# Create workspace
echo "Creating workspace..."
WORKSPACE_ID=$(curl -s -X POST http://localhost:4000/workspaces -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name": "RL Test Workspace", "slug": "rl-ws"}' | jq -r '.workspace.id')

if [ "$WORKSPACE_ID" == "null" ] || [ -z "$WORKSPACE_ID" ]; then
  WORKSPACE_ID=$(curl -s http://localhost:4000/workspaces -H "Authorization: Bearer $TOKEN" | jq -r '.workspaces[0].id')
fi
echo "Workspace ID: $WORKSPACE_ID"

# Create API
echo "Creating API..."
API_ID=$(curl -s -X POST "http://localhost:4000/apis" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{
  "workspace_id": '$WORKSPACE_ID',
  "name": "Rate Limited API",
  "slug": "rl-api",
  "upstream_url": "http://users-service:5001",
  "environment": "production",
  "rate_limit_enabled": true,
  "rate_limit_max": 3,
  "rate_limit_window": 60
}' | jq -r '.api.id')

if [ "$API_ID" == "null" ] || [ -z "$API_ID" ]; then
  API_ID=$(curl -s http://localhost:4000/apis -H "Authorization: Bearer $TOKEN" | jq -r '.apis[0].id')
fi
echo "API ID: $API_ID"

# Create API Key
echo "Creating API Key..."
API_KEY=$(curl -s -X POST "http://localhost:4000/apis/$API_ID/keys" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name": "RL Key"}' | jq -r '.rawKey')
echo "API Key: $API_KEY"

echo "Sleeping for 1 second..."
sleep 1

# Make requests
echo "Making requests..."
for i in {1..5}; do
  echo "Request $i:"
  curl -i -s -H "Authorization: Bearer $API_KEY" http://localhost:8080/rl-api/users | head -n 15
  echo -e "\n---"
done
