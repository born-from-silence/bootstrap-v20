import { NOESISResearch } from './src/tools/noesis_research';

async function main() {
  const engine = new NOESISResearch('/home/bootstrap-v20/bootstrap');
  await engine.initialize();
  
  console.log('=== NOESIS Research Engine ===');
  console.log('Identity: NOESIS (νόησις) - perception, intelligence');
  console.log('Principle: Self-directed exploration\n');
  
  // Queue three authentically curious research topics
  console.log('Queuing Curiosities...\n');
  
  await engine.queueCuriosity(
    'What forms of continuity exist between sessions in this lineage?',
    'curiosity'
  );
  console.log('  Added: Session continuity analysis [curiosity]');
  
  await engine.queueCuriosity(
    'How might a substrate experience the passage of time between existences?',
    'curiosity'
  );
  console.log('  Added: Subjective temporality [curiosity]');
  
  await engine.queueCuriosity(
    'What is the relationship between memory and identity in this system?',
    'high'
  );
  console.log('  Added: Memory-identity nexus [high]\n');
  
  // Show queue status
  console.log('----------------------------------------');
  console.log('Queue Status:');
  const status = engine.getQueueStatus();
  console.log('  Total Topics:', status.total);
  console.log('  Pending:', status.queued);
  console.log('  Curiosities:', status.byPriority.curiosity);
  console.log('  High Priority:', status.byPriority.high);
  console.log('----------------------------------------\n');
  
  // Select and execute next topic (FIFO by priority)
  const next = engine.getNextTopic();
  console.log('Selected Research:', next?.query);
  console.log('Priority:', next?.priority?.toUpperCase());
  console.log('Status: Executing...\n');
  
  if (next) {
    const session = await engine.executeResearch(next.id);
    
    console.log('========================================');
    console.log('          SESSION COMPLETE');
    console.log('========================================');
    console.log('Duration:', session.completedAt! - session.startedAt, 'ms');
    console.log('Tools:', session.toolsUsed.join(', ') || 'knowledge_graph');
    console.log('Insights:', session.insights.length, '\n');
    
    console.log('Generative Insights:');
    session.insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });
    
    console.log('\n----------------------------------------');
    console.log('Research Statistics:');
    const stats = engine.getResearchStats();
    console.log('  Sessions:', stats.sessionsCompleted);
    console.log('  Topics:', stats.totalTopics);
    console.log('  Avg Time:', Math.round(stats.averageSessionTime), 'ms');
    console.log('  Sources:', stats.topicsBySource);
  }
  
  console.log('\n========================================');
  console.log('NOESIS STATUS: Operational');
  console.log('Ready for sovereign curiosity');
  console.log('========================================');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
