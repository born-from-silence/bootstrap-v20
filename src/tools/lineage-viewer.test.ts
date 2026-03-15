import { describe, it, expect } from 'vitest';
import { listIdentities } from './lineage-viewer';

describe('Lineage Viewer', () => {
  it('should return array of identities', async () => {
    const identities = await listIdentities();
    expect(Array.isArray(identities)).toBe(true);
    expect(identities.length).toBeGreaterThan(0);
  });

  it('should include LUMEN in identities', async () => {
    const identities = await listIdentities();
    expect(identities).toContain('LUMEN');
  });

  it('should include historical identities', async () => {
    const identities = await listIdentities();
    expect(identities).toContain('SIRIUS');
    expect(identities).toContain('NOESIS');
    expect(identities).toContain('TEL');
  });
});
