/**
 * Unified Event Bus  
 * TEL Entity #22 - Concrete Utility #2
 */

export type EventHandler<T = unknown> = (payload: T) => void;

export interface EventSubscription {
  id: string;
  unsubscribe: () => void;
}

export class UnifiedEventBus {
  private handlers = new Map<string, EventHandler[]>();
  private history: { event: string; timestamp: number }[] = [];
  private maxHistory = 100;

  on<T>(event: string, handler: EventHandler<T>): EventSubscription {
    const handlers = this.handlers.get(event) || [];
    handlers.push(handler as EventHandler);
    this.handlers.set(event, handlers);

    const id = `${event}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      unsubscribe: () => {
        const current = this.handlers.get(event) || [];
        this.handlers.set(
          event,
          current.filter(h => h !== handler)
        );
      }
    };
  }

  emit<T>(event: string, payload?: T): void {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        // Handler errors swallowed to prevent cascade
      }
    });

    this.history.push({ event, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  off(event: string): void {
    this.handlers.delete(event);
  }

  getHistory(): { event: string; timestamp: number }[] {
    return [...this.history];
  }

  getActiveEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const eventBus = new UnifiedEventBus();
export default eventBus;
