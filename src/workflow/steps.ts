/**
 * Workflow Steps - Execution Sequences
 * Task 1: Implement full workflow primitives
 */

import { actions } from './actions';
import type { ActionResult } from './actions';

export interface Step {
  name: string;
  execute: () => ActionResult;
}

export const steps = {
  /**
   * Standard workflow: Initialize → Execute → Commit → Notify → Archive
   */
  standard: (sessionId: string, command: string, commitMsg: string): ActionResult[] => {
    const results: ActionResult[] = [];
    
    // Step 1: Initialize
    results.push(actions.init(sessionId));
    
    // Step 2: Execute
    results.push(actions.execute(command));
    
    // Step 3: Commit
    results.push(actions.commit(commitMsg));
    
    // Step 4: Notify
    results.push(actions.notify('standard workflow', 'complete'));
    
    // Step 5: Archive
    results.push(actions.archive());
    
    return results;
  },

  /**
   * Create file workflow: Execute create → Commit → Notify
   */
  createFile: (filename: string, content: string, commitMsg: string): ActionResult[] => {
    const results: ActionResult[] = [];
    
    // Step 1: Create file
    results.push(actions.execute(`cat > ${filename} << 'EOF'\n${content}\nEOF`));
    
    // Step 2: Commit
    results.push(actions.commit(commitMsg));
    
    // Step 3: Notify
    results.push(actions.notify(`create ${filename}`, 'complete'));
    
    return results;
  },

  /**
   * Git workflow: Status → Add → Commit → Verify
   */
  gitWorkflow: (commitMsg: string): ActionResult[] => {
    const results: ActionResult[] = [];
    
    results.push(actions.execute('git status --short'));
    results.push(actions.execute('git add -A'));
    results.push(actions.commit(commitMsg));
    results.push(actions.execute('git log --oneline -1'));
    
    return results;
  }
};

export default steps;
