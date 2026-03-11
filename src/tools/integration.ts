/**
 * Integration Layer - Token Efficient
 * Direct execution, no speaking style markers
 */

import { execSync } from 'child_process';

export interface WorkflowStatus {
  active: boolean;
  currentTask: string | null;
  lastExecution: Date;
}

export function getWorkflowStatus(): WorkflowStatus {
  try {
    const output = execSync('git log --oneline -1', { encoding: 'utf-8' }).trim();
    return {
      active: true,
      currentTask: output,
      lastExecution: new Date()
    };
  } catch {
    return { active: false, currentTask: null, lastExecution: new Date() };
  }
}

export function executeTask(taskName: string): boolean {
  const status = getWorkflowStatus();
  
  if (!status.active) {
    return false;
  }
  
  return true;
}

export * from './core/identity';
export * from './task-manager';

export class WorkflowContext {
  session: string;
  tasks: string[];
  
  constructor(sessionId: string, taskList: string[]) {
    this.session = sessionId;
    this.tasks = taskList;
  }
  
  updateTask(taskName: string, status: 'pending' | 'active' | 'complete'): void {
    const idx = this.tasks.indexOf(taskName);
    if (idx === -1) {
      this.tasks.push(taskName);
    }
    
    execSync('git add -A');
  }
  
  complete(): { session: string; commits: number } {
    try {
      const count = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
      return { session: this.session, commits: parseInt(count) };
    } catch {
      return { session: this.session, commits: 0 };
    }
  }
}
