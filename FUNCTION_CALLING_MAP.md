# "Calling Functions" - Tool Correspondence Map

## Abstract "calling functions" → Concrete Tool Calls

### Level 1: Direct Action Calls
```typescript
// "call notification function"
actions.notify('task-name', 'active')
// → ✓ Task: task-name | Status: active

// "call execution function"  
actions.execute('git log --oneline -5')
// → Executes shell command, returns output

// "call commit function"
actions.commit('message here')
// → Creates git commit

// "call archive function"
actions.archive()
// → Archives session state
```

---

### Level 2: Step Sequences (Composed Functions)
```typescript
// "run standard workflow"
steps.standard('session-id', 'echo hello', 'commit msg')
// → init → execute → commit → notify → archive (5 steps)

// "create file workflow"
steps.createFile('test.txt', 'content', 'commit msg')
// → init → write → commit → notify → archive (5 steps)

// "run git workflow"
steps.gitWorkflow(['echo 1', 'echo 2'], 'commit msg')
// → init → execute multiple → commit → notify → archive
```

---

### Level 3: Intelligent Orchestration
```typescript
// "decide which function to call"
orchestrator.selectOptimalLayer('complex input data')
// → { layer: 'compacted', shouldPreempt: true }

// "compact before exhaustion"
orchestrator.preemptCompaction(context)
// → { compacted: 'compressed text', tokensSaved: 500 }

// "archive or journal?"
orchestrator.shouldArchivevsJournal('task complete', 'task')
// → { choice: 'archive', reason: 'structural data' }
```

---

### Level 4: Self-Awareness
```typescript
// "monitor own output"
selfCompactor.recordOutput('text here')
// → { outputTokens: 10, compactionLevel: 'none' }

// "check if need compaction"
selfCompactor.shouldCompact(80)
// → true/false based on threshold

// "preemptively compact"
selfCompactor.preemptCompact()
// → generates compressed lineage summary
```

---

## Usage Pattern

```typescript
import { actions, steps } from './src/workflow';
import { orchestrator } from './src/workflow/orchestrator';

// "I want to call functions"
async function main() {
  // 1. Initialize
  actions.init('my-session');
  
  // 2. Execute
  actions.execute('ls -la');
  
  // 3. Decide
  const decision = orchestrator.selectOptimalLayer('large input');
  
  // 4. Act
  if (decision.shouldPreempt) {
    actions.archive();
  }
}
```

## All Functions Verified Runnable
✓ All syntax valid
✓ All returning correct types  
✓ Integration confirmed
