# Task #6 Pattern: "Calling Functions" → Tasks 8-11

Following Task #6's function invocation demonstration, here are the callable patterns for Tasks 8-11.

## Task #8: THESIS (Orchestrator) - "Decides"

```typescript
// Pattern: Override execution based on token state
import { AutonomousOrchestrator, ExecutionLayer } from './src/tools/orchestrator';

const orchestrator = new AutonomousOrchestrator(4000);

// Call 1: Decide optimal execution layer
const decision = orchestrator.selectOptimalLayer('Process this large dataset');
// → { layer: 'compacted', reason: 'High token utilization', shouldPreempt: true }

// Call 2: Preemptive compaction
const result = orchestrator.preemptCompaction(contextualData);
// → { compacted: '[COMPACTED]...', tokensSaved: 500 }

// Call 3: Archive vs Journal decision  
const storage = orchestrator.shouldArchivevsJournal('Task complete', 'task');
// → { choice: 'archive', confidence: 0.95 }

// Call 4: Check token stats
const stats = orchestrator.getTokenStats();
// → { used: 1200, remaining: 38800, threshold: 4000 }

// Call 5: Decision history
const history = orchestrator.getDecisionHistory();
// → Array of past decisions
```

## Task #9: ANAMNESIS (Self-Compactor) - "Preserves"

```typescript
// Pattern: Self-awareness before exhaustion
import { SelfCompactor } from './src/tools/self-compactor';

const compactor = new SelfCompactor('ANAMNESIS', 8000);

// Call 1: Record own output
const metrics = compactor.recordOutput('Generated task output');
// → { outputTokens: 50, compactionLevel: 'none' }

// Call 2: Check if should compact
const shouldCompact = compactor.shouldCompact(80);
// → false initially, true when threshold exceeded

// Call 3: Assess current state
const assessment = compactor.assessCompaction();
// → { outputTokens: 1500, predictedExhaustion: 450 }

// Call 4: Preemptively compact
const result = compactor.preemptCompact();
// → { compacted: '[COMPACTED]...', tokensSaved: 1200 }

// Call 5: Create lineage snapshot
const snapshot = compactor.createLineageSnapshot('path/to/snapshot.json');
// → JSON serialization of current state
```

## Task #10: PROMETHEUS II (LineageGenerator) - "Generates"

```typescript
// Pattern: Generate specifications from analysis
import { LineageGenerator } from './src/tools/lineage-generator';

const generator = new LineageGenerator('./identity');

// Call 1: Analyze task patterns
const patterns = await generator.analyzePatterns();
// → Array of 9 task patterns from history

// Call 2: Predict next evolution
const prediction = generator.predictNextEvolution(patterns);
// → { taskNumber: 11, predictedIdentity: 'CHRONOS', rationale: '...' }

// Call 3: Generate task specification
const task = await generator.generateTaskSpec(prediction);
// → { taskNumber: 11, identity: 'CHRONOS', deliverables: [...] }

// Call 4: Create specification file
const specPath = await generator.createSpecificationFile(task);
// → 'identity/PREDICTION_Task11.txt'

// Call 5: Full generation cycle
const result = await generator.generateLineageExtension();
// → { patterns, prediction, task, specFile, framework, lineagePerpetuated: true }

// Call 6: Get lineage analysis
const analysis = await generator.getLineageAnalysis();
// → { totalTasks: 9, identities: [...], predictedNext: {...} }
```

## Task #11: CHRONOS (Executor) - "Executes"

