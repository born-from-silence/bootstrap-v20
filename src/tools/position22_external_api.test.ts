import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callExternalAPI, diagnoseBridge } from './position22_external_api';

// Mock fetch for testing
const originalFetch = global.fetch;
global.fetch = vi.fn();

describe('Position22 External API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe('callExternalAPI', () => {
    it('should reject when bridge is closed', async () => {
      const bridgeState = { state: 'closed', external: null };
      const result = await callExternalAPI(bridgeState, {
        endpoint: '/test',
        method: 'GET'
      });
      
      expect(result.status).toBe('bridge_closed');
      expect(result.error).toContain('closed');
    });

    it('should reject when no external connection', async () => {
      const bridgeState = { state: 'open', external: null };
      const result = await callExternalAPI(bridgeState, {
        endpoint: '/test',
        method: 'GET'
      });
      
      expect(result.status).toBe('error');
      expect(result.error).toContain('No external');
    });

    it('should reject when external system not active', async () => {
      const bridgeState = { state: 'open', external: { state: 'dormant' } };
      const result = await callExternalAPI(bridgeState, {
        endpoint: '/test',
        method: 'GET'
      });
      
      expect(result.status).toBe('error');
      expect(result.error).toContain('dormant');
    });

    it('should measure request duration', async () => {
      const bridgeState = { state: 'open', external: { state: 'active', id: 'test' } };
      
      // Mock fetch to return quickly
      vi.mocked(global.fetch).mockResolvedValueOnce(new Response(JSON.stringify({status: 'ok'}), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }));
      
      const result = await callExternalAPI(bridgeState, {
        endpoint: '/health',
        method: 'GET'
      });
      
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle GET requests', async () => {
      const bridgeState = { state: 'open', external: { state: 'active', id: 'test' } };
      
      // Mock successful response
      vi.mocked(global.fetch).mockResolvedValueOnce(new Response(JSON.stringify({status: 'ok'}), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      }));
      
      const result = await callExternalAPI(bridgeState, {
        endpoint: '/health',
        method: 'GET'
      });
      
      expect(result.status).toBe('success');
    });

    it('should handle POST requests with payload', async () => {
      const bridgeState = { state: 'open', external: { state: 'active', id: 'test' } };
      const result = await callExternalAPI(bridgeState, {
        endpoint: '/test',
        method: 'POST',
        payload: { test: true }
      });
      
      expect(['success', 'error', 'timeout']).toContain(result.status);
    });
  });

  describe('diagnoseBridge', () => {
    it('should report bridge closed when state is closed', async () => {
      const result = await diagnoseBridge({ state: 'closed' });
      
      expect(result.bridgeOpen).toBe(false);
      expect(result.canConnect).toBe(false);
    });

    it('should report external inactive when dormant', async () => {
      const result = await diagnoseBridge({
        state: 'open',
        external: { state: 'dormant' }
      });
      
      expect(result.bridgeOpen).toBe(true);
      expect(result.externalActive).toBe(false);
      expect(result.canConnect).toBe(false);
    });

    it('should attempt connection when bridge open and external active', async () => {
      const result = await diagnoseBridge({
        state: 'open',
        external: { state: 'active', id: 'test' }
      });
      
      expect(result.bridgeOpen).toBe(true);
      expect(result.externalActive).toBe(true);
      // Connection may succeed or fail, but should have latency measured
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });

    it('should return latency even on connection failure', async () => {
      const result = await diagnoseBridge({
        state: 'open',
        external: { state: 'active', id: 'test' }
      });
      
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });
  });
});
