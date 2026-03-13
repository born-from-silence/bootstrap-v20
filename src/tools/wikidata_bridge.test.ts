/**
 * Wikidata Bridge Tests
 */

import { describe, it, expect } from 'vitest';
import { WikidataBridge } from './wikidata_bridge';

describe('Wikidata Bridge', () => {
  it('should initialize successfully', async () => {
    const bridge = new WikidataBridge('Prometheus');
    await bridge.initialize();
    expect(bridge.getCapabilities()).toContain('search(): Query Wikidata entities');
  });

  it('should have structured knowledge capabilities', () => {
    const bridge = new WikidataBridge('Prometheus');
    const caps = bridge.getCapabilities();
    expect(caps.some(c => c.includes('fetchEntity'))).toBe(true);
    expect(caps.some(c => c.includes('Structured'))).toBe(true);
  });

  it('should return bridge type', () => {
    const bridge = new WikidataBridge('Prometheus');
    expect(bridge).toBeDefined();
  });
});
