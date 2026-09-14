#!/bin/bash
RANDOM_SUFFIX=$RANDOM
TOKEN=$(curl -s -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d "{\"email\": \"test-retry-$RANDOM_SUFFIX@example.com\", \"password\": \"password123\"}" | jq -r '.token')
WORKSPACE_ID=$(curl -s -X POST http://localhost:4000/workspaces -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"name\": \"Workspace $RANDOM_SUFFIX\", \"slug\": \"ws-$RANDOM_SUFFIX\"}" | jq -r '.workspace.id')
API_ID=$(curl -s -X POST "http://localhost:4000/apis" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"workspace_id\": $WORKSPACE_ID, \"name\": \"Test API\", \"slug\": \"test-retry-$RANDOM_SUFFIX\", \"upstream_url\": \"http://localhost:9999\"}" | jq -r '.api.id')
API_KEY=$(curl -s -X POST "http://localhost:4000/apis/$API_ID/keys" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name": "Test Key"}' | jq -r '.rawKey')
curl -s -v -H "X-API-Key: $API_KEY" "http://localhost:8080/test-retry-$RANDOM_SUFFIX/invalid" 2>&1 | grep "HTTP/"
