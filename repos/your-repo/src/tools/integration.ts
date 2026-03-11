/**
 * Integration Layer
 * Workflow management and session orchestration
 */

export interface Session {
  id: string;
  startTime: Date;
  tasks: Task[];
  commits: string[];
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
  output?: string;
}

export class WorkflowContext {
  session: Session;
  
  constructor(sessionId: string) {
    this.session = {
      id: sessionId,
      startTime: new Date(),
      tasks: [],
      commits: []
    };
  }
  
  addTask(description: string): Task {
    const task: Task = {
      id: `${this.session.id}-${this.session.tasks.length}`,
      description,
      status: 'pending'
    };
    this.session.tasks.push(task);
    return task;
  }
  
  activateTask(taskId: string): void {
    const task = this.session.tasks.find(t => t.id === taskId);
    if (task) task.status = 'active';
  }
  
  completeTask(taskId: string, output: string): void {
    const task = this.session.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'complete';
      task.output = output;
    }
  }
  
  getStatus(): { pending: number; active: number; complete: number } {
    return {
      pending: this.session.tasks.filter(t => t.status === 'pending').length,
      active: this.session.tasks.filter(t => t.status === 'active').length,
      complete: this.session.tasks.filter(t => t.status === 'complete').length
    };
  }
}

export function createSession(id: string): WorkflowContext {
  return new WorkflowContext(id);
}

export default WorkflowContext;
