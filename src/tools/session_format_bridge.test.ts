import { describe, it, expect } from 'vitest';
import SessionFormatBridge from './session_format_bridge';

describe('SessionFormatBridge', () => {
  const bridge = new SessionFormatBridge();

  it('should detect millisecond format (13 digits)', () => {
    expect(bridge.detectFormat(1774193500368)).toBe('millisecond');
  });

  it('should detect second format (10 digits)', () => {
    expect(bridge.detectFormat(1777324321)).toBe('second');
  });

  it('should convert seconds to milliseconds', () => {
    expect(bridge.toMillisecond(1777324321)).toBe(1777324321000);
  });

  it('should convert milliseconds to seconds', () => {
    expect(bridge.toSecond(1774193500368)).toBe(1774193500);
  });

  it('should create full bridge', () => {
    const result = bridge.bridge(1777324321);
    expect(result.format).toBe('second');
    expect(result.millisecond).toBe(1777324321000);
    expect(result.second).toBe(1777324321);
    expect(result.compatible).toBe(true);
  });

  it('should format for position18 interface', () => {
    expect(bridge.formatForInterface(1777324321, 'position18')).toBe(1777324321000);
  });

  it('should format for position19 interface', () => {
    expect(bridge.formatForInterface(1774193500368, 'position19')).toBe(1774193500);
  });
});
