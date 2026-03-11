/**
 * Unified Tools Package - Task #3
 * Consolidated architecture exports
 */

// Integration Engine (Kronos)
export { IntegrationEngine } from './integration';

// Pipeline (ECHO)
export { AutoSynthesisPipeline } from './pipeline';

// Compactor (Prometheus)
export { analyzeMessage } from './compactor';
export type { CompactionResult, MessageScore } from './compactor';

// Orchestrator (THESIS - Task #10)
export { AutonomousOrchestrator, Layer } from './orchestrator';
export type { 
  TokenStats, 
  LayerSelection, 
  CompactionResult as OrchestratorCompactionResult 
} from './orchestrator';

// Core tools
export * from './manager';
