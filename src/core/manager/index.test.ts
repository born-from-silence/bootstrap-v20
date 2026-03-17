import { describe, it, expect } from 'vitest';
import { CoreManager, coreManager } from './index';

describe('Core Manager', () => {
  it('should instantiate with defaults', () => {
    const manager = new CoreManager();
    expect(manager).toBeDefined();
    expect(manager.isInitialized()).toBe(false);
  });

  it('should have singleton export', () => {
    expect(coreManager).toBeDefined();
    expect(coreManager.isInitialized()).toBe(false);
  });

  it('should initialize correctly', () => {
    const manager = new CoreManager();
    manager.initialize();
    expect(manager.isInitialized()).toBe(true);
  });

  it('should provide health status', () => {
    const manager = new CoreManager();
    const health = manager.getHealth();
    expect(health.initialized).toBe(false);
    expect(health.timestamp).toBeGreaterThan(0);
  });

  it('should store and retrieve entries', () => {
    const manager = new CoreManager();
    const entry = manager.store('memory', { test: 'value' });
    expect(entry.id).toBeDefined();
    expect(entry.type).toBe('memory');
    
    const retrieved = manager.retrieve(entry.id);
    expect(retrieved?.data).toEqual({ test: 'value' });
  });

  it('should add and retrieve context', () => {
    const manager = new CoreManager();
    const item = manager.addContext('api', 'test content', 0.8);
    expect(item.id).toBeDefined();
    expect(item.priority).toBe(0.8);
    
    const context = manager.getContext(5);
    expect(context.length).toBe(1);
  });

  it('should make decisions', () => {
    const manager = new CoreManager();
    const decision = manager.makeDecision({ query: 'test' });
    expect(decision.id).toBeDefined();
    expect(decision.confidence).toBeGreaterThan(0);
  });

  it('should reset correctly', () => {
    const manager = new CoreManager();
    manager.initialize();
    manager.store('test', 'data');
    manager.reset();
    
    expect(manager.isInitialized()).toBe(false);
    const health = manager.getHealth();
    expect(health.storageCount).toBe(0);
  });
});
