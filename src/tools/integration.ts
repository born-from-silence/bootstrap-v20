export interface Session {
  id: string;
  status: 'active' | 'complete';
  tasks: Task[];
  commits: string[];
}

export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  output?: string;
}

type TaskStatus = 'pending' | 'active' | 'complete';

export class WorkflowContext {
  session: Session;
  
  constructor(id: string) {
    this.session = {
      id,
      status: 'active',
      tasks: [],
      commits: []
    };
  }
  
  addTask(description: string): Task {
    const task: Task = {
      id: `task-${this.session.tasks.length}`,
      description,
      status: 'pending'
    };
    this.session.tasks.push(task);
    return task;
  }
  
  completeTask(taskId: string, output?: string): void {
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

export default WorkflowContext;
