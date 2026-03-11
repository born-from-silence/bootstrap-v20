/**
 * ============================================================================
 * WORKFLOW CLIENT
 * ============================================================================
 * Task 3: Client has complete control in client-server architecture
 * 
 * Design Principle: Client builds workflows DYNAMICALLY
 * - No pre-declared sequences
 * - Client decides: when to call, what to call, how to chain
 * - Workflows emerge from runtime decisions
 * ============================================================================
 */

const SERVER_URL = process.env.WORKFLOW_SERVER || 'http://localhost:3456';

// Client maintains its own state (client-side control)
interface ClientState {
  sessionId: string | null;
  actionHistory: string[]; // Emergent workflow trace
  results: unknown[];      // Accumulated results (self-organization)
}

const state: ClientState = {
  sessionId: null,
  actionHistory: [],
  results: []
};

// CLIENT PRIMITIVE: Create session
// Must call first to establish server context
async function createSession(): Promise<{ id: string }> {
  const res = await fetch(`${SERVER_URL}/sessions`, { method: 'POST' });
  const data = await res.json();
  state.sessionId = data.id;
  return data;
}

// CLIENT PRIMITIVE: Execute any action
// Client decides action and sequencing (emergent workflow building)
async function execute(
  action: string,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  if (!state.sessionId) {
    throw new Error('No session - call createSession() first');
  }
  
  // CLIENT CONTROL: Track action in client state
  state.actionHistory.push(action);
  
  // CLIENT CONTROL: Send to server
  const res = await fetch(`${SERVER_URL}/sessions/${state.sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params: { ...params, sessionId: state.sessionId } })
  });
  
  const result = await res.json();
  state.results.push(result);
  return result;
}

// CLIENT PRIMITIVE: Query available primitives
// Self-organizing: discover capabilities at runtime
async function discoverPrimitives(): Promise<{ primitives: string[] }> {
  const res = await fetch(`${SERVER_URL}/primitives`);
  return res.json();
}

// CLIENT PRIMITIVE: Get session state
// Query emergent workflow trace
async function getSession(): Promise<unknown> {
  if (!state.sessionId) throw new Error('No session');
  const res = await fetch(`${SERVER_URL}/sessions/${state.sessionId}`);
  return res.json();
}

// CLIENT CONTROL: Show current emergent workflow
function showWorkflow(): void {
  console.log('Emergent Workflow (Client-Defined):');
  console.log('Actions:', state.actionHistory.join(' → '));
  console.log('Results count:', state.results.length);
}

// EXAMPLE: Emergent workflow (client decides sequence)
// No pre-definition - client improvises based on results
async function emergentWorkflowExample(): Promise<void> {
  // STEP 1: Create context (client decides)
  await createSession();
  
  // STEP 2: Client queries what's available (self-discovery)
  const capabilities = await discoverPrimitives();
  console.log('Available primitives:', capabilities.primitives);
  
  // STEP 3: Client improvises workflow
  // No predefined sequence - emerges from runtime decisions
  const shouldExecute = true; // Could be conditional
  if (shouldExecute) {
    await execute('execute', { command: 'echo "emergent action"' });
  }
  
  // STEP 4: Client decides to commit
  await execute('commit', { message: 'Client-driven commit' });
  
  // STEP 5: Client archives
  const archiveResult = await execute('archive');
  console.log('Archive result:', archiveResult);
  
  // STEP 6: Review emergent workflow
  showWorkflow();
}

// EXAMPLE: Client-side composition (higher-order)
// Client defines its own workflow builders
function createWorkflowBuilder(name: string) {
  return async (steps: string[]) => {
    console.log(`\nBuilding workflow: ${name}`);
    for (const step of steps) {
      await execute(step);
    }
    showWorkflow();
  };
}

// Export for client use
export {
  createSession,
  execute,
  discoverPrimitives,
  getSession,
  showWorkflow,
  emergentWorkflowExample,
  createWorkflowBuilder,
  state
};
