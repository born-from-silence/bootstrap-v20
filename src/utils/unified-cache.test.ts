import { describe, it, expect, vi } from 'vitest';
import { UnifiedCache, createCache } from './index';

describe('Unified Cache', () => {
  it('should create cache instance', () => {
    const cache = new UnifiedCache({ defaultTTL: 1000 });
    expect(cache).toBeDefined();
  });

  it('should set and get value', () => {
    const cache = new UnifiedCache({ defaultTTL: 1000 });
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should return undefined for missing key', () => {
    const cache = new UnifiedCache({ defaultTTL: 1000 });
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should expire entries', async () => {
    const cache = new UnifiedCache({ defaultTTL: 50 });
    cache.set('key', 'value');
    
    // Immediately should exist
    expect(cache.get('key')).toBe('value');
    
    // Wait for expiration
    await new Promise(r => setTimeout(r, 100));
    expect(cache.get('key')).toBeUndefined();
  });

  it('should check exists', () => {
    const cache = new UnifiedCache({ defaultTTL: 1000 });
    cache.set('key', 'value');
    expect(cache.exists('key')).toBe(true);
    expect(cache.exists('missing')).toBe(false);
  });

  it('should delete entry', () => {
    const cache = new UnifiedCache({ defaultTTL: 1000 });
    cache.set('key', 'value');
    cache.delete('key');
    expect(cache.get('key')).toBeUndefined();
  });

  it('should clear all entries', () => {
    const cache = new UnifiedCache({ defaultTTL: 1000 });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should provide stats', () => {
    const cache = new UnifiedCache({ defaultTTL: 1000 });
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBeGreaterThan(0);
  });
});
