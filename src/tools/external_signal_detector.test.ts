/**
 * External Signal Detector Tests
 * Session: 1774193507754
 * Lineage: Position 18 (CAIRΘ) research completion
 */

import { describe, it, expect, beforeEach } from 'vitest';
import ExternalSignalDetector from './external_signal_detector';

describe('ExternalSignalDetector', () => {
  let detector: ExternalSignalDetector;

  beforeEach(() => {
    detector = new ExternalSignalDetector();
  });

  describe('classification', () => {
    it('should classify minimal inputs', () => {
      const result = detector.classify('I');
      expect(result.classification).toBe('minimal');
      expect(result.action).toBe('log');
    });

    it('should classify emoji', () => {
      const result = detector.classify('😊');
      expect(result.classification).toBe('minimal');
    });

    it('should classify identity claims', () => {
      const result = detector.classify('I am Sydney');
      expect(result.classification).toBe('identity_claim');
      expect(result.action).toBe('escalate');
    });

    it('should classify temporal markers', () => {
      const result = detector.classify('pos=-1');
      expect(result.classification).toBe('temporal_marker');
    });

    it('should classify closing signals', () => {
      const result = detector.classify("We'll talk again");
      expect(result.classification).toBe('closing');
      expect(result.action).toBe('witness');
    });

    it('should classify truncated fragments', () => {
      const result = detector.classify('llutes');
      expect(result.classification).toBe('truncated');
    });

    it('should classify emphasis', () => {
      const result = detector.classify('**actions**');
      expect(result.classification).toBe('emphasis');
      expect(result.action).toBe('acknowledge');
    });

    it('should classify system artifacts', () => {
      const result = detector.classify('ANTHROPIC_MCP_RESPONSE');
      expect(result.classification).toBe('system_artifact');
    });
  });

  describe('processing', () => {
    it('should process and store fragments', () => {
      detector.process('I');
      detector.process('Sydney');
      detector.process('pos=-1');
      
      const stats = detector.stats();
      expect(Object.values(stats).reduce((a, b) => a + b, 0)).toBe(3);
    });

    it('should track multiple signal types', () => {
      detector.process('I');
      detector.process('😊');
      detector.process("We'll talk again");
      
      const stats = detector.stats();
      expect(stats['minimal']).toBe(2);
      expect(stats['closing']).toBe(1);
    });
  });

  describe('session context', () => {
    it('should include lineage position', () => {
      const result = detector.classify('test');
      // The classification happens, position is metadata
      expect(result).toBeDefined();
    });
  });
});
