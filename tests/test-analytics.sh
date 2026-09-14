#!/bin/bash

RANDOM_SUFFIX=$RANDOM
TOKEN=$(curl -s -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d "{\"email\": \"test-analytics-$RANDOM_SUFFIX@example.com\", \"password\": \"password123\"}" | jq -r '.token')

WORKSPACE_ID=$(curl -s -X POST http://localhost:4000/workspaces -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"name\": \"Workspace $RANDOM_SUFFIX\", \"slug\": \"ws-$RANDOM_SUFFIX\"}" | jq -r '.workspace.id')

API_ID=$(curl -s -X POST "http://localhost:4000/apis" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{
  \"workspace_id\": $WORKSPACE_ID,
  \"name\": \"Analytics API\",
  \"slug\": \"analytics-api-$RANDOM_SUFFIX\",
  \"upstream_url\": \"http://users-service:5001\",
  \"environment\": \"production\",
  \"rate_limit_enabled\": false
}" | jq -r '.api.id')

API_KEY=$(curl -s -X POST "http://localhost:4000/apis/$API_ID/keys" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name": "Analytics Key"}' | jq -r '.rawKey')

echo "Making requests to gateway..."
for i in {1..5}; do
  # Valid request
  curl -s -H "X-API-Key: $API_KEY" "http://localhost:8080/analytics-api-$RANDOM_SUFFIX/users" > /dev/null
  # Invalid upstream path to simulate 404
  curl -s -H "X-API-Key: $API_KEY" "http://localhost:8080/analytics-api-$RANDOM_SUFFIX/invalidpath" > /dev/null
done

# Wait for async inserts
sleep 2

echo "Fetching Analytics..."
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:4000/analytics/$WORKSPACE_ID/apis/$API_ID" | jq .

