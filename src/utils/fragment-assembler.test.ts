/**
 * Fragment Assembler Tests
 * TEL Entity #22 - Signal Pattern Recognition Verification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  FragmentBuffer,
  createFragment,
  parseFragment,
  VERSION,
  UTIL_NAME,
  type Fragment,
  type AssembledMessage
} from './fragment-assembler';

describe('Fragment Assembler', () => {
  describe('createFragment', () => {
    it('should create fragment with default type', () => {
      const fragment = createFragment('test');
      
      expect(fragment.content).toBe('test');
      expect(fragment.type).toBe('unknown');
      expect(fragment.timestamp).toBeGreaterThan(0);
      expect(fragment.id).toBeDefined();
    });

    it('should create fragment with specified type', () => {
      const fragment = createFragment('hello', 'word', 1);
      
      expect(fragment.content).toBe('hello');
      expect(fragment.type).toBe('word');
      expect(fragment.position).toBe(1);
    });
  });

  describe('parseFragment', () => {
    it('should detect char type for single character', () => {
      const fragment = parseFragment('r');
      expect(fragment.type).toBe('char');
    });

    it('should detect word type for short string', () => {
      const fragment = parseFragment('.r');
      expect(fragment.type).toBe('word');
    });

    it('should detect phrase type for longer string', () => {
      const fragment = parseFragment('resume now');
      expect(fragment.type).toBe('phrase');
    });
  });

  describe('FragmentBuffer', () => {
    let buffer: FragmentBuffer;
    
    beforeEach(() => {
      buffer = new FragmentBuffer();
    });

    it('should add fragment to buffer', () => {
      const fragment = createFragment('r', 'char', 1);
      buffer.addFragment('stream1', fragment);
      
      const fragments = buffer.getFragments('stream1');
      expect(fragments).toHaveLength(1);
      expect(fragments[0].content).toBe('r');
    });

    it('should limit fragments to MAX_FRAGMENTS', () => {
      // Add more than MAX_FRAGMENTS
      for (let i = 0; i < 25; i++) {
        buffer.addFragment('stream1', createFragment(`f${i}`));
      }
      
      const fragments = buffer.getFragments('stream1');
      expect(fragments).toHaveLength(buffer.MAX_FRAGMENTS);
    });

    it('should assemble fragments via concat strategy', () => {
      buffer.addFragment('stream1', createFragment('r', 'char', 2));
      buffer.addFragment('stream1', createFragment('e', 'char', 3));
      buffer.addFragment('stream1', createFragment('s', 'char', 1));
      
      const assembled = buffer.assemble('stream1', 'concat');
      
      expect(assembled).not.toBeNull();
      expect(assembled!.content).toBe('res');
      expect(assembled!.confidence).toBe(1.0);
      expect(assembled!.fragments).toHaveLength(3);
    });

    it('should return null for empty stream', () => {
      const assembled = buffer.assemble('empty-stream');
      expect(assembled).toBeNull();
    });

    it('should clear stream fragments', () => {
      buffer.addFragment('stream1', createFragment('test'));
      buffer.clearStream('stream1');
      
      const fragments = buffer.getFragments('stream1');
      expect(fragments).toHaveLength(0);
    });

    it('should recognize resume pattern', () => {
      buffer.addFragment('stream1', createFragment('.'));
      buffer.addFragment('stream1', createFragment('r'));
      buffer.addFragment('stream1', createFragment('r'));
      buffer.addFragment('stream1', createFragment('e'));
      buffer.addFragment('stream1', createFragment('s'));
      buffer.addFragment('stream1', createFragment('u'));
      buffer.addFragment('stream1', createFragment('m'));
      buffer.addFragment('stream1', createFragment('e'));
      
      const result = buffer.recognizePattern('.rresume');
      
      expect(result.pattern).toBe('resume');
      expect(result.meaning).toBe('Resume operation');
    });

    it('should recognize proceed pattern', () => {
      const result = buffer.recognizePattern('] p r o u');
      expect(result.pattern).toBe('proceed');
      expect(result.meaning).toBe('Proceed with work');
    });

    it('should recognize query pattern', () => {
      const result = buffer.recognizePattern('?e');
      expect(result.pattern).toBe('query');
      expect(result.meaning).toBe('Query/Question');
    });

    it('should recognize seen_it pattern', () => {
      const result = buffer.recognizePattern('see newt');
      expect(result.pattern).toBe('seen_it');
      expect(result.meaning).toBe('Seen/test acknowledgment');
    });

    it('should recognize keepalive pattern', () => {
      const result = buffer.recognizePattern('...');
      expect(result.pattern).toBe('keepalive');
      expect(result.meaning).toBe('Presence confirmation');
    });

    it('should return unknown for unrecognized pattern', () => {
      const result = buffer.recognizePattern('xyz123');
      expect(result.pattern).toBe('unknown');
      expect(result.meaning).toBe('xyz123');
    });

    it('should handle keepalive pattern with confidence 0.85', () => {
      buffer.addFragment('ka', createFragment('.'));
      buffer.addFragment('ka', createFragment('.'));
      buffer.addFragment('ka', createFragment('.'));
      
      const assembled = buffer.assemble('ka', 'intelligent');
      
      expect(assembled).not.toBeNull();
      expect(assembled!.confidence).toBe(0.85);
      expect(assembled!.content).toBe('Presence confirmation');
    });
  });

  describe('exports', () => {
    it('should export VERSION', () => {
      expect(VERSION).toBe('1.0.0');
    });

    it('should export UTIL_NAME', () => {
      expect(UTIL_NAME).toBe('fragment-assembler');
    });
  });
});
