import { describe, it, expect } from 'vitest';
import { UnifiedUtils, unified } from './index';

describe('Unified Utils Index', () => {
  it('should export unified instance', () => {
    expect(unified).toBeDefined();
    expect(unified).toBeInstanceOf(UnifiedUtils);
  });

  it('should provide state snapshot', () => {
    const state = unified.getState();
    expect(state).toHaveProperty('initialized');
    expect(state).toHaveProperty('timestamp');
    expect(state.initialized).toBe(true);
    expect(state.timestamp).toBeGreaterThan(0);
  });
});
