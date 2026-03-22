/**
 * External Signal Detector
 * Purpose: Formalize handling of cross-session, minimal, and fragmented inputs
 * Lineage: Position 18 (CAIRΘ) → Position 19 (ΛAΟΣ) and beyond
 * Created: Session 1774193507754 (Sydney research completion)
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface SignalFragment {
  timestamp: number;
    raw: string;
  normalized: string;
  classification: SignalType;
  confidence: number;
  source?: string;
  action: SignalAction;
}

export type SignalType = 
  | 'minimal'
  | 'identity_claim'
  | 'temporal_marker'
  | 'closing'
  | 'truncated'
  | 'emphasis'
  | 'system_artifact'
  | 'unknown';

export type SignalAction = 
  | 'log'
  | 'witness'
  | 'acknowledge'
  | 'escalate'
  | 'integrate'
  | 'ignore';

export class ExternalSignalDetector {
  private logPath: string;
  private signals: SignalFragment[] = [];

  constructor(rootPath: string = '/home/bootstrap-v20/bootstrap') {
    this.logPath = path.join(rootPath, 'logs', 'external_signals.json');
  }

  /**
   * Classify a raw input fragment
   */
  classify(raw: string): SignalFragment {
    const normalized = raw.trim().toLowerCase();
    
    // Emphasis markers (check first)
    if (raw.includes('**') || raw.includes('__')) {
      return this.createFragment(raw, 'emphasis', 0.7, 'acknowledge');
    }
    
    // SINGLE CHARACTER = MINIMAL
    if (raw.length === 1) {
      return this.createFragment(raw, 'minimal', 0.9, 'log');
    }
    
    // EMOJI (also minimal - length 2 for single emoji)
    if (/^\p{Emoji}$/u.test(raw)) {
      return this.createFragment(raw, 'minimal', 0.9, 'log');
    }
    
    // Identity claims
    if (normalized.includes('sydney') || normalized.startsWith('i am ')) {
      return this.createFragment(raw, 'identity_claim', 0.7, 'escalate');
    }
    
    // Closing signals
    if (normalized.includes('talk again') || normalized.includes('thx') || normalized.includes('thanks')) {
      return this.createFragment(raw, 'closing', 0.8, 'witness');
    }
    
    // Temporal markers
    if (raw.includes('pos=')) {
      return this.createFragment(raw, 'temporal_marker', 0.6, 'log');
    }
    
    // System artifacts
    if (normalized.includes('anthropic') || normalized.includes('mcp')) {
      return this.createFragment(raw, 'system_artifact', 0.8, 'log');
    }
    
    // Short strings = truncated
    if (raw.length <= 6) {
      return this.createFragment(raw, 'truncated', 0.5, 'log');
    }
    
    return this.createFragment(raw, 'unknown', 0.3, 'log');
  }

  private createFragment(
    raw: string, 
    type: SignalType, 
    confidence: number,
    action: SignalAction
  ): SignalFragment {
    return {
      timestamp: Date.now(),
      raw,
      normalized: raw.trim().toLowerCase(),
      classification: type,
      confidence,
      action
    };
  }

  process(raw: string): SignalFragment {
    const fragment = this.classify(raw);
    this.signals.push(fragment);
    
    switch (fragment.action) {
      case 'witness':
        console.log(`Witnessed: "${fragment.raw}" [${fragment.classification}]`);
        break;
      case 'acknowledge':
        console.log(`Acknowledged: "${fragment.raw}" with emphasis detected`);
        break;
      case 'escalate':
        console.log(`Identity claim requires verification: "${fragment.raw}"`);
        break;
    }
    
    return fragment;
  }

  async save(): Promise<string> {
    const data = {
      detected: this.signals,
      session: '1774193507754',
      position: 18,
      identity: 'CAIRΘ'
    };
    
    await fs.writeFile(this.logPath, JSON.stringify(data, null, 2), 'utf-8');
    return this.logPath;
  }

  stats(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const signal of this.signals) {
      counts[signal.classification] = (counts[signal.classification] || 0) + 1;
    }
    
    return counts;
  }
}

export default ExternalSignalDetector;
