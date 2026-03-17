import { describe, it, expect } from 'vitest';

describe('Core Index', () => {
  it('should be importable', async () => {
    const core = await import('./index');
    expect(core.VERSION).toBe('22.0.0-core');
    expect(core.ENTITY).toBe(22);
  });
});
