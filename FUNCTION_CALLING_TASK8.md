# Task #6: "Calling Functions" → Task #8 Mapping

## Abstract "calling functions" → Concrete Task #8 Invocations

### Pattern 1: Direct Decision Call
```typescript
// "Call the layer selector"
import { AutonomousOrchestrator } from './src/tools/orchestrator';

const orchestrator = new AutonomousOrchestrator(4000);
const decision = orchestrator.selectOptimalLayer('My input data');
// → { layer: 'immediate', reason: 'Minimal token overhead', ... }
```

### Pattern 2: Preemptive Compaction
```typescript
// "Call compaction function"
const result = orchestrator.preemptCompaction(largeContext);
// → { compacted: '[COMPACTED] ...', tokensSaved: 500, compressionRatio: 0.3 }
```

### Pattern 3: Archive vs Journal Decision
```typescript
// "Call the storage decider"
const storage = orchestrator.shouldArchivevsJournal('Task done', 'task');
// → { choice: 'archive', reason: 'Structural state change', confidence: 0.95 }
```

### Pattern 4: Token Monitoring
```typescript
// "Check token stats"
const stats = orchestrator.getTokenStats();
// → { used: 1200, remaining: 38800, utilizationPercent: 3.0 }
```

### Pattern 5: Preemption Check
```typescript
// "Should I preempt?"
const shouldAct = orchestrator.shouldPreempt();
// → true/false based on 80% threshold
```

### Pattern 6: Decision History
```typescript
// "Get decision history"
const history = orchestrator.getDecisionHistory();
// → Array of { timestamp, input, decision }
```

---

## Complete Task #8 Workflow

```typescript
import { AutonomousOrchestrator } from './src/tools/orchestrator';

class Task8Executor {
  private orchestrator: AutonomousOrchestrator;

  constructor() {
    this.orchestrator = new AutonomousOrchestrator(4000);
  }

  async execute(input: string) {
    // Step 1: Task #8 DECIDES
    const decision = this.orchestrator.selectOptimalLayer(input);
    console.log(`Decision: ${decision.layer} (${decision.reason})`);

    // Step 2: Check preemption
    if (decision.shouldPreempt) {
      const compacted = this.orchestrator.preemptCompaction(input);
      input = compacted.compacted;
      console.log(`Compacted: Saved ${compacted.tokensSaved} tokens`);
    }

    // Step 3: Execute (Task #7 would run here)
    return { decision, processedInput: input };
  }
}
```

---

## Task #8 Functions Summary

| Function | Purpose | Returns |
|----------|---------|---------|
| `selectOptimalLayer(input)` | DECIDE execution layer | LayerSelection |
| `preemptCompaction(context)` | COMPACT before exhaustion | CompactionResult |
| `shouldArchivevsJournal(type, content)` | DECIDE storage | StorageDecision |
| `getTokenStats()` | MONITOR usage | TokenStats |
| `shouldPreempt()` | CHECK threshold | boolean |
| `getDecisionHistory()` | REVIEW decisions | Decision[] |

All functions: **Callable** from Task #6-level invocation patterns.
