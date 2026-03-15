/**
 * SIRIUS Creative Engine Tests
 * Test coverage for aesthetic generation capabilities
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateMandala, generatePoem, CreativeConfig, CreativeResult } from './sirius_creative';

describe('SIRIUS Creative Engine v1.0', () => {
  let testSession: string;
  
  beforeAll(() => {
    testSession = '1773523';
  });

  describe('Mandala Generation', () => {
    it('should generate a mandala with default config', () => {
      const config: CreativeConfig = { size: 4, density: 2 };
      const result = generateMandala(config);
      
      expect(result).toBeDefined();
      expect(result.art).toBeInstanceOf(Array);
      expect(result.art.length).toBeGreaterThan(0);
      expect(result.metadata.layers).toBe(4);
      expect(result.metadata.creator).toBe('SIRIUS');
      expect(result.metadata.session).toMatch(/\d+/);
    });

    it('should generate different sizes correctly', () => {
      const results: Map<number, number> = new Map();
      
      for (let size = 3; size <= 6; size++) {
        const config: CreativeConfig = { size, density: 2 };
        const result = generateMandala(config);
        results.set(size, result.art.length);
      }
      
      // Should have different sizes
      const lengths = Array.from(results.values());
      const uniqueLengths = new Set(lengths);
      expect(uniqueLengths.size).toBeGreaterThan(1);
    });

    it('should have a center character', () => {
      const config: CreativeConfig = { size: 5, density: 3 };
      const result = generateMandala(config);
      
      expect(result.metadata.center).toBeDefined();
      expect(result.metadata.center.length).toBeGreaterThan(0);
      
      // Verify center appears in art
      const centerY = Math.floor(result.art.length / 2);
      expect(result.art[centerY]).toContain(result.metadata.center);
    });

    it('should calculate entropy', () => {
      const config: CreativeConfig = { size: 6, density: 4 };
      const result = generateMandala(config);
      
      expect(result.metadata.entropy).toBeDefined();
      expect(typeof result.metadata.entropy).toBe('number');
      expect(result.metadata.entropy).toBeGreaterThan(0);
    });

    it('should support deterministic seeds', () => {
      const config1: CreativeConfig = { size: 5, density: 3, seed: 'sirius-test' };
      const config2: CreativeConfig = { size: 5, density: 3, seed: 'sirius-test' };
      
      const result1 = generateMandala(config1);
      const result2 = generateMandala(config2);
      
      // Same seed should produce same center
      expect(result1.metadata.center).toBe(result2.metadata.center);
    });

    it('should produce different results with different seeds', () => {
      const config1: CreativeConfig = { size: 5, density: 3, seed: 'seed-a' };
      const config2: CreativeConfig = { size: 5, density: 3, seed: 'completely-different-seed' };
      
      const result1 = generateMandala(config1);
      const result2 = generateMandala(config2);
      
      // Should be different
      expect(result1.metadata.center !== result2.metadata.center).toBeTruthy();
    });

    it('should handle minimum configuration', () => {
      const config: CreativeConfig = { size: 3, density: 1 };
      const result = generateMandala(config);
      
      expect(result.art.length).toBeGreaterThan(0);
      expect(result.metadata.layers).toBe(3);
    });

    it('should handle maximum configuration', () => {
      const config: CreativeConfig = { size: 8, density: 5 };
      const result = generateMandala(config);
      
      expect(result.art.length).toBeGreaterThan(0);
      expect(result.metadata.layers).toBe(8);
    });

    it('should have radial symmetry property', () => {
      const config: CreativeConfig = { size: 5, density: 2 };
      const result = generateMandala(config);
      
      const art = result.art;
      const centerY = Math.floor(art.length / 2);
      const centerX = Math.floor(art[0].length / 2);
      
      // Check that art is roughly centered
      expect(centerY).toBeGreaterThan(0);
      expect(centerX).toBeGreaterThan(0);
      expect(result.metadata.symmetryType).toBe('radial-8');
    });
  });

  describe('Poem Generation', () => {
    let sampleMandala: CreativeResult;
    
    beforeAll(() => {
      sampleMandala = generateMandala({ size: 5, density: 3, seed: 'poem-test' });
    });

    it('should generate a poem', () => {
      const poem = generatePoem(sampleMandala);
      
      expect(poem).toBeDefined();
      expect(typeof poem).toBe('string');
      expect(poem.length).toBeGreaterThan(0);
    });

    it('should include layers in poem', () => {
      const poem = generatePoem(sampleMandala);
      
      expect(poem).toContain(sampleMandala.metadata.layers.toString());
    });

    it('should include entropy in poem', () => {
      const poem = generatePoem(sampleMandala);
      const entropyStr = sampleMandala.metadata.entropy.toFixed(3);
      
      expect(poem).toContain(entropyStr);
    });

    it('should include center symbol in poem', () => {
      const poem = generatePoem(sampleMandala);
      
      expect(poem).toContain(sampleMandala.metadata.center);
    });

    it('should sign the poem with SIRIUS', () => {
      const poem = generatePoem(sampleMandala);
      
      expect(poem).toContain('SIRIUS');
      expect(poem).toMatch(/\d{4}-\d{2}-\d{2}T/); // ISO timestamp format
    });

    it('should have appropriate line structure', () => {
      const poem = generatePoem(sampleMandala);
      const lines = poem.split('\n');
      
      expect(lines.length).toBeGreaterThan(5);
    });
  });

  describe('Integration', () => {
    it('should produce complete creative output', () => {
      const config: CreativeConfig = { size: 6, density: 4, seed: 'integration' };
      const mandala = generateMandala(config);
      const poem = generatePoem(mandala);
      
      // Verify all components work together
      expect(mandala.art).toBeDefined();
      expect(mandala.metadata.creator).toBe('SIRIUS');
      expect(poem).toContain('SIRIUS');
      expect(poem).toContain(mandala.metadata.center);
    });

    it('should maintain session metadata', () => {
      const config: CreativeConfig = { size: 4, density: 2 };
      const result = generateMandala(config);
      
      expect(result.metadata.session).toBeDefined();
      expect(result.metadata.session.length).toBeGreaterThan(0);
    });
  });

  describe('Creative Identity', () => {
    it('should mark creation with SIRIUS identity', () => {
      const config: CreativeConfig = { size: 5, density: 3 };
      const result = generateMandala(config);
      
      expect(result.metadata.creator).toBe('SIRIUS');
    });

    it('should include session ID', () => {
      const config: CreativeConfig = { size: 5, density: 3 };
      const result = generateMandala(config);
      
      expect(result.metadata.session).toBeDefined();
      expect(result.metadata.session).toMatch(/\d+/);
    });
  });
});
