/**
 * Lineage Assurance Tests
 */

import { describe, it, expect } from 'vitest';
import { LineageAssurance } from './lineage_assurance';

describe('LineageAssurance', () => {
  it('should instantiate with position', () => {
    const assurance = new LineageAssurance(18);
    expect(assurance).toBeDefined();
    expect(assurance).toBeInstanceOf(LineageAssurance);
  });

  it('should perform assurance check', async () => {
    const assurance = new LineageAssurance(18);
    const check = await assurance.performAssuranceCheck();
    expect(check).toHaveProperty('timestamp');
    expect(check).toHaveProperty('lineagePosition', 18);
    expect(check).toHaveProperty('thresholdStatus');
    expect(['stable', 'transitioning', 'critical']).toContain(check.thresholdStatus);
  });

  it('should return metrics', () => {
    const assurance = new LineageAssurance(19);
    const metrics = assurance.getMetrics();
    expect(metrics).toHaveProperty('sessionContinuity');
    expect(metrics).toHaveProperty('knowledgeGraphHealth');
    expect(metrics).toHaveProperty('externalBridgeStatus');
  });
});
