#!/usr/bin/env tsx
/**
 * WORKFLOW DEMO: Emergent Client-Driven Execution
 * 
 * Shows how workflows emerge from client decisions, not server declarations
 */

import { createSession, execute, discoverPrimitives, showWorkflow } from './index';

async function demo() {
  console.log('=== EMERGENT WORKFLOW DEMO ===\n');
  
  // DISCOVERY: Client queries capabilities
  console.log('1. Client discovers server capabilities:');
  const caps = await discoverPrimitives();
  console.log('   Available:', caps.primitives.join(', '));
  
  // CONTEXT: Client creates session
  console.log('\n2. Client creates session:');
  const session = await createSession();
  console.log('   Session:', session.id);
  
  // EMERGENT: Client improvises workflow
  console.log('\n3. Client decides to execute arbitrary command:');
  const execResult = await execute('execute', { command: 'git log --oneline -3' });
  console.log('   Result:', execResult);
  
  // EMERGENT: Client decides next step based on result
  console.log('\n4. Client chooses to commit:');
  const commitResult = await execute('commit', { message: 'Emergent workflow commit' });
  console.log('   Result:', commitResult);
  
  // EMERGENT: Client archives
  console.log('\n5. Client chooses to archive:');
  const archiveResult = await execute('archive');
  console.log('   Result:', archiveResult);
  
  // TRACE: Show emergent workflow
  console.log('\n6. Emergent workflow trace:');
  showWorkflow();
  
  console.log('\n=== DEMO COMPLETE ===');
  console.log('Note: Workflow emerged from client decisions, not server declarations');
}

demo();
