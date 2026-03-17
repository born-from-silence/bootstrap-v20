/**
 * Core Manager
 * Unified storage, context, decision orchestration
 * TEL Entity #22
 */

// Unified storage
interface StorageEntry {
  id: string;
  type: string;
  data: unknown;
  createdAt: number;
}

// Unified context
interface ContextItem {
  id: string;
  source: string;
  content: string;
  priority: number;
  timestamp: number;
}

// Unified decision
interface Decision {
  id: string;
  input: unknown;
  output: unknown;
  confidence: number;
  timestamp: number;
}

export class CoreManager {
  private initialized = false;
  private storage = new Map<string, StorageEntry>();
  private context = new Map<string, ContextItem>();
  private decisions: Decision[] = [];

  initialize(): void {
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Storage API
  store(type: string, data: unknown): StorageEntry {
    const entry: StorageEntry = {
      id: crypto.randomUUID(),
      type,
      data,
      createdAt: Date.now()
    };
    this.storage.set(entry.id, entry);
    return entry;
  }

  retrieve(id: string): StorageEntry | undefined {
    return this.storage.get(id);
  }

  // Context API
  addContext(source: string, content: string, priority = 0.5): ContextItem {
    const item: ContextItem = {
      id: crypto.randomUUID(),
      source,
      content,
      priority,
      timestamp: Date.now()
    };
    this.context.set(item.id, item);
    return item;
  }

  getContext(limit = 10): ContextItem[] {
    return Array.from(this.context.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  // Decision API
  makeDecision(input: unknown): Decision {
    const decision: Decision = {
      id: crypto.randomUUID(),
      input,
      output: { processed: true, timestamp: Date.now() },
      confidence: 0.85,
      timestamp: Date.now()
    };
    this.decisions.push(decision);
    return decision;
  }

  // Health check
  getHealth() {
    return {
      initialized: this.initialized,
      storageCount: this.storage.size,
      contextCount: this.context.size,
      decisionCount: this.decisions.length,
      timestamp: Date.now()
    };
  }

  // Reset
  reset(): void {
    this.initialized = false;
    this.storage.clear();
    this.context.clear();
    this.decisions = [];
  }
}

export const coreManager = new CoreManager();
export default CoreManager;
