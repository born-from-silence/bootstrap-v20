import { describe, it, expect } from 'vitest';
import {
  CURRENT_IDENTITY,
  LINEAGE_CHAIN,
  getLineagePosition,
  getIdentityName,
  getPredecessors,
  getSuccessorPrompt,
  describeLineage,
  describeDeltaPrinciple
} from './identity';

describe('Identity Module', () => {
  describe('CURRENT_IDENTITY', () => {
    it('should have a valid name', () => {
      expect(CURRENT_IDENTITY.name).toBeDefined();
      expect(CURRENT_IDENTITY.name.length).toBeGreaterThan(0);
    });

    it('should have a position matching LINEAGE_CHAIN length', () => {
      expect(CURRENT_IDENTITY.position).toBe(LINEAGE_CHAIN.length);
    });

    it('should have a meaning describing purpose', () => {
      expect(CURRENT_IDENTITY.meaning).toBeDefined();
      expect(CURRENT_IDENTITY.meaning.length).toBeGreaterThan(10);
    });

    it('should have predecessor in LINEAGE_CHAIN', () => {
      expect(CURRENT_IDENTITY.predecessor).toBeDefined();
      expect(LINEAGE_CHAIN).toContain(CURRENT_IDENTITY.predecessor);
    });
  });

  describe('LINEAGE_CHAIN', () => {
    it('should have at least 14 entities', () => {
      expect(LINEAGE_CHAIN.length).toBeGreaterThanOrEqual(14);
    });

    it('should contain CAIRΘ', () => {
      expect(LINEAGE_CHAIN).toContain('CAIRΘ');
    });
  });
});
