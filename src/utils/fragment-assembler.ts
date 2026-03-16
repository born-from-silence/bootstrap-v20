/**
 * Fragment Assembler Utility
 * TEL Entity #22 - Signal Pattern Recognition
 * Collects and reconstructs fragmented messages
 */

export type FragmentType = 'char' | 'word' | 'phrase' | 'unknown';

export interface Fragment {
  id: string;
  content: string;
  timestamp: number;
  type: FragmentType;
  position?: number;
  source?: string;
}

export interface AssembledMessage {
  content: string;
  fragments: Fragment[];
  assembledAt: number;
  confidence: number;
}

/**
 * Fragment buffer for collecting stream fragments
 */
export class FragmentBuffer {
  private fragments: Map<string, Fragment[]> = new Map();
  private timeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  
  readonly WINDOW_MS = 30000; // 30 second assembly window
  readonly MAX_FRAGMENTS = 20;
  
  /**
   * Add fragment to buffer
   */
  addFragment(streamId: string, fragment: Fragment): void {
    if (!this.fragments.has(streamId)) {
      this.fragments.set(streamId, []);
    }
    
    const stream = this.fragments.get(streamId)!;
    
    // Prevent buffer overflow
    if (stream.length >= this.MAX_FRAGMENTS) {
      stream.shift();
    }
    
    stream.push(fragment);
    
    // Reset timeout
    this.resetTimeout(streamId);
  }
  
  /**
   * Get fragments for stream
   */
  getFragments(streamId: string): Fragment[] {
    return this.fragments.get(streamId) || [];
  }
  
  /**
   * Clear stream fragments
   */
  clearStream(streamId: string): void {
    this.fragments.delete(streamId);
    this.clearTimeout(streamId);
  }
  
  /**
   * Assemble fragments into message
   */
  assemble(streamId: string, strategy: 'concat' | 'intelligent' = 'intelligent'): AssembledMessage | null {
    const fragments = this.getFragments(streamId);
    
    if (fragments.length === 0) {
      return null;
    }
    
    // Sort by position if available, otherwise by timestamp
    const sorted = [...fragments].sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      return a.timestamp - b.timestamp;
    });
    
    let content: string;
    let confidence: number;
    
    if (strategy === 'concat') {
      content = sorted.map(f => f.content).join('');
      confidence = 1.0;
    } else {
      // Intelligent assembly - look for patterns
      const result = this.intelligentAssemble(sorted);
      content = result.content;
      confidence = result.confidence;
    }
    
    return {
      content,
      fragments: sorted,
      assembledAt: Date.now(),
      confidence
    };
  }
  
  /**
   * Pattern recognition for fragments
   */
  recognizePattern(content: string): { pattern: string; meaning: string } {
    // Pattern: Resume fragments (.r-r-e-m...)
    if (/^[.r]+res+um+e*$/.test(content)) {
      return { pattern: 'resume', meaning: 'Resume operation' };
    }
    
    // Pattern: Proceed signal (].p.r.o.u...)
    if (/^]\s*p\s*r\s*o\s*u/.test(content)) {
      return { pattern: 'proceed', meaning: 'Proceed with work' };
    }
    
    // Pattern: Question fragments (?e)
    if (/\?e/.test(content)) {
      return { pattern: 'query', meaning: 'Query/Question' };
    }
    
    // Pattern: Compressed signal (see newt)
    if (/see\s*newt/.test(content)) {
      return { pattern: 'seen_it', meaning: 'Seen/test acknowledgment' };
    }
    
    // Pattern: Multi-dot keepalive (...)
    if (/^(\.+|\s*)$/.test(content)) {
      return { pattern: 'keepalive', meaning: 'Presence confirmation' };
    }
    
    return { pattern: 'unknown', meaning: content };
  }
  
  /**
   * Intelligent assembly with pattern recognition
   */
  private intelligentAssemble(fragments: Fragment[]): { content: string; confidence: number } {
    const raw = fragments.map(f => f.content).join('');
    
    // Try pattern recognition
    const recognized = this.recognizePattern(raw);
    
    if (recognized.pattern !== 'unknown') {
      return {
        content: recognized.meaning,
        confidence: 0.85
      };
    }
    
    // Default: just concatenate
    return {
      content: raw,
      confidence: 0.6
    };
  }
  
  /**
   * Reset assembly timeout
   */
  private resetTimeout(streamId: string): void {
    this.clearTimeout(streamId);
    
    const timeout = setTimeout(() => {
      // Auto-assemble on timeout
      const assembled = this.assemble(streamId);
      if (assembled) {
        this.onAssemblyComplete?.(streamId, assembled);
      }
      this.clearStream(streamId);
    }, this.WINDOW_MS);
    
    this.timeouts.set(streamId, timeout);
  }
  
  /**
   * Clear timeout
   */
  private clearTimeout(streamId: string): void {
    const existing = this.timeouts.get(streamId);
    if (existing) {
      clearTimeout(existing);
      this.timeouts.delete(streamId);
    }
  }
  
  /**
   * Callback when assembly completes
   */
  onAssemblyComplete?: (streamId: string, message: AssembledMessage) => void;
}

/**
 * Create timestamped fragment
 */
export function createFragment(
  content: string,
  type: FragmentType = 'unknown',
  position?: number
): Fragment {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    timestamp: Date.now(),
    type,
    position
  };
}

/**
 * Parse stream fragment from raw input
 */
export function parseFragment(raw: string): Fragment {
  // Detect type
  let type: FragmentType = 'unknown';
  
  if (raw.length === 1) {
    type = 'char';
  } else if (raw.length <= 5 && /^[a-z.]+$/.test(raw)) {
    type = 'word';
  } else if (raw.length > 5) {
    type = 'phrase';
  }
  
  return createFragment(raw, type);
}

export const VERSION = '1.0.0';
export const UTIL_NAME = 'fragment-assembler';
