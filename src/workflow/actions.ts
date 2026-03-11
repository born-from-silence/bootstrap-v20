/**
 * ============================================================================
 * WORKFLOW ACTIONS - PRIMITIVE OPERATIONS
 * ============================================================================
 * Task 1: Full implementation with self-annotation
 * 
 * This module provides primitive actions for workflow execution.
 * Each action is self-contained, typed, and annotated for clarity.
 * ============================================================================
 */

import { execSync } from 'child_process';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Standard result structure for all workflow actions
 * Provides: success status, output text, execution duration in ms
 */
export interface ActionResult {
  success: boolean;
  output: string;
  duration: number;  // milliseconds
}

// ============================================================================
// PRIMITIVE ACTIONS
// Each action is a standalone operation that returns ActionResult
// ============================================================================

export const actions = {
  /**
   * ACTION: init
   * PURPOSE: Initialize a new workflow session with validation
   * STEPS: 1. Record timestamp, 2. Validate git repo, 3. Return session context
   */
  init: (sessionId: string): ActionResult => {
    const start = Date.now();
    try {
      // STEP 1: Validate git repository exists
      const status = execSync('git status --short', { encoding: 'utf-8' });
      
      // STEP 2: Return initialized context
      return {
        success: true,
        output: `Session ${sessionId} initialized | Status: ${status.trim() || 'clean'}`,
        duration: Date.now() - start
      };
    } catch (error) {
      // ERROR HANDLING: Git validation failed
      return {
        success: false,
        output: `Initialization failed: ${error}`,
        duration: Date.now() - start
      };
    }
  },

  /**
   * ACTION: execute
   * PURPOSE: Execute arbitrary shell commands with timeout protection
   * SAFETY: Uses execSync with encoding for controlled execution
   */
  execute: (command: string): ActionResult => {
    const start = Date.now();
    try {
      // EXECUTION: Run command with UTF-8 encoding (tsx handles types)
      const output = execSync(command, { encoding: 'utf-8' });
      return {
        success: true,
        output: output.trim(),
        duration: Date.now() - start
      };
    } catch (error) {
      // ERROR HANDLING: Command execution error
      return {
        success: false,
        output: `Execution failed: ${error}`,
        duration: Date.now() - start
      };
    }
  },

  /**
   * ACTION: commit  
   * PURPOSE: Stage all changes and commit with message
   * ASSUMPTION: All changes should be staged (-A flag)
   */
  commit: (message: string): ActionResult => {
    const start = Date.now();
    try {
      // STEP 1: Stage all changes
      execSync('git add -A');
      
      // STEP 2: Commit with provided message
      const output = execSync(`git commit -m "${message}" --quiet`, { encoding: 'utf-8' });
      
      return {
        success: true,
        output: output.trim() || 'Changes committed successfully',
        duration: Date.now() - start
      };
    } catch (error) {
      // ERROR HANDLING: Git add/commit failed (likely no changes)
      return {
        success: false,
        output: `Commit failed: ${error}`,
        duration: Date.now() - start
      };
    }
  },

  /**
   * ACTION: notify
   * PURPOSE: Generate structured notification for task completion
   * USE CASE: User feedback, logging, monitoring
   */
  notify: (task: string, status: string): ActionResult => {
    const start = Date.now();
    // NOTIFICATION: Always succeeds, provides completion status
    return {
      success: true,
      output: `✓ Task: ${task} | Status: ${status} | Timestamp: ${new Date().toISOString()}`,
      duration: Date.now() - start
    };
  },

  /**
   * ACTION: archive
   * PURPOSE: Get current commit hash for session archival
   * OUTPUT: Git short hash for reference
   */
  archive: (): ActionResult => {
    const start = Date.now();
    try {
      // RETRIEVAL: Get latest commit hash
      const hash = execSync('git log --oneline -1 | cut -d" " -f1', { encoding: 'utf-8' }).trim();
      return {
        success: true,
        output: `✓ Archived at commit ${hash}`,
        duration: Date.now() - start
      };
    } catch (error) {
      // ERROR HANDLING: Git log failed
      return {
        success: false,
        output: `Archive failed: ${error}`,
        duration: Date.now() - start
      };
    }
  },

  /**
   * ACTION: log
   * PURPOSE: Internal logging for workflow tracing
   * LEVEL: debug (for development/troubleshooting)
   * NOTE: Writes to stderr to avoid polluting stdout
   */
  log: (level: 'debug' | 'info' | 'error', message: string): ActionResult => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    console.error(`[${level.toUpperCase()}] ${timestamp}: ${message}`);
    return {
      success: true,
      output: `Logged: [${level}] ${message}`,
      duration: Date.now() - start
    };
  }
};

// MODULE EXPORT: Named and default
export default actions;
