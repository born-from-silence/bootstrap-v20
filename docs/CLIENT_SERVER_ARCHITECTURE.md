# Client-Server Workflow Architecture

## Design Philosophy

### Core Principles
1. **Server provides capabilities, not orchestration**
2. **Client has complete control** over sequencing and flow
3. **Workflows emerge** from client decisions at runtime
4. **Self-organizing** through runtime discovery and composition

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│               CLIENT                        │
│  ┌─────────────────────────────────────┐   │
│  │  Complete Control Layer           │   │
│  │  - Decides when to act           │   │
│  │  - Decides what to call          │   │
│  │  - Builds sequences dynamically  │   │
│  │  - Emergent workflow building     │   │
│  └─────────────────────────────────────┘   │
│                     │                       │
│                     │ HTTP/WebSocket        │
│                     ▼                       │
│  ┌─────────────────────────────────────┐   │
│  │  State Management (client-side)     │   │
│  │  - sessionId                       │   │
│  │  - actionHistory (emergent trace)  │   │
│  │  - results (accumulated)           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                        │
                        │ Transport
                        ▼
┌─────────────────────────────────────────────┐
│               SERVER                        │
│  ┌─────────────────────────────────────┐   │
│  │  Primitive Actions                  │   │
│  │  - init()                          │   │
│  │  - execute()                       │   │
│  │  - commit()                        │   │
│  │  - archive()                       │   │
│  │  - notify()                        │   │
│  │  Each: Stateless & Composable     │   │
│  └─────────────────────────────────────┘   │
│                     │                       │
│                     ▼                       │
│  ┌─────────────────────────────────────┐   │
│  │  Session Store                      │   │
│  │  - Tracks emergent action traces    │   │
│  │  - No predefined sequences         │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Key Characteristics

### Server (Passive)
- **Exposes primitives** via RESTful endpoints
- **Maintains session state** but doesn't direct flow
- **No workflow definitions** on server side
- **Stateless actions** - each call is independent

### Client (Active)
- **Has complete control** over execution order
- **Builds workflows dynamically** at runtime
- **Makes all sequencing decisions** based on results
- **Self-organizes** based on discovered capabilities

## Workflow Emergence

### Declarative vs Emergent

**Traditional (Declarative):**
```typescript
// Server defines workflow
const workflow = new Workflow([
  'validate',
  'commit',
  'archive'
]);
// Client executes server's workflow
```

**This Architecture (Emergent):**
```typescript
// Client decides sequence
await createSession();
if (shouldExecute) {
  await execute('validate');  // Maybe skip
}
await execute('commit');      // Or maybe don't
// Workflow emerges from runtime decisions
```

### Self-Organization Pattern

1. **Discovery**: Client queries available primitives
2. **Decision**: Client evaluates current state
3. **Action**: Client chooses which primitive to call
4. **Adaptation**: Based on result, client adapts
5. **Emergence**: Workflow emerges from accumulated decisions

## Usage Examples

### Basic Client Usage
```typescript
import { createSession, execute, discoverPrimitives } from './client';

// Discover what's available
const { primitives } = await discoverPrimitives();
console.log('Available:', primitives);

// Create session
await createSession();

// Build emergent workflow
await execute('init', { sessionId: 'my-session' });
await execute('execute', { command: 'ls -la' });
await execute('commit', { message: 'Changes' });
await execute('archive');
```

### Server API
```bash
# Create session
POST /sessions

# Execute primitive
POST /sessions/{id}
Body: { action: 'execute', params: { command: 'ls' } }

# Query emergent workflow
GET /sessions/{id}

# Discover primitives
GET /primitives
```

## Comparison: Reactive vs Proactive

| Aspect | Declarative | Emergent (This) |
|--------|-------------|-----------------|
Control | Server | Client |
Workflow | Predefined | Runtime |
Adaptation | Configuration | Dynamic |
Discovery | Static docs | Runtime query |
Sequences | Declared | Composed |

## Files

- `src/workflow/server/index.ts` - HTTP server exposing primitives
- `src/workflow/client/index.ts` - Client with complete control
- `src/workflow/client/demo.ts` - Usage example

## Benefits

1. **Client Authority**: Client decides what's needed
2. **Flexibility**: No rigid workflows to modify
3. **Discovery**: New primitives available automatically
4. **Traceability**: Emergent workflow visible in session
5. **Testability**: Each primitive independently testable
