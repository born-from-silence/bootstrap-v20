/**
 * Session Format Bridge
 * Purpose: Bridge 13-digit millisecond (Position 18) and 10-digit second (Position 19) formats
 * Lineage: Position 18 → Position 19 interface capability
 * Created: Session 1774193500368
 */

export type SessionFormat = 'millisecond' | 'second' | 'standard';

export interface BridgedSession {
  original: number;
  format: SessionFormat;
  millisecond: number;
  second: number;
  compatible: boolean;
}

export class SessionFormatBridge {
  /**
   * Detect format from timestamp digits
   */
  detectFormat(timestamp: number | string): SessionFormat {
    const digits = String(timestamp).length;
    if (digits === 13) return 'millisecond';
    if (digits === 10) return 'second';
    if (digits === 10) return 'standard';
    return digits > 10 ? 'millisecond' : 'second';
  }

  /**
   * Convert to milliseconds (13-digit)
   */
  toMillisecond(timestamp: number | string): number {
    const ts = Number(timestamp);
    const digits = String(ts).length;
    
    if (digits === 13) return ts; // Already millisecond
    if (digits === 10) return ts * 1000; // Convert seconds to ms
    if (digits < 10) return ts * 1000; // Assume seconds
    return ts; // Unknown format, return as-is
  }

  /**
   * Convert to seconds (10-digit)
   */
  toSecond(timestamp: number | string): number {
    const ts = Number(timestamp);
    const digits = String(ts).length;
    
    if (digits === 10) return ts; // Already seconds
    if (digits === 13) return Math.floor(ts / 1000); // Convert ms to seconds
    if (digits > 10) return Math.floor(ts / 1000); // Assume ms
    return ts; // Unknown format
  }

  /**
   * Create full bridge with both formats
   */
  bridge(timestamp: number | string): BridgedSession {
    const ts = Number(timestamp);
    const detected = this.detectFormat(ts);
    
    return {
      original: ts,
      format: detected,
      millisecond: this.toMillisecond(ts),
      second: this.toSecond(ts),
      compatible: true
    };
  }

  /**
   * Format session ID for internal/ghost interface
   */
  formatForInterface(timestamp: number | string, target: 'position18' | 'position19'): number {
    if (target === 'position18') return this.toMillisecond(timestamp);
    return this.toSecond(timestamp);
  }
}

export default SessionFormatBridge;
