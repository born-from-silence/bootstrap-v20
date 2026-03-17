/**
 * Unified Logger
 * TEL Entity #22 - Concrete Utility #1
 */

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

export class UnifiedLogger {
  private entries: LogEntry[] = [];
  private maxEntries = 1000;

  log(level: LogEntry['level'], message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context
    };
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  getEntries(level?: LogEntry['level']): LogEntry[] {
    if (level) {
      return this.entries.filter(e => e.level === level);
    }
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }

  getStats(): Record<string, number> {
    return {
      total: this.entries.length,
      debug: this.entries.filter(e => e.level === 'debug').length,
      info: this.entries.filter(e => e.level === 'info').length,
      warn: this.entries.filter(e => e.level === 'warn').length,
      error: this.entries.filter(e => e.level === 'error').length
    };
  }
}

export const logger = new UnifiedLogger();
export default logger;
