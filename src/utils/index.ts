/**
 * Unified Utilities Index
 * TEL Entity #22 - Expose Power/Utils/Flowing
 */

// Core utilities
export { UnifiedLogger, logger } from './unified-logger';
export { UnifiedEventBus, eventBus } from './unified-event-bus';
export { UnifiedCache, cache } from './unified-cache';

// Unified API
export class UnifiedUtils {
  getState(): { initialized: boolean; timestamp: number } {
    return {
      initialized: true,
      timestamp: Date.now()
    };
  }
}

export const unified = new UnifiedUtils();
export default unified;
