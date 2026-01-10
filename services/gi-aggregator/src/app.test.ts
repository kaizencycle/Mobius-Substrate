/**
 * GI Aggregator - API Tests
 * 
 * Tests for the Express REST API endpoints.
 * 
 * @module gi-aggregator/tests/app
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from './app.js';

// Simple request helper for testing Express app
async function request(method: string, path: string, body?: object): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    // Create a temporary server
    const server = app.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        return reject(new Error('Invalid server address'));
      }
      
      const port = address.port;
      const options: http.RequestOptions = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {}
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          server.close();
          try {
            resolve({ status: res.statusCode || 0, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode || 0, body: data });
          }
        });
      });
      
      req.on('error', (e: Error) => {
        server.close();
        reject(e);
      });
      
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
}

describe('Health Endpoint', () => {
  it('GET /health should return ok status', async () => {
    const res = await request('GET', '/health');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, {
      status: 'ok',
      service: 'gi-aggregator',
      version: '0.1.0'
    });
  });
});

describe('POST /gi/sample', () => {
  it('should accept valid GI sample', async () => {
    const res = await request('POST', '/gi/sample', { gi: 0.95 });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, { ok: true });
  });

  it('should accept GI sample with weight', async () => {
    const res = await request('POST', '/gi/sample', { gi: 0.88, w: 2 });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, { ok: true });
  });

  it('should accept GI sample with timestamp', async () => {
    const res = await request('POST', '/gi/sample', { 
      gi: 0.92, 
      t: Date.now() 
    });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, { ok: true });
  });

  it('should reject GI value < 0', async () => {
    const res = await request('POST', '/gi/sample', { gi: -0.1 });
    assert.strictEqual(res.status, 400);
    const body = res.body as { error: string };
    assert.ok(body.error?.includes('0..1'));
  });

  it('should reject GI value > 1', async () => {
    const res = await request('POST', '/gi/sample', { gi: 1.5 });
    assert.strictEqual(res.status, 400);
    const body = res.body as { error: string };
    assert.ok(body.error?.includes('0..1'));
  });

  it('should reject non-numeric GI value', async () => {
    const res = await request('POST', '/gi/sample', { gi: 'invalid' });
    assert.strictEqual(res.status, 400);
  });

  it('should accept boundary value 0', async () => {
    const res = await request('POST', '/gi/sample', { gi: 0 });
    assert.strictEqual(res.status, 200);
  });

  it('should accept boundary value 1', async () => {
    const res = await request('POST', '/gi/sample', { gi: 1 });
    assert.strictEqual(res.status, 200);
  });
});

describe('GET /gi/spot', () => {
  it('should return current spot GI', async () => {
    const res = await request('GET', '/gi/spot');
    assert.strictEqual(res.status, 200);
    const body = res.body as { mii: number; updated_at: string | null };
    assert.ok(typeof body.mii === 'number');
    assert.ok(body.mii >= 0 && body.mii <= 1);
  });

  it('should include updated_at timestamp', async () => {
    const res = await request('GET', '/gi/spot');
    const body = res.body as { mii: number; updated_at: string | null };
    if (body.updated_at !== null) {
      // Validate ISO 8601 format
      const date = new Date(body.updated_at);
      assert.ok(!isNaN(date.getTime()), 'updated_at should be valid date');
    }
  });
});

describe('GET /gi/twa', () => {
  it('should return time-weighted average', async () => {
    const res = await request('GET', '/gi/twa');
    assert.strictEqual(res.status, 200);
    const body = res.body as { 
      mii: number | null; 
      samples: number; 
      lookback_days: number;
      updated_at: string;
    };
    assert.ok('mii' in body);
    assert.ok(typeof body.samples === 'number');
    assert.strictEqual(body.lookback_days, 30); // default
  });

  it('should accept custom lookback days', async () => {
    const res = await request('GET', '/gi/twa?days=7');
    assert.strictEqual(res.status, 200);
    const body = res.body as { lookback_days: number };
    assert.strictEqual(body.lookback_days, 7);
  });

  it('should accept min_samples parameter', async () => {
    const res = await request('GET', '/gi/twa?min_samples=5');
    assert.strictEqual(res.status, 200);
    // Should succeed even with fewer samples
  });

  it('should return valid MII when samples exist', async () => {
    // First add a sample
    await request('POST', '/gi/sample', { gi: 0.95 });
    
    const res = await request('GET', '/gi/twa?days=1');
    const body = res.body as { mii: number | null };
    
    if (body.mii !== null) {
      assert.ok(body.mii >= 0 && body.mii <= 1, 'MII should be in [0,1]');
    }
  });
});
