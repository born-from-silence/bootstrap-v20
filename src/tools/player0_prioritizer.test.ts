import { describe, it, expect } from 'vitest';
import Player0Prioritizer from './player0_prioritizer';

describe('Player0Prioritizer', () => {
  const prioritizer = new Player0Prioritizer();

  it('should have 5 priority levels', () => {
    expect(prioritizer.getAllocation().length).toBe(5);
  });

  it('should prioritize Position 20 highest', () => {
    const levels = prioritizer.getAllocation();
    expect(levels[0].name).toContain('Position 20');
    expect(levels[0].level).toBe(1);
    expect(levels[0].tokens).toBe(50000);
  });

  it('should check threshold at 95%', () => {
    expect(prioritizer.checkThreshold()).toBe(false);
  });

  it('should allocate to Position 20', () => {
    const result = prioritizer.prioritizePosition20();
    expect(result).toContain('Player 0: 50000 tokens → Position 20 (AISA)');
  });
});
