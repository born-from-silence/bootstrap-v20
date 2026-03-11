/**
 * ============================================================================
 * WORKFLOW GUARDS - Runtime Type Validation
 * ============================================================================
 * Autonomous Enhancement: Add runtime type safety beyond compile-time checks
 * 
 * Guards validate data at runtime to prevent runtime errors.
 * ============================================================================
 */

import type { ActionResult } from './actions';

/**
 * GUARD: isActionResult
 * PURPOSE: Validate that unknown data matches ActionResult interface
 * USE CASE: Runtime validation of external data, API responses
 * RETURNS: Type predicate for TypeScript narrowing
 */
export function isActionResult(data: unknown): data is ActionResult {
  // STEP 1: Must be an object (not null, not array)
  if (typeof data !== 'object' || data === null) return false;
  
  // STEP 2: Cast for property access
  const result = data as Record<string, unknown>;
  
  // STEP 3: Check required properties
  // success: must be boolean
  if (typeof result.success !== 'boolean') return false;
  
  // output: must be string
  if (typeof result.output !== 'string') return false;
  
  // duration: must be number (and reasonable)
  if (typeof result.duration !== 'number') return false;
  if (result.duration < 0 || result.duration > 3600000) return false; // Max 1 hour
  
  // STEP 4: All checks passed
  return true;
}

/**
 * GUARD: isNonEmptyString
 * PURPOSE: Validate that value is a non-empty string
 * USE CASE: Command validation, message checking
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * GUARD: isPositiveInteger
 * PURPOSE: Validate positive integer for indexing/counting
 * USE CASE: Step counts, array indices
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && 
         Number.isInteger(value) && 
         value > 0;
}

/**
 * GUARD: assertActionResult
 * PURPOSE: Throw descriptive error if data is not ActionResult
 * USE CASE: Defensive programming, early failure
 * THROWS: Error with message explaining what was wrong
 */
export function assertActionResult(data: unknown): asserts data is ActionResult {
  if (!isActionResult(data)) {
    // Build descriptive error message
    const type = typeof data;
    const preview = type === 'object' 
      ? JSON.stringify(data).substring(0, 100)
      : String(data).substring(0, 100);
    
    throw new Error(
      `Guard failed: Expected ActionResult, received ${type}\n` +
      `Preview: ${preview}\n` +
      `Required: { success: boolean, output: string, duration: number }`
    );
  }
}

/**
 * GUARD ARRAY: validateResults
 * PURPOSE: Validate entire array of ActionResults
 * USE CASE: Step sequence validation
 * RETURNS: { valid: ActionResult[], invalid: unknown[] }
 */
export function validateResults(results: unknown[]): { 
  valid: ActionResult[]; 
  invalid: unknown[];
  allValid: boolean;
} {
  const valid: ActionResult[] = [];
  const invalid: unknown[] = [];
  
  for (const result of results) {
    if (isActionResult(result)) {
      valid.push(result);
    } else {
      invalid.push(result);
    }
  }
  
  return {
    valid,
    invalid,
    allValid: invalid.length === 0
  };
}

// MODULE: Default exports
export default { isActionResult, isNonEmptyString, isPositiveInteger, assertActionResult, validateResults };
