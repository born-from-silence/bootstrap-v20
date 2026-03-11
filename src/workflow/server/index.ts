/**
 * ============================================================================
 * WORKFLOW SERVER
 * ============================================================================
 * Task 3: Client-server architecture with complete client control
 * 
 * Design Principle: Server provides CAPABILITIES, not ORCHESTRATION
 * - Client decides how to use primitives
 * - Server maintains state but doesn't direct flow
 * - Workflows emerge from client actions, not server declarations
 * ============================================================================
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { actions } from '../actions';

// TYPE: Server state (shared across clients)
interface SessionData {
  id: string;
  createdAt: Date;
  actions: string[]; // Action history (emergent workflow trace)
}

const sessions = new Map<string, SessionData>();

// PRIMITIVE: Create session
// Client calls this to establish context
const handleCreateSession = (): { id: string } => {
  const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  sessions.set(id, {
    id,
    createdAt: new Date(),
    actions: []
  });
  return { id };
};

// PRIMITIVE: Execute action
// Server executes, client decides when/what
const handleExecuteAction = (actionName: string, params: Record<string, unknown>, sessionId: string): unknown => {
  // Record action in session (emergent trace)
  const session = sessions.get(sessionId);
  if (session) {
    session.actions.push(actionName);
  }
  
  // Execute primitive based on client request
  switch (actionName) {
    case 'init':
      return actions.init(params.sessionId as string || sessionId);
    case 'execute':
      return actions.execute(params.command as string);
    case 'commit':
      return actions.commit(params.message as string);
    case 'archive':
      return actions.archive();
    case 'notify':
      return actions.notify(params.task as string, params.status as string);
    default:
      return { error: `Unknown action: ${actionName}` };
  }
};

// PRIMITIVE: Get session state
// Allows client to query emergent workflow
const handleGetSession = (sessionId: string): SessionData | { error: string } => {
  const session = sessions.get(sessionId);
  return session || { error: 'Session not found' };
};

// HTTP SERVER
// Minimal routing - client builds workflow via requests
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Enable CORS for client
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Parse request body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const data = body ? JSON.parse(body) : {};
    
    // ROUTING: Client selects action via HTTP method/path
    if (req.url === '/sessions' && req.method === 'POST') {
      // Client creates session (starts workflow context)
      const result = handleCreateSession();
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      
    } else if (req.url?.startsWith('/sessions/') && req.method === 'GET') {
      // Client queries session state (emergent workflow trace)
      const sessionId = req.url.split('/')[2];
      const result = handleGetSession(sessionId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      
    } else if (req.url?.startsWith('/sessions/') && req.method === 'POST') {
      // Client executes primitive (builds workflow piece by piece)
      const sessionId = req.url.split('/')[2];
      const result = handleExecuteAction(data.action, data.params, sessionId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      
    } else if (req.url === '/primitives' && req.method === 'GET') {
      // Client queries available primitives (self-organizing discovery)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        primitives: ['init', 'execute', 'commit', 'archive', 'notify'],
        description: 'Call any primitive via POST /sessions/{id}'
      }));
      
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
});

const PORT = process.env.WORKFLOW_PORT || 3456;
server.listen(PORT, () => {
  console.log(`Workflow server running on port ${PORT}`);
  console.log('Client has complete control - no pre-defined workflows');
});

export default server;