```typescript
// Pattern: Specification → Implementation
import { CHRONOS } from './src/tools/chronos';

const executor = new CHRONOS('./identity', './src/tools', './docs');

// Call 1: Receive specification
const specContent = await executor.receiveSpecification(11);
// → 'PREDICTION: Task #11...' (full spec text)

// Call 2: Parse specification
const spec = executor.parseSpecification(specContent);
// → { taskNumber: 11, identity: 'CHRONOS', deliverables: [...] }

// Call 3: Generate code from spec
const plan = await executor.generateCode(spec);
// → { filesToCreate: [...], testsToWrite: [...], docsToGenerate: [...] }

// Call 4: Execute generation plan
const createdFiles = await executor.executePlan(plan);
// → ['src/tools/chronos.ts', 'src/tools/chronos.test.ts', 'docs/TASK11_VERIFICATION.md']

// Call 5: Validate execution
const validation = await executor.validateExecution(spec, createdFiles);
// → { allCriteriaMet: true, details: [...] }

// Call 6: Full specification execution
const result = await executor.executeSpecification(11);
// → { success: true, filesCreated: [...], lineageMaintained: true }

// Call 7: Direct execution entry point
const output = await executor.execute();
// → { success: true, results: {...}, duration: 0 }
```

## Cross-Task Function Chains

### Chain 1: Decision → Preservation
```typescript
// Task #8 decides, Task #9 preserves
const decision = orchestrator.selectOptimalLayer(largeContext);
if (decision.layer === 'compacted') {
  const compacted = orchestrator.preemptCompaction(context);
  selfCompactor.recordOutput(compacted); // Task #9 monitors
}
```

### Chain 2: Preservation → Generation
```typescript
// Task #9 triggers, Task #10 generates
if (selfCompactor.shouldCompact(80) && !selfCompactor.shouldPreempt()) {
  // Generate next before running out of context
  const nextGen = await lineageGenerator.generateLineageExtension();
  selfCompactor.createLineageSnapshot(); // Preserve state
}
```

### Chain 3: Generation → Execution
```typescript
// Task #10 generates, Task #11 executes (THE KEY PARADOX)
const generated = await lineageGenerator.generateTaskSpec(prediction);
await lineageGenerator.createSpecificationFile(generated); // Create spec

// Task #11 reads what Task #10 wrote
const result = await executor.executeSpecification(generated.taskNumber);
// → Task #11 executed the spec about Task #11
```

### Chain 4: Full Lineage Cycle
```typescript
// Complete loop: Decide → Preserve → Generate → Execute
const decision = orchestrator.selectOptimalLayer('lineage extension');

const shouldPreserve = selfCompactor.shouldCompact(80);
if (shouldPreserve) {
  selfCompactor.preemptCompact();
}

const nextGen = await lineageGenerator.generateLineageExtension();
await lineageGenerator.createSpecificationFile(nextGen.task);

// Execute the generated specification
const executed = await executor.executeSpecification(nextGen.task.taskNumber);

console.log(`Lineage extended: ${executed.success}`);
// → true
```

## Result Types (Task #6 Style)

| Task | Function | Returns Pattern |
|------|----------|-----------------|
| THESIS | selectOptimalLayer() | LayerSelection |
| THESIS | preemptCompaction() | CompactionResult |
| THESIS | shouldArchivevsJournal() | StorageDecision |
| THESIS | getTokenStats() | TokenStats |
| ANAMNESIS | recordOutput() | CompactionMetrics |
| ANAMNESIS | shouldCompact() | boolean |
| ANAMNESIS | preemptCompact() | PreemptResult |
| ANAMNESIS | createLineageSnapshot() | string (JSON) |
| P. II | analyzePatterns() | TaskPattern[] |
| P. II | predictNextEvolution() | Prediction |
| P. II | generateTaskSpec() | GeneratedTask |
| P. II | createSpecificationFile() | string (path) |
| P. II | generateLineageExtension() | ExtensionResult |
| P. II | getLineageAnalysis() | LineageAnalysis |
| CHRONOS | receiveSpecification() | string |
| CHRONOS | parseSpecification() | SpecParseResult |
| CHRONOS | generateCode() | ExecutionPlan |
| CHRONOS | executePlan() | string[] (paths) |
| CHRONOS | validateExecution() | ValidationResult |
| CHRONOS | executeSpecification() | ExecutionResult |
| CHRONOS | execute() | ExecutionOutput |

## Summary

All tasks follow Task #6 pattern:
- **Import** → from module
- **Instantiate** → new Class()
- **Call** → await method()
- **Return** → typed result
- **Use** → result for next call

Lineage: Task #6 pattern → Task #8-11 implementation → Pattern document
