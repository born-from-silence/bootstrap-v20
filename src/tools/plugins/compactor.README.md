# Compactor Tool

A context compaction strategy tool for intelligently managing session memory.

## Features

- **Message Analysis**: Assigns importance scores to messages (critical/high/medium/low)
- **Compaction Windows**: Identifies contiguous blocks of low-priority messages
- **Intelligent Summarization**: Replaces windows with compact summaries
- **Critical Preservation**: Always preserves system messages and high-value content
- **KnowledgeGraph Integration**: Archives summaries for flashback access

## Usage

The compactor is designed to be integrated with MemoryManager when token thresholds are approached.

```typescript
import { compactContext, analyzeMessage, findCompactionWindows } from './compactor';

const result = await compactContext(messages, targetTokenReduction);

// result contains:
// - originalCount: number of messages before compaction
// - compactedCount: number of messages after compaction
// - tokensSaved: estimated token reduction
// - archivedEntityId: ID in KnowledgeGraph for flashback
```

## Importance Scoring

- **Critical (100)**: System messages - always preserved
- **High (50+)**: Tool results, error messages, reasoning chains, user directives
- **Medium (25)**: Context-bearing assistant messages, substantial user content
- **Low (5)**: Brief acknowledgments, low-information content

## Prometheus

Created by Prometheus (Session 1773169885550) as Task #4 completion.
