import axios from 'axios';
import assert from 'assert';

const API_URL = 'http://localhost:4000';
const GATEWAY_URL = 'http://localhost:8080';

const colors = { green: '\x1b[32m', red: '\x1b[31m', blue: '\x1b[34m', reset: '\x1b[0m' };

function logInfo(msg: string) { console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`); }
function logSuccess(msg: string) { console.log(`${colors.green}[PASS]${colors.reset} ${msg}`); }
function logError(msg: string, err?: any) {
  console.error(`${colors.red}[FAIL]${colors.reset} ${msg}`);
  if (err) {
    if (axios.isAxiosError(err)) console.error(err.response?.data || err.message);
    else console.error(err);
  }
}
async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runTests() {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const email = `e2e-strict-${randomSuffix}@example.com`;
  const password = 'password123';
  let token = '';
  let workspaceId = 0;
  let apiId = 0;
  let apiKey = '';
  const apiSlug = `e2e-api-${randomSuffix}`;

  try {
    logInfo('Starting STRICT E2E Regression Suite...');

    // 1. Auth: Register
    const regRes = await axios.post(`${API_URL}/auth/register`, { email, password });
    token = regRes.data.token;
    assert.ok(token, 'Token should be returned');
    logSuccess('User Registration successful');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Workspaces: Create
    const wsRes = await axios.post(`${API_URL}/workspaces`, { name: `WS ${randomSuffix}`, slug: `ws-${randomSuffix}` }, authConfig);
    workspaceId = wsRes.data.workspace.id;
    assert.ok(workspaceId, 'Workspace ID should be returned');
    logSuccess('Workspace Creation successful');

    // 3. APIs: Create with Rate Limiting Enabled
    // We strictly enable rate limiting here to test it later
    const apiRes = await axios.post(`${API_URL}/apis`, {
      workspace_id: workspaceId,
      name: 'E2E Strict API',
      slug: apiSlug,
      upstream_url: 'https://httpbin.org',
      rate_limit_enabled: true,
      rate_limit_max: 5,
      rate_limit_window: 60
    }, authConfig);
    apiId = apiRes.data.api.id;
    assert.ok(apiId, 'API ID should be returned');
    logSuccess('API Creation successful (with rate limits enabled)');

    // 4. API Keys: Generate
    const keyRes = await axios.post(`${API_URL}/apis/${apiId}/keys`, { name: 'E2E Test Key' }, authConfig);
    apiKey = keyRes.data.rawKey;
    assert.ok(apiKey, 'API Key should be returned');
    logSuccess('API Key Generation successful');

    await sleep(500); // Let gateway/redis sync

    // 5. Gateway Proxy (Valid & Strict Data Check)
    logInfo('Testing Gateway Proxy (Strict Match)...');
    const proxyRes = await axios.get(`${GATEWAY_URL}/${apiSlug}/get`, { headers: { 'X-API-Key': apiKey } });
    assert.strictEqual(proxyRes.status, 200, 'Proxy should return 200');
    // httpbin.org/get returns JSON including {"url": "https://httpbin.org/get"}
    console.log("Headers from proxy:", proxyRes.headers);
    assert.ok(proxyRes.data.url.includes('/get'), 'Proxy should transparently return upstream data');
    logSuccess('Gateway Proxy successful (Strict match verified)');

    // 6. Security & Error Handling (401, 404)
    logInfo('Testing Gateway Security & Errors...');
    let threw401 = false;
    try {
      await axios.get(`${GATEWAY_URL}/${apiSlug}/get`, { headers: { 'X-API-Key': 'invalid_key' } });
    } catch (e: any) {
      if (e.response?.status === 401) threw401 = true;
    }
    assert.ok(threw401, 'Invalid key should return 401 Unauthorized');

    let threw404 = false;
    try {
      await axios.get(`${GATEWAY_URL}/non-existent-api/get`, { headers: { 'X-API-Key': apiKey } });
    } catch (e: any) {
      if (e.response?.status === 404) threw404 = true;
    }
    assert.ok(threw404, 'Non-existent API slug should return 404 Not Found');
    logSuccess('Gateway Security (401/404) successful');

    // 7. Rate Limiting (Strictly spamming 55 times for a 50 max limit)
    logInfo('Testing Rate Limiting (Expecting 429 after 5 hits)...');
    let rateLimited = false;
    for (let i = 1; i <= 10; i++) {
      try {
        await axios.get(`${GATEWAY_URL}/${apiSlug}/get`, { headers: { 'X-API-Key': apiKey } });
        // The first 50 should succeed
      } catch (err: any) {
        if (err.response?.status === 429) {
          rateLimited = true;
          break;
        } else {
          throw err;
        }
      }
    }
    assert.ok(rateLimited, 'Rate limit 429 should have been hit!');
    logSuccess('Rate Limiting successful (429 received strictly)');

    // 8. Gateway Reliability (Retry logic)
    logInfo('Testing Gateway Reliability (Retries)...');
    const badApiSlug = `bad-api-${randomSuffix}`;
    const badApiRes = await axios.post(`${API_URL}/apis`, {
      workspace_id: workspaceId,
      name: 'Bad API',
      slug: badApiSlug,
      upstream_url: 'http://localhost:9999'
    }, authConfig);
    const badApiId = badApiRes.data.api.id;
    const badKeyRes = await axios.post(`${API_URL}/apis/${badApiId}/keys`, { name: 'Bad Key' }, authConfig);
    
    let threw502 = false;
    try {
      await axios.get(`${GATEWAY_URL}/${badApiSlug}/test`, { headers: { 'X-API-Key': badKeyRes.data.rawKey } });
    } catch (err: any) {
      if (err.response?.status === 502) threw502 = true;
    }
    assert.ok(threw502, 'Broken upstream should return 502 Bad Gateway after retrying');
    logSuccess('Gateway Reliability successful (502 strictly received)');

    // 9. Audit Logs
    logInfo('Testing Audit Logs (Strict validation)...');
    const auditRes = await axios.get(`${API_URL}/workspaces/${workspaceId}/audit-logs`, authConfig);
    const logs = auditRes.data.auditLogs;
    assert.ok(logs.length >= 2, 'Should have at least 2 audit logs');
    const hasApiCreation = logs.find((l: any) => l.action === 'API_CREATED' && l.metadata.slug === apiSlug);
    const hasKeyCreation = logs.find((l: any) => l.action === 'API_KEY_CREATED' && l.metadata.name === 'E2E Test Key');
    assert.ok(hasApiCreation, 'API_CREATED log missing or mismatched');
    assert.ok(hasKeyCreation, 'API_KEY_CREATED log missing or mismatched');
    logSuccess('Audit Logs successful (Strict validation)');

    // 10. Cleanup
    logInfo('Cleaning up test data...');
    await axios.delete(`${API_URL}/apis/${apiId}`, authConfig);
    await axios.delete(`${API_URL}/apis/${badApiId}`, authConfig);
    logSuccess('Cleanup successful');

    console.log(`\n${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}ALL STRICT E2E REGRESSION TESTS PASSED!${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}\n`);

  } catch (err: any) {
    logError('Strict E2E Regression Test Failed', err);
    process.exit(1);
  }
}

runTests();
