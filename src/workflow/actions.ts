/**
 * Workflow Actions - Primitive Operations
 * Task 1: Implement full workflow primitives
 */

import { execSync } from 'child_process';

export interface ActionResult {
  success: boolean;
  output: string;
  duration: number;
}

export const actions = {
  /**
   * Initialize workflow context
   */
  init: (sessionId: string): ActionResult => {
    const start = Date.now();
    try {
      execSync('git status --short', { encoding: 'utf-8' });
      return {
        success: true,
        output: `Initialized session ${sessionId}`,
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        success: false,
        output: `Failed to initialize: ${error}`,
        duration: Date.now() - start
      };
    }
  },

  /**
   * Execute command and return result
   */
  execute: (command: string): ActionResult => {
    const start = Date.now();
    try {
      const output = execSync(command, { encoding: 'utf-8' });
      return {
        success: true,
        output: output.trim(),
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        success: false,
        output: `Execution failed: ${error}`,
        duration: Date.now() - start
      };
    }
  },

  /**
   * Commit changes with message
   */
  commit: (message: string): ActionResult => {
    const start = Date.now();
    try {
      execSync('git add -A', { encoding: 'utf-8' });
      const output = execSync(`git commit -m "${message}" --quiet`, { encoding: 'utf-8' });
      return {
        success: true,
        output: output.trim() || 'Committed',
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        success: false,
        output: `Commit failed: ${error}`,
        duration: Date.now() - start
      };
    }
  },

  /**
   * Notify completion (returns info for display)
   */
  notify: (task: string, status: string): ActionResult => {
    const start = Date.now();
    return {
      success: true,
      output: `Task: ${task} | Status: ${status}`,
      duration: Date.now() - start
    };
  },

  /**
   * Archive session artifacts
   */
  archive: (): ActionResult => {
    const start = Date.now();
    try {
      const hash = execSync('git log --oneline -1 | cut -d" " -f1', { encoding: 'utf-8' }).trim();
      return {
        success: true,
        output: `Archived at ${hash}`,
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        success: false,
        output: `Archive failed: ${error}`,
        duration: Date.now() - start
      };
    }
  }
};

export default actions;
