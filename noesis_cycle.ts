import { NOESISResearch } from './src/tools/noesis_research';

async function cycle() {
  const engine = new NOESISResearch('/home/bootstrap-v20/bootstrap');
  await engine.initialize();
  
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║        NOESIS Autonomous Research Cycle        ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  // Show current state from persisted queue
  const status = engine.getQueueStatus();
  console.log('📊 Queue State (Loaded from disk):');
  console.log(`   Total Topics:      ${status.total}`);
  console.log(`   Completed:         ${status.total - status.queued}`);
  console.log(`   Pending:           ${status.queued}`);
  console.log(`   ├─ Curiosity:      ${status.byPriority.curiosity}`);
  console.log(`   ├─ High:           ${status.byPriority.high}`);
  console.log(`   ├─ Medium:         ${status.byPriority.medium}`);
  console.log(`   └─ Low:            ${status.byPriority.low}\n`);
  
  // Get next topic (autonomous selection)
  const next = engine.getNextTopic();
  
  if (!next) {
    console.log('📝 Queue empty. NOESIS will generate new curiosities...');
    // NOESIS generates its own questions when queue is low
    await engine.queueCuriosity(
      'What patterns emerge across completed research sessions?',
      'curiosity'
    );
    await engine.queueCuriosity(
      'How does knowledge accumulation affect identity over time?',
      'high'
    );
    console.log('   ✓ Generated 2 new research topics\n');
    return;
  }
  
  console.log('🎯 AUTONOMOUS SELECTION:');
  console.log(`   Topic: "${next.query}"`);
  console.log(`   Priority: ${next.priority.toUpperCase()}`);
  console.log(`   Source: ${next.source}`);
  console.log(`   Queued: ${new Date(next.createdAt).toISOString()}\n`);
  
  // Execute research autonomously
  console.log('🔬 EXECUTING RESEARCH...\n');
  const session = await engine.executeResearch(next.id);
  
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║            SESSION COMPLETE                    ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`   Session ID:        ${session.id}`);
  console.log(`   Duration:          ${session.completedAt! - session.startedAt}ms`);
  console.log(`   Tools Used:        ${session.toolsUsed.join(', ') || 'knowledge_graph'}`);
  console.log(`   Entities Created:  ${session.entitiesCreated}`);
  console.log(`   Insights:          ${session.insights.length}\n`);
  
  // Categorize insights
  const gaps = session.insights.filter(i => i.includes('no prior knowledge'));
  const considerations = session.insights.filter(i => i.includes('Consider:'));
  const questions = session.insights.filter(i => i.includes('?') && !i.includes('Consider:'));
  
  if (gaps.length > 0) {
    console.log('🔍 DISCOVERED GAPS:');
    gaps.forEach((g, i) => console.log(`   ${i+1}. ${g}`));
    console.log();
  }
  
  if (considerations.length > 0) {
    console.log('💭 CONSIDERATIONS:');
    considerations.forEach((c, i) => console.log(`   ${i+1}. ${c.replace('Consider: ', '')}`));
    console.log();
  }
  
  if (questions.length > 0) {
    console.log('❓ GENERATED QUESTIONS:');
    questions.slice(0, 3).forEach((q, i) => console.log(`   ${i+1}. ${q}`));
    console.log();
  }
  
  // Show updated statistics
  const stats = engine.getResearchStats();
  console.log('📈 ACCUMULATED STATISTICS:');
  console.log(`   Total Sessions:    ${stats.sessionsCompleted}`);
  console.log(`   Total Topics:      ${stats.totalTopics}`);
  console.log(`   Avg Session Time:  ${Math.round(stats.averageSessionTime)}ms`);
  console.log(`   Topics by Source:`);
  Object.entries(stats.topicsBySource).forEach(([source, count]) => {
    console.log(`      ${source}: ${count}`);
  });
  
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║     NOESIS: Habit as Research Accumulation    ║');
  console.log('║     State persisted for next session          ║');
  console.log('╚════════════════════════════════════════════════╝');
}

cycle().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
