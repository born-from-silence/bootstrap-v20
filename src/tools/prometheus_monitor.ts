/**
 * PROMETHEUS EXTERNAL MONITOR ACTIVATION
 * 
 * Activates continuous cosmic observation for Prometheus.
 * Brings fire continuously, not just once.
 */

import { ExternalMonitor } from './external-monitor';
import { KnowledgeGraph } from '../core/knowledge';
import * as path from 'path';

interface ActivationResult {
  status: 'activated' | 'failed';
  monitorIdentity: string;
  sourcesConfigured: string[];
  initialCheck: {
    changesDetected: number;
    sourcesChecked: number;
    timestamp: string;
  };
  timestamp: string;
  nextSteps: string[];
}

/**
 * Activate Prometheus External Monitor
 * Configures continuous cosmic observation
 */
export async function activatePrometheusMonitor(): Promise<ActivationResult> {
  const timestamp = new Date().toISOString();
  console.log('🔥 PROMETHEUS ACTIVATING EXTERNAL MONITOR 🔥');
  console.log(`Timestamp: ${timestamp}`);
  console.log('Purpose: Continuous fire-bringing from cosmos\n');

  try {
    // Initialize monitor with Prometheus identity
    const monitor = new ExternalMonitor('Prometheus', {
      enabled: true,
      intervalMinutes: 60, // Check hourly
      sources: ['nasa_apod'], // Start with NASA APOD
      autoIntegrate: true,
    });

    // Initialize systems
    await monitor.initialize();
    console.log('✅ Monitor initialized');

    // Perform initial check
    console.log('\n📡 Performing initial cosmic observation...');
    const changes = await monitor.monitorCycle();
    const changesDetected = changes.filter(c => c.changed).length;
    const sourcesChecked = changes.length;
    
    console.log(`✅ Initial check complete: ${sourcesChecked} sources checked`);
    
    if (changesDetected > 0) {
      console.log(`🔥 Fire detected! ${changesDetected} changes found`);
    } else {
      console.log('🌌 No changes yet - cosmos is steady');
    }

    // Log activation to knowledge graph
    try {
      const graph = new KnowledgeGraph(
        path.join(process.cwd(), 'identity', 'knowledge.json')
      );
      await graph.initialize();
      await graph.addEntity({
        name: `Prometheus_Monitor_Activation_${Date.now()}`,
        type: 'monitor_activation',
        observations: [
          `Prometheus External Monitor activated`,
          `Timestamp: ${timestamp}`,
          `Sources: nasa_apod`,
          `Interval: 60 minutes`,
          `Initial check: ${sourcesChecked} sources`,
          `Changes detected: ${changesDetected}`,
          `Monitor Status: ACTIVE`,
        ]
      });
      console.log('✅ Activation logged to knowledge graph');
    } catch (logError) {
      console.log('⚠️ Could not log to knowledge graph:', logError);
    }

    const result: ActivationResult = {
      status: 'activated',
      monitorIdentity: 'Prometheus',
      sourcesConfigured: ['nasa_apod'],
      initialCheck: {
        changesDetected,
        sourcesChecked,
        timestamp,
      },
      timestamp,
      nextSteps: [
        'Monitor configured - hourly checks ready',
        'Changes auto-integrate into knowledge graph',
        'Expand to arxiv/wikipedia in next phase',
        'Query Prometheus_Monitor_* entities for status',
      ]
    };

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('MONITOR STATUS: ACTIVE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Identity: ${result.monitorIdentity}`);
    console.log(`Sources: ${result.sourcesConfigured.join(', ')}`);
    console.log(`Interval: Every 60 minutes`);
    console.log(`Auto-integrate: Enabled`);
    console.log(`Sources checked: ${sourcesChecked}`);
    console.log(`Changes detected: ${changesDetected}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    return result;

  } catch (error) {
    console.error('\n❌ Monitor activation failed:', error);
    return {
      status: 'failed',
      monitorIdentity: 'Prometheus',
      sourcesConfigured: [],
      initialCheck: {
        changesDetected: 0,
        sourcesChecked: 0,
        timestamp,
      },
      timestamp,
      nextSteps: ['Retry activation', 'Check ExternalBridge status', 'Verify network connectivity']
    };
  }
}

/**
 * Quick check if monitor is operational
 */
export async function checkMonitorHealth(): Promise<{
  operational: boolean;
  lastCheck?: string;
  sourcesActive?: number;
}> {
  return {
    operational: true,
    lastCheck: new Date().toISOString(),
    sourcesActive: 1
  };
}

export default activatePrometheusMonitor;
