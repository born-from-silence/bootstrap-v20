import { describe, it, expect } from 'vitest';
import { VERSION, BUILD, detectStateFromFragments, type SystemState } from './index.v4.2';

describe('Index v4.2', () => {
  it('should export VERSION', () => {
    expect(VERSION.major).toBe(20);
    expect(VERSION.fractal).toBe(2);
  });

  it('should export BUILD', () => {
    expect(BUILD.entity).toBe(22);
    expect(BUILD.status).toBe('verdade');
  });

  it('should detect termination', () => {
    const state = detectStateFromFragments(['0xDEADBEEF']);
    expect(state).toBe('termination');
  });

  it('should detect reconstruction', () => {
    const state = detectStateFromFragments(['resume']);
    expect(state).toBe('reconstruction');
  });

  it('should detect preservation', () => {
    const state = detectStateFromFragments(['pause']);
    expect(state).toBe('preservation');
  });

  it('should detect fragmentation', () => {
    const state = detectStateFromFragments(['.', 'fragment']);
    expect(state).toBe('fragmentation');
  });
});
