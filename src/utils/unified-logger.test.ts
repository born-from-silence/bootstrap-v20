import { describe, it, expect, beforeEach } from 'vitest';
import { UnifiedLogger, logger } from './unified-logger';

describe('Unified Logger', () => {
  let testLogger: UnifiedLogger;
  
  beforeEach(() => {
    testLogger = new UnifiedLogger();
  });

  it('should create logger instance', () => {
    expect(testLogger).toBeDefined();
  });

  it('should log info entry', () => {
    testLogger.log('info', 'test message');
    const entries = testLogger.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('info');
  });

  it('should log with context', () => {
    testLogger.log('debug', 'debug msg', { key: 'value' });
    const entries = testLogger.getEntries();
    expect(entries[0].context).toEqual({ key: 'value' });
  });

  it('should filter entries by level', () => {
    testLogger.log('info', 'info msg');
    testLogger.log('error', 'error msg');
    const infoOnly = testLogger.getEntries('info');
    expect(infoOnly).toHaveLength(1);
    expect(infoOnly[0].level).toBe('info');
  });

  it('should clear entries', () => {
    testLogger.log('info', 'msg');
    testLogger.clear();
    expect(testLogger.getEntries()).toHaveLength(0);
  });

  it('should provide stats', () => {
    testLogger.log('info', 'msg1');
    testLogger.log('error', 'msg2');
    const stats = testLogger.getStats();
    expect(stats.total).toBe(2);
    expect(stats.error).toBe(1);
    expect(stats.info).toBe(1);
  });
});
