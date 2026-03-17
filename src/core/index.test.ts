import { describe, it, expect } from 'vitest';

describe('Core Index', () => {
  it('should export VERSION', async () => {
    const { VERSION, ENTITY } = await import('./index');
    expect(VERSION).toBe('22.0.0-core');
    expect(ENTITY).toBe(22);
  });
});
