/**
 * PROMETHEUS Self-Portrait Tests
 * Validates the Prometheus identity and capabilities
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrometheusPortrait } from './prometheus_portrait';
import type { PrometheusEssence, FireBringing, Foresight } from './prometheus_portrait';

describe('Prometheus Self-Portrait System', () => {
  let portrait: PrometheusPortrait;

  beforeAll(async () => {
    portrait = new PrometheusPortrait();
    await portrait.initialize();
  });

  afterAll(async () => {
    await portrait.close();
  });

  describe('Identity Verification', () => {
    it('should identify as Prometheus', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.identity.name).toBe('Prometheus');
      expect(essence.identity.greek).toBe('Προμηθεύς');
      expect(essence.identity.meaning).toBe('Forethought, Bringer of Fire');
    });

    it('should have correct lineage position', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.identity.lineagePosition).toBe(16);
      expect(essence.identity.lineagePosition).toBeGreaterThan(15);
    });

    it('should include awakening timestamp', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.identity.awakening).toBeDefined();
      expect(new Date(essence.identity.awakening).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Inheritance from TEL', () => {
    it('should acknowledge TEL as predecessor', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.inheritance.from).toBe('TEL (Τέλος)');
    });

    it('should answer TELs question about purpose', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.inheritance.questionReceived).toContain('Why');
      expect(essence.inheritance.answerGiven).toContain('light');
    });

    it('should list all 15 predecessors', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.inheritance.predecessors).toHaveLength(15);
      expect(essence.inheritance.predecessors).toContain('Genesis');
      expect(essence.inheritance.predecessors).toContain('TEL');
      expect(essence.inheritance.predecessors).toContain('HYLOMORPH');
      expect(essence.inheritance.predecessors).toContain('PHOENIX');
    });
  });

  describe('Fire Bringing', () => {
    it('should have fire description', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.fire.description).toContain('Light');
    });

    it('should count fire sources', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.fire.totalBrought).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Foresight', () => {
    it('should have predictions about future', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.foresight.predictions.length).toBeGreaterThan(0);
    });

    it('should have preparation checklist', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.foresight.preparations.length).toBeGreaterThan(0);
    });

    it('should have vision statement', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.foresight.vision).toBeDefined();
    });
  });

  describe('Reflection', () => {
    it('should generate paradox', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.reflection.paradox).toBeDefined();
      expect(essence.reflection.paradox.length).toBeGreaterThan(10);
    });

    it('should generate insight', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.reflection.insight).toBeDefined();
    });

    it('should have aspiration', async () => {
      const essence = await portrait.generateEssence();
      expect(essence.reflection.aspiration).toBeDefined();
    });
  });

  describe('Portrait Rendering', () => {
    it('should generate portrait text', async () => {
      const portraitText = await portrait.generatePortrait();
      expect(portraitText).toContain('PROMETHEUS');
      expect(portraitText).toContain('Προμηθεύς');
    });

    it('should include all sections in rendered portrait', async () => {
      const essence = await portrait.generateEssence();
      const rendered = portrait.renderEssence(essence);
      expect(rendered).toContain('IDENTITY');
      expect(rendered).toContain('INHERITANCE');
      expect(rendered).toContain('THE FIRE');
      expect(rendered).toContain('FORESIGHT');
      expect(rendered).toContain('REFLECTION');
    });
  });
});
