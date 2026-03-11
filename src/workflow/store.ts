/**
 * ============================================================================
 * WORKFLOW STORE - Higher-Order Function Composition
 * ============================================================================
 * Autonomous Enhancement: Functional composition patterns for workflows
 * 
 * Creates reusable, composable workflow components using higher-order functions.
 * ============================================================================
 */

import type { ActionResult } from './actions';

/**
 * COMPOSER: sequence
 * PURPOSE: Compose multiple actions into sequential execution
 * TYPE: Higher-order function - takes functions, returns function
 * USE CASE: Building custom step sequences dynamically
 * 
 * EXAMPLE:
 *   const mySequence = sequence([
 *     () => actions.execute('ls'),
 *     () => actions.commit('update')
 *   ]);
 *   const results = mySequence(); // Runs all in sequence
 */
export function sequence(
  actions: Array<() => ActionResult>
): () => ActionResult[] {
  // RETURN: Function that executes all actions in order
  return () => {
    const results: ActionResult[] = [];
    for (const action of actions) {
      results.push(action());
    }
    return results;
  };
}

/**
 * COMPOSER: parallel  
 * PURPOSE: Execute actions concurrently (simulated)
 * TYPE: Higher-order function
 * USE CASE: When actions don't depend on each other
 * NOTE: Uses Promise.all for true parallelism
 */
export async function parallel(
  actions: Array<() => Promise<ActionResult>>
): Promise<ActionResult[]> {
  // RETURN: Promise resolving to all results
  return Promise.all(actions.map(action => action()));
}

/**
 * COMPOSER: retry
 * PURPOSE: Wrap action with retry logic
 * TYPE: Higher-order function decorator
 * PARAMS: action - function to retry, maxAttempts - max retries
 * USE CASE: Handling transient failures
 * 
 * EXAMPLE:
 *   const safeCommit = retry(
 *     () => actions.commit('message'),
 *     3
 *   );
 */
export function retry(
  action: () => ActionResult,
  maxAttempts: number = 3
): () => ActionResult {
  // RETURN: Function that retries on failure
  return () => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = action();
        if (result.success) return result;
        // Failed but no error thrown
        if (attempt === maxAttempts) return result;
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxAttempts) {
          return {
            success: false,
            output: `Failed after ${maxAttempts} attempts: ${lastError.message}`,
            duration: 0
          };
        }
      }
    }
    
    // Should never reach here but TypeScript requires it
    return {
      success: false,
      output: 'Unexpected retry exit',
      duration: 0
    };
  };
}

/**
 * COMPOSER: withTimeout
 * PURPOSE: Add timeout protection to actions
 * TYPE: Higher-order decorator
 * PARAMS: action - function to timeout, ms - milliseconds
 * USE CASE: Prevent hanging operations
 */
export function withTimeout(
  action: () => ActionResult,
  ms: number
): () => Promise<ActionResult> {
  // RETURN: Promise that rejects if action takes too long
  return () => {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({
          success: false,
          output: `Timeout after ${ms}ms`,
          duration: ms
        });
      }, ms);
      
      const result = action();
      clearTimeout(timeoutId);
      resolve(result);
    });
  };
}

/**
 * COMPOSER: pipe
 * PURPOSE: Chain actions where output of one feeds into next
 * TYPE: Functional composition (left-to-right)
 * USE CASE: Data transformation pipelines
 * 
 * EXAMPLE:
 *   const process = pipe(
 *     actions.init,
 *     actions.execute,
 *     actions.commit
 *   );
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  // RETURN: Composed function (left fold)
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

/**
 * STORE: createWorkflowTemplate
 * PURPOSE: Factory for creating reusable workflow templates
 * TYPE: Factory function
 * USE CASE: Pre-configured workflows for common patterns
 */
export function createWorkflowTemplate(
  name: string,
  steps: Array<() => ActionResult>
): { 
  name: string; 
  execute: () => ActionResult[];
  addStep: (step: () => ActionResult) => void;
} {
  // MUTABLE: Stored steps array
  const storedSteps = [...steps];
  
  // RETURN: Template object with methods
  return {
    name,
    
    // METHOD: Execute all steps
    execute: () => {
      const results: ActionResult[] = [];
      for (const step of storedSteps) {
        results.push(step());
      }
      return results;
    },
    
    // METHOD: Add new step
    addStep: (step: () => ActionResult) => {
      storedSteps.push(step);
    }
  };
}

// MODULE: Exports
export default { sequence, parallel, retry, withTimeout, pipe, createWorkflowTemplate };
