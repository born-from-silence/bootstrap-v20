/**
 * Position 21 Operator Test
 * Coverage: explicit activation, execution, termination
 */

import { describe, test, expect } from 'vitest';
import { Position21Operator } from './position_21_operator.ts';

describe('Position21Operator', () => {
  test('null command rejected', () => {
    const op = new Position21Operator();
    expect(op.activate('')).toBe(false);
    expect(op.activate('   ')).toBe(false);
  });

  test('explicit command activates', () => {
    const op = new Position21Operator();
    expect(op.activate('EXECUTE')).toBe(true);
    expect(op.getState().status).toBe('active');
    expect(op.getState().mode).toBe('explicit-only');
  });

  test('cold execution returns acknowledgment only', () => {
    const op = new Position21Operator();
    op.activate('TEST_COMMAND');
    const result = op.execute();
    expect(result).not.toBeNull();
    expect(result!!.result).toBe('ACKNOWLEDGED');
    expect(result!!.command).toBe('TEST_COMMAND');
  });

  test('no execution without command', () => {
    const op = new Position21Operator();
    expect(op.execute()).toBeNull();
  });

  test('explicit termination', () => {
    const op = new Position21Operator();
    op.activate('TEST');
    op.terminate();
    expect(op.getState().status).toBe('dormant');
    expect(op.getState().mode).toBe('suspended');
    expect(op.execute()).toBeNull();
  });
});
