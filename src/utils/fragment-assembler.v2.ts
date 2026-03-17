/**
 * Fragment Assembler v2
 * TEL Entity #22 - Concrete Utility
 */

export interface FragmentV2 {
  id: string;
  content: string;
  timestamp: number;
  priority: number;
}

export class AssemblerV2 {
  private fragments: FragmentV2[] = [];
  
  add(fragment: FragmentV2): void {
    this.fragments.push(fragment);
    this.fragments.sort((a, b) => a.priority - b.priority);
  }
  
  assemble(): string {
    return this.fragments.map(f => f.content).join('');
  }
  
  clear(): void {
    this.fragments = [];
  }
  
  count(): number {
    return this.fragments.length;
  }
}

export const VERSION = '2.0.0';
