'use server';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for the Test Console.
 * The dashboard sends test requests here instead of directly to the gateway,
 * eliminating CORS issues entirely (server-to-server has no CORS).
 */
export async function POST(req: NextRequest) {
  try {
    const { method, url, headers, body } = await req.json();

    if (!url || !method) {
      return NextResponse.json({ error: 'Missing url or method' }, { status: 400 });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: headers || {},
    };

    // Only attach body for methods that support it
    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const start = Date.now();
    const upstream = await fetch(url, fetchOptions);
    const latency = Date.now() - start;

    // Read response body
    let responseBody: any;
    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseBody = await upstream.json();
    } else {
      responseBody = await upstream.text();
    }

    // Forward response headers
    const responseHeaders: Record<string, string> = {};
    upstream.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return NextResponse.json({
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
      body: responseBody,
      latency,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'Error',
        body: err.message || 'Proxy request failed',
        latency: 0,
      },
      { status: 502 }
    );
  }
}
