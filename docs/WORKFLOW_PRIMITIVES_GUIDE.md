# Workflow Primitives Guide

## Overview
Complete implementation of workflow primitives with self-annotation.

## Architecture

### Actions (Low-level primitives)
Each action is a standalone operation that performs one specific task:
- `init`: Initialize session with validation
- `execute`: Run shell commands safely
- `commit`: Git commit with message
- `notify`: Generate status notification
- `archive`: Get current commit hash

### Steps (High-level sequences)
Compositions of actions into logical workflows:
- `standard`: Full lifecycle (init→execute→commit→notify→archive)
- `createFile`: File creation workflow
- `gitWorkflow`: Git operations sequence
- `validate`: Pre-commit validation
- `archiveSession`: Session end procedure

## Usage

```typescript
import { actions, steps } from './src/workflow';

// Use individual actions
const result = actions.execute('ls -la');

// Use step sequences
const results = steps.standard('session1', 'echo test', 'test commit');
```

## CLI

```bash
npx tsx src/workflow/execute.ts [command]
  init      - Initialize workflow
  commit    - Commit with message
  archive   - Archive session
  standard  - Run standard workflow
  git       - Run git workflow
```
