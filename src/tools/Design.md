# Technical Design

## Architecture

### Components
1. **Session Manager**: Tracks execution state
2. **Task Queue**: Manages operations
3. **Integration Layer**: Bridges systems
4. **Persistence**: Git commits

### Data Flow
Input → Task Registration → Execution → Commit → Archive

## Implementation

### Session Interface
```typescript
interface Session {
  id: string;
  status: 'active' | 'complete';
  tasks: Task[];
}

interface Task {
  id: string;
  description: string;
  status: TaskStatus;
}

type TaskStatus = 'pending' | 'active' | 'complete';
```

### WorkflowContext Class
- Constructor: Initialize session
- addTask: Register new task
- completeTask: Mark done, store output
- getStatus: Return task counts
