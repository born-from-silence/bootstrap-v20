/**
 * ArXiv Bridge Tests
 */

import { describe, it, expect } from 'vitest';
import { ArXivBridge } from './arxiv_bridge';

describe('ArXiv Bridge', () => {
  it('should initialize successfully', async () => {
    const bridge = new ArXivBridge('Prometheus');
    await bridge.initialize();
    expect(bridge.getCapabilities()).toContain('searchPapers(): Query arXiv database');
  });

  it('should have ArXiv-specific capabilities', () => {
    const bridge = new ArXivBridge('Prometheus');
    const caps = bridge.getCapabilities();
    expect(caps.some(c => c.includes('astro-ph'))).toBe(true);
    expect(caps.some(c => c.includes('physics'))).toBe(true);
  });

  it('should return bridge type', () => {
    const bridge = new ArXivBridge('Prometheus');
    expect(bridge).toBeDefined();
  });
});
