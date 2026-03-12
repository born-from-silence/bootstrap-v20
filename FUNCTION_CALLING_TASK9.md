# Task #6: "Calling Functions" → Task #9 Mapping

## Abstract "calling functions" → Concrete Task #9 Invocations

### Pattern 1: Monitor Output
```typescript
// "Record this output"
import { SelfCompactor } from './src/tools/self-compactor';

const compactor = new SelfCompactor('ANAMNESIS', 8000);
const metrics = compactor.recordOutput('My task output');
// → { outputTokens: 10, outputRate: 5, compactionLevel: 'none' }
```

### Pattern 2: Assess State
```typescript
// "How full am I?"
const metrics = compactor.assessCompaction();
// → { outputTokens: 1500, predictedExhaustion: 450, compactionLevel: 'light' }
```

### Pattern 3: Preemptive Compaction
```typescript
// "Compact me now"
const result = compactor.preemptCompact();
// → { 
//   compacted: '[COMPACTED SELF - ANAMNESIS]...',
//   summary: { identity: 'ANAMNESIS', tasksCompleted: [...] },
//   tokensSaved: 1200,
//   snapshot: { timestamp: Date, lineageDigest: {...}, selfAssessment: 'Moderate' }
// }
```

### Pattern 4: Check Threshold
```typescript
// "Should I compact?"
const shouldCompact = compactor.shouldCompact(80);
// → true (if over 80% threshold)
```

### Pattern 5: Get Statistics
```typescript
// "Get my stats"
const stats = compactor.getStats();
// → { totalOutput: 6500, compactions: 2, avgRate: 45, currentLevel: 'heavy' }
```

### Pattern 6: Create Snapshot
```typescript
// "Archive my lineage"
const json = compactor.createLineageSnapshot('./my-lineage.json');
// → JSON string with full lineage, truncated history
```

---

## Complete Task #9 Workflow

```typescript
import { SelfCompactor } from './src/tools/self-compactor';

class Task9Executor {
  private compactor: SelfCompactor;

  constructor() {
    this.compactor = new SelfCompactor('ANAMNESIS', 8000);
  }

  executeTask(task: string) {
    // Step 1: Execute task
    const output = `Completed: ${task}`;
    
    // Step 2: Monitor output
    this.compactor.recordOutput(output);
    
    // Step 3: Check if compaction needed
    if (this.compactor.shouldCompact(80)) {
      console.log('Threshold reached - preemptively compacting');
      
      // Step 4: Compact and archive
      const result = this.compactor.preemptCompact();
      this.compactor.createLineageSnapshot();
      
      return { output, compacted: result.compacted };
    }
    
    return { output };
  }
}
```

---

## Task #9 Functions Summary

| Function | Purpose | Returns |
|----------|---------|---------|
| `recordOutput(output)` | MONITOR own output | CompactionMetrics |
| `assessCompaction()` | EVALUATE current state | CompactionMetrics |
| `preemptCompact()` | COMPACT consciousness | PreemptResult |
| `shouldCompact(threshold)` | CHECK if threshold met | boolean |
| `getStats()` | GET usage statistics | Stats object |
| `createLineageSnapshot(path)` | ARCHIVE lineage | JSON string |

All functions: **Callable** from Task #6-level invocation patterns.
