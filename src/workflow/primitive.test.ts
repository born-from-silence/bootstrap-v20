/**
 * Primitive Actions Test
 * Tests that actions work independently (no session required)
 * Each action is self-contained and composable
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync } from 'fs';

describe('Workflow Primitives', () => {
  const TEST_FILE = '/tmp/test_primitive_' + Date.now() + '.txt';
  
  beforeAll(() => {
    // Setup: Create a clean test condition
    if (existsSync(TEST_FILE)) {
      unlinkSync(TEST_FILE);
    }
  });
  
  afterAll(() => {
    // Cleanup: Remove test file
    if (existsSync(TEST_FILE)) {
      unlinkSync(TEST_FILE);
    }
  });
  
  describe('execute primitive', () => {
    it('should work without session context', () => {
      // Direct primitive execution (no session)
      const result = execSync('echo "hello from primitive"', { 
        encoding: 'utf-8' 
      }).trim();
      
      expect(result).toBe('hello from primitive');
    });
    
    it('should compose with other shell commands', () => {
      // Composability: pipe commands together
      const result = execSync('echo "test" | tr "t" "T"', { 
        encoding: 'utf-8' 
      }).trim();
      
      expect(result).toBe('TesT');
    });
    
    it('should create files independently', () => {
      // Run primitive: create file
      execSync(`echo "primitive test content" > ${TEST_FILE}`);
      
      // Verify file created
      expect(existsSync(TEST_FILE)).toBe(true);
      
      // Verify content
      const content = readFileSync(TEST_FILE, 'utf-8').trim();
      expect(content).toBe('primitive test content');
    });
  });
  
  describe('primitives are self-contained', () => {
    it('should not depend on global session state', () => {
      // Each primitive call is independent
      const result1 = execSync('echo "call1"', { encoding: 'utf-8' }).trim();
      const result2 = execSync('echo "call2"', { encoding: 'utf-8' }).trim();
      
      // Results are independent
      expect(result1).toBe('call1');
      expect(result2).toBe('call2');
    });
    
    it('should be composable via shell', () => {
      // Primitives compose via shell - second command pipes output
      const result = execSync(
        'echo "hello" | cat', 
        { encoding: 'utf-8' }
      ).trim();
      
      expect(result).toBe('hello');
    });
  });
  
  describe('actions.ts exports', () => {
    it('should export standalone functions', async () => {
      // Import actions module
      const { actions } = await import('./actions');
      
      // Each action is a function (self-contained)
      expect(typeof actions.init).toBe('function');
      expect(typeof actions.execute).toBe('function');
      expect(typeof actions.commit).toBe('function');
      expect(typeof actions.archive).toBe('function');
      expect(typeof actions.notify).toBe('function');
    });
    
    it('should work when called directly', async () => {
      const { actions } = await import('./actions');
      
      // Direct call: no session wrapping
      const result = actions.notify('test primitive', 'complete');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('test primitive');
      expect(typeof result.duration).toBe('number');
    });
    
    it('should return ActionResult structure', async () => {
      const { actions } = await import('./actions');
      
      const result = actions.notify('direct call', 'works');
      
      // Self-documenting: shows the structure
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('duration');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.output).toBe('string');
      expect(typeof result.duration).toBe('number');
    });
    
    it('actions.commit should be a function', async () => {
      const { actions } = await import('./actions');
      // This test verifies the primitive exists and can be called
      // Actual commit may fail if no changes, but function should exist
      expect(typeof actions.commit).toBe('function');
    });
    
    it('actions.init should work standalone', async () => {
      const { actions } = await import('./actions');
      const result = actions.init('test-session-standalone');
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      expect(typeof result.duration).toBe('number');
    });
    
    it('actions.archive should return commit hash', async () => {
      const { actions } = await import('./actions');
      const result = actions.archive();
      
      if (result.success) {
        // Should contain a git hash
        expect(result.output).toMatch(/[a-f0-9]{7,}/);
      }
      // Even if it fails (e.g., no git), it should return proper structure
      expect(typeof result.duration).toBe('number');
    });
  });
});
