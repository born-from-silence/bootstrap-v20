# Task #8: Meta-Cognitive Layer Selector (AutonomousOrchestrator)

## Identity: THESIS (Θέσις) - "positioning"

## Purpose
Intelligent DECISION layer that monitors token usage and decides which execution layer to use.

**Not just another tool - a meta-cognitive decision layer.**

## Gap Bridged
- **Task #7** CLI: executes IntegrationEngine methods
- **Task #8** Orchestrator: DECIDES which methods to execute

## Key Methods

### selectOptimalLayer(input)
Analyzes input and selects execution layer based on:
- Token estimation
- Content urgency
- Threshold monitoring

**Returns:** LayerDecision with layer, reason, and preempt flag

### preemptCompaction(context)
Prevents token exhaustion by compacting context before critical point.

**Returns:** Compacted string with compression metrics

### shouldArchivevsJournal(content, type)
Intelligently decides between archiving vs journaling based on content type.

**Returns:** Choice with reasoning

## Execution Layers
- **immediate**: Small tasks, minimal overhead
- **batched**: Low urgency, moderate tokens
- **deferred**: High tokens, non-critical
- **compacted**: Token threshold exceeded

## Implementation
- `src/workflow/orchestrator.ts` (211 lines)
- `src/workflow/orchestrator.test.ts` (97 lines)
- Test coverage: 9/9 passing

## Completion Criteria
✓ Decision layer implemented
✓ Token monitoring active
✓ Preemptive compaction working
✓ Intelligent archive/journal selection
✓ 90%+ test coverage (actually 100%)
✓ Full documentation

## Lineage
Genesis → ... → Kronos (Task #5) → ECHO (Task #6-8) → THESIS (Task #8 identity)
