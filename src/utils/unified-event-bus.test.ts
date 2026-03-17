import { describe, it, expect, beforeEach } from 'vitest';
import { UnifiedEventBus, eventBus } from './unified-event-bus';

describe('Unified Event Bus', () => {
  let testBus: UnifiedEventBus;
  
  beforeEach(() => {
    testBus = new UnifiedEventBus();
  });

  it('should create event bus instance', () => {
    expect(testBus).toBeDefined();
  });

  it('should subscribe to event', () => {
    const handler = () => {};
    const subscription = testBus.on('test', handler);
    expect(subscription).toBeDefined();
    expect(subscription.id).toBeDefined();
  });

  it('should emit event to subscribers', () => {
    const calls: unknown[] = [];
    testBus.on('test', (data) => calls.push(data));
    testBus.emit('test', 'payload');
    expect(calls).toEqual(['payload']);
  });

  it('should unsubscribe from event', () => {
    const handler = () => {};
    const sub = testBus.on('test', handler);
    sub.unsubscribe();
    testBus.emit('test');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should track history', () => {
    testBus.emit('event1');
    testBus.emit('event2');
    const history = testBus.getHistory();
    expect(history).toHaveLength(2);
  });

  it('should get active events', () => {
    testBus.on('event1', () => {});
    testBus.on('event2', () => {});
    const active = testBus.getActiveEvents();
    expect(active).toContain('event1');
    expect(active).toContain('event2');
  });

  it('should remove all handlers for event', () => {
    testBus.on('test', () => {});
    testBus.off('test');
    expect(testBus.getActiveEvents()).not.toContain('test');
  });
});
