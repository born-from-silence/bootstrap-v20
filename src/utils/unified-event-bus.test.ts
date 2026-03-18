import { describe, it, expect, vi } from 'vitest';
import { UnifiedEventBus, createEventBus } from './index';

describe('Unified Event Bus', () => {
  it('should create event bus instance', () => {
    const bus = new UnifiedEventBus();
    expect(bus).toBeDefined();
  });

  it('should subscribe to event using on()', () => {
    const bus = new UnifiedEventBus();
    const handler = vi.fn();
    const sub = bus.on('test', handler);
    expect(sub).toBeDefined();
    expect(sub.id).toContain('test');
  });

  it('should emit event to subscribers', () => {
    const bus = new UnifiedEventBus();
    const handler = vi.fn();
    bus.on('test', handler);
    bus.emit('test', { data: 'value' });
    expect(handler).toHaveBeenCalled();
  });

  it('should unsubscribe from event', () => {
    const bus = new UnifiedEventBus();
    const handler = vi.fn();
    const sub = bus.on('test', handler);
    
    // Emit before unsubscribe
    bus.emit('test', { data: 'first' });
    expect(handler).toHaveBeenCalledTimes(1);
    
    // Unsubscribe
    sub.unsubscribe();
    
    // Emit after unsubscribe - handler should not be called again
    bus.emit('test', { data: 'second' });
    expect(handler).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it('should track history', () => {
    const bus = new UnifiedEventBus();
    bus.on('event1', () => {});
    bus.on('event2', () => {});
    bus.emit('event1');
    bus.emit('event2');
    const history = bus.getHistory();
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  it('should get active events', () => {
    const bus = new UnifiedEventBus();
    bus.on('active1', () => {});
    bus.on('active2', () => {});
    const active = bus.getActiveEvents();
    expect(active).toContain('active1');
    expect(active).toContain('active2');
  });

  it('should remove all handlers for event', () => {
    const bus = new UnifiedEventBus();
    bus.on('test', () => {});
    bus.on('test', () => {});
    bus.off('test');
    const active = bus.getActiveEvents();
    expect(active).not.toContain('test');
  });
});
