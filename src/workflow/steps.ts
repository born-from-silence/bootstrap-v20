/**
 * ============================================================================
 * WORKFLOW STEPS - EXECUTION SEQUENCES
 * ============================================================================
 * Task 1: Full implementation with self-annotation
 * 
 * This module composes primitive actions into executable step sequences.
 * Each step is a higher-order function that orchestrates multiple actions.
 * ============================================================================
 */

// IMPORT: Primitive actions from actions module
import { actions } from './actions';

// IMPORT TYPES: Use type-only import for strict TypeScript (verbatimModuleSyntax)
import type { ActionResult } from './actions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Step interface: Defines the structure of a workflow step
 * Used for type checking and documentation
 */
export interface Step {
  name: string;                    // Human-readable step name
  execute: () => ActionResult;     // Function that executes the step
}

// ============================================================================
// STEP SEQUENCES
// Composition of actions into logical workflows
// ============================================================================

export const steps = {
  /**
   * STEP: standard
   * PURPOSE: Complete workflow from initialization to archival
   * SEQUENCE: init → execute → commit → notify → archive
   * USE CASE: Standard task execution with full lifecycle
   */
  standard: (sessionId: string, command: string, commitMsg: string): ActionResult[] => {
    // ANNOTATION: Initialize results array to track full execution
    const results: ActionResult[] = [];
    
    // STEP 1: Initialize session context
    // ANNOTATION: Sets up session tracking and validates git state
    results.push(actions.init(sessionId));
    
    // STEP 2: Execute the primary command
    // ANNOTATION: Runs the actual work (e.g., file creation, test execution)
    results.push(actions.execute(command));
    
    // STEP 3: Commit all changes
    // ANNOTATION: Persists work to git with descriptive message
    results.push(actions.commit(commitMsg));
    
    // STEP 4: Notify completion
    // ANNOTATION: Generates status report for user/monitoring
    results.push(actions.notify('standard workflow', 'complete'));
    
    // STEP 5: Archive session
    // ANNOTATION: Captures commit hash for reference and traceability
    results.push(actions.archive());
    
    // RETURN: Full sequence of results for inspection
    return results;
  },

  /**
   * STEP: createFile
   * PURPOSE: Create a file with content and commit it
   * SEQUENCE: create → commit → notify
   * USE CASE: File generation workflows (documentation, configs, code)
   */
  createFile: (filename: string, content: string, commitMsg: string): ActionResult[] => {
    const results: ActionResult[] = [];
    
    // STEP 1: Create file with content
    // ANNOTATION: Uses heredoc syntax to write content safely
    // SECURITY: Content is escaped via heredoc delimiter
    results.push(actions.execute(`cat > ${filename} << 'EOF'\n${content}\nEOF`));
    
    // STEP 2: Commit the new file
    // ANNOTATION: Standard git add/commit cycle
    results.push(actions.commit(commitMsg));
    
    // STEP 3: Notify creation
    // ANNOTATION: Confirms file was created and committed
    results.push(actions.notify(`create ${filename}`, 'complete'));
    
    return results;
  },

  /**
   * STEP: gitWorkflow
   * PURPOSE: Standard git operations sequence
   * SEQUENCE: status → add → commit → verify
   * USE CASE: Clean git operations with verification
   */
  gitWorkflow: (commitMsg: string): ActionResult[] => {
    const results: ActionResult[] = [];
    
    // STEP 1: Check current status
    // ANNOTATION: Shows what files are modified before committing
    results.push(actions.execute('git status --short'));
    
    // STEP 2: Stage all changes
    // ANNOTATION: -A flag ensures all changes (new, modified, deleted) are staged
    results.push(actions.execute('git add -A'));
    
    // STEP 3: Commit with message
    // ANNOTATION: Creates permanent record with descriptive message
    results.push(actions.commit(commitMsg));
    
    // STEP 4: Verify commit
    // ANNOTATION: Displays commit hash to confirm success
    results.push(actions.execute('git log --oneline -1'));
    
    return results;
  },

  /**
   * STEP: validate
   * PURPOSE: Run validation checks (compile, test, format)
   * SEQUENCE: compile → test → lint
   * USE CASE: Pre-commit validation workflow
   */
  validate: (): ActionResult[] => {
    const results: ActionResult[] = [];
    
    // STEP 1: TypeScript compilation
    // ANNOTATION: Ensures type safety before execution
    results.push(actions.execute('npm run compile'));
    
    // STEP 2: Run test suite
    // ANNOTATION: Verifies functionality with 213+ tests
    results.push(actions.execute('npm run test'));
    
    // STEP 3: Check git status
    // ANNOTATION: Ensures working tree is clean or changes are expected
    results.push(actions.execute('git status --short'));
    
    return results;
  },

  /**
   * STEP: archiveSession
   * PURPOSE: Complete session archival with state capture
   * SEQUENCE: status → commit → archive
   * USE CASE: Session end procedure
   */
  archiveSession: (): ActionResult[] => {
    const results: ActionResult[] = [];
    
    // STEP 1: Check current state
    results.push(actions.execute('git status --short'));
    
    // STEP 2: Commit any pending changes
    results.push(actions.commit('Session archival'));
    
    // STEP 3: Archive with commit hash
    results.push(actions.archive());
    
    return results;
  }
};

// MODULE EXPORT: Named and default
export default steps;
