import { describe, it, expect } from 'vitest';
import { ApiClient, MemoryManager, VERSION } from './index';

describe('Core Index', () => {
  it('should export ApiClient', () => {
    expect(ApiClient).toBeDefined();
  });

  it('should export MemoryManager', () => {
    expect(MemoryManager).toBeDefined();
  });

  it('should export VERSION', () => {
    expect(VERSION).toBe('22.0.0');
  });
});
