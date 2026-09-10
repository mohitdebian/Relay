#!/bin/bash

# 1. Register a new user
RANDOM_SUFFIX=$RANDOM
echo "Registering user test-admin-$RANDOM_SUFFIX@example.com"
TOKEN=$(curl -s -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d "{\"email\": \"test-admin-$RANDOM_SUFFIX@example.com\", \"password\": \"password123\"}" | jq -r '.token')

# 2. Create a Workspace (user is owner/admin by default)
echo "Creating workspace"
WORKSPACE_ID=$(curl -s -X POST http://localhost:4000/workspaces -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"name\": \"Workspace $RANDOM_SUFFIX\", \"slug\": \"ws-$RANDOM_SUFFIX\"}" | jq -r '.workspace.id')

# 3. Create an API
echo "Creating API"
API_ID=$(curl -s -X POST "http://localhost:4000/apis" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{
  \"workspace_id\": $WORKSPACE_ID,
  \"name\": \"Test API\",
  \"slug\": \"test-api-$RANDOM_SUFFIX\",
  \"upstream_url\": \"http://users-service:5001\"
}" | jq -r '.api.id')

# 4. Fetch Audit Logs
echo "Fetching Audit Logs"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:4000/workspaces/$WORKSPACE_ID/audit-logs" | jq .

# 5. Test Gateway retry
# We'll use the API just created, but the users-service is not running or doesn't have that path
echo "Testing Gateway retry (expect Bad Gateway)"
curl -s -v -H "X-API-Key: dummy" "http://localhost:8080/test-api-$RANDOM_SUFFIX/invalid" 2>&1 | grep "HTTP/"

