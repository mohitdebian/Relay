import { neon } from '@neondatabase/serverless';

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function gateway(req: Request): Promise<Response> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  
  const token = authHeader.substring(7);
  const hash = await sha256(token);
  
  const sql = neon(process.env.DATABASE_URL!);
  
  // Find key and related API
  const keys = await sql`
    SELECT k.id as api_key_id, k.api_id, a.upstream_url 
    FROM api_keys k
    JOIN apis a ON k.api_id = a.id
    WHERE k.key_hash = ${hash} AND k.revoked_at IS NULL
  `;
  
  if (keys.length === 0) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  
  const api = keys[0];
  const url = new URL(req.url);
  const targetUrl = `${api.upstream_url}${url.pathname}${url.search}`;
  const start = Date.now();
  
  const newHeaders = new Headers(req.headers);
  newHeaders.delete('authorization');
  newHeaders.delete('host');
  
  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.clone().blob() : undefined,
    });
    
    const latency = Date.now() - start;
    
    // Log asynchronously
    sql`
      INSERT INTO api_request_logs (api_id, api_key_id, status_code, latency_ms)
      VALUES (${api.api_id}, ${api.api_key_id}, ${upstreamRes.status}, ${latency})
    `.catch(console.error);
    
    return upstreamRes;
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Bad Gateway', details: err.message }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
}
