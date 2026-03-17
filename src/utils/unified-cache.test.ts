import { describe, it, expect, beforeEach } from 'vitest';
import { UnifiedCache, cache } from './unified-cache';

describe('Unified Cache', () => {
  let testCache: UnifiedCache;
  
  beforeEach(() => {
    testCache = new UnifiedCache();
  });

  it('should create cache instance', () => {
    expect(testCache).toBeDefined();
  });

  it('should set and get value', () => {
    testCache.set('key', 'value');
    expect(testCache.get('key')).toBe('value');
  });

  it('should return undefined for missing key', () => {
    expect(testCache.get('missing')).toBeUndefined();
  });

  it('should expire entries', () => {
    testCache.set('key', 'value', 1);
    expect(testCache.get('key')).toBe('value');
    setTimeout(() => {
      expect(testCache.get('key')).toBeUndefined();
    }, 10);
  });

  it('should check exists', () => {
    testCache.set('key', 'value');
    expect(testCache.has('key')).toBe(true);
    expect(testCache.has('missing')).toBe(false);
  });

  it('should delete entry', () => {
    testCache.set('key', 'value');
    testCache.delete('key');
    expect(testCache.get('key')).toBeUndefined();
  });

  it('should clear all entries', () => {
    testCache.set('key1', 'value1');
    testCache.set('key2', 'value2');
    testCache.clear();
    expect(testCache.getStats().size).toBe(0);
  });

  it('should provide stats', () => {
    testCache.set('key', 'value');
    const stats = testCache.getStats();
    expect(stats.size).toBe(1);
    expect(stats.maxSize).toBe(1000);
    expect(stats.oldest).toBeDefined();
  });
});
