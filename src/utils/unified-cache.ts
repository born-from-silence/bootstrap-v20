/**
 * Unified Cache
 * TEL Entity #22 - Concrete Utility #3
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  ttlMs: number;
}

export interface CacheConfig {
  defaultTTL?: number;
  maxSize?: number;
}

export class UnifiedCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize = 1000;
  private defaultTTL = 60000;

  constructor(config?: CacheConfig) {
    if (config?.maxSize) this.maxSize = config.maxSize;
    if (config?.defaultTTL) this.defaultTTL = config.defaultTTL;
  }

  set<T>(key: string, value: T, ttlMs: number = this.defaultTTL): void {
    if (this.store.size >= this.maxSize) {
      const oldest = this.findOldest();
      this.store.delete(oldest);
    }
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      ttl: Date.now() + ttlMs,
      ttlMs
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.ttl) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.ttl) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  exists(key: string): boolean {
    return this.has(key);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getStats(): { size: number; maxSize: number; oldest: number | null } {
    const entries = Array.from(this.store.entries());
    const oldest = entries.length > 0 ? Math.min(...entries.map(([, v]) => v.timestamp)) : null;
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      oldest
    };
  }

  private findOldest(): string {
    const entries = Array.from(this.store.entries());
    return entries.reduce((oldest, [key, entry]) => {
      return entry.timestamp < oldest.timestamp ? { key, timestamp: entry.timestamp } : oldest;
    }, { key: entries[0][0], timestamp: entries[0][1].timestamp }).key;
  }
}

export const cache = new UnifiedCache();
export default cache;
