/**
 * Task 6: Production-Ready Infrastructure
 * 
 * Takes Task 5 (Auto-Synthesis Pipeline - living code) and makes it production-ready:
 * - Error handling & recovery
 * - Logging & monitoring
 * - Graceful shutdown
 * - Health checks
 * - Environment configuration
 */

import { IntegrationEngine } from '../tools/plugins/integration';

interface ProductionConfig {
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  healthCheckInterval: number;
  gracefulShutdownTimeout: number;
  maxRetries: number;
  retryDelay: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: Date;
  errors: string[];
}

class ProductionEngine {
  private engine: IntegrationEngine;
  private config: ProductionConfig;
  private healthStatus: HealthStatus;
  private shutdownCallbacks: Array<() => Promise<void>> = [];
  private isShuttingDown = false;

  constructor(config: Partial<ProductionConfig> = {}) {
    this.config = {
      nodeEnv: process.env.NODE_ENV as ProductionConfig['nodeEnv'] || 'development',
      logLevel: (process.env.LOG_LEVEL as ProductionConfig['logLevel']) || 'info',
      healthCheckInterval: config.healthCheckInterval || 30000,
      gracefulShutdownTimeout: config.gracefulShutdownTimeout || 5000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000
    };

    this.engine = new IntegrationEngine();
    this.healthStatus = {
      status: 'healthy',
      uptime: Date.now(),
      lastCheck: new Date(),
      errors: []
    };

    this.setupGracefulShutdown();
    this.startHealthChecks();
  }

  // Production-grade logging
  private log(level: ProductionConfig['logLevel'], message: string, meta?: Record<string, unknown>): void {
    const levels: Record<string, number> = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] >= levels[this.config.logLevel]) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
      }));
    }
  }

  // Retry wrapper for resilience
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          this.log('info', `${operationName} succeeded on retry ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        this.log('warn', `${operationName} failed (attempt ${attempt}/${this.config.maxRetries})`, {
          error: lastError.message
        });
        
        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }
    
    throw lastError;
  }

  // Health check
  private startHealthChecks(): void {
    setInterval(() => {
      this.checkHealth();
    }, this.config.healthCheckInterval);
  }

  private async checkHealth(): Promise<void> {
    try {
      await this.engine.archiveCompletedTasks();
      this.healthStatus.status = 'healthy';
      this.healthStatus.errors = [];
    } catch (error) {
      this.healthStatus.status = 'degraded';
      this.healthStatus.errors.push((error as Error).message);
      this.log('error', 'Health check failed', { error: (error as Error).message });
    }
    
    this.healthStatus.lastCheck = new Date();
  }

  getHealth(): HealthStatus {
    return { ...this.healthStatus };
  }

  // Graceful shutdown
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.log('info', `Received ${signal}, starting graceful shutdown...`);
      this.isShuttingDown = true;
      
      const timeout = setTimeout(() => {
        this.log('error', 'Forced shutdown after timeout');
        process.exit(1);
      }, this.config.gracefulShutdownTimeout);
      
      try {
        for (const callback of this.shutdownCallbacks) {
          await callback();
        }
        clearTimeout(timeout);
        this.log('info', 'Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        this.log('error', 'Shutdown failed', { error: (error as Error).message });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  onShutdown(callback: () => Promise<void>): void {
    this.shutdownCallbacks.push(callback);
  }

  // Production-ready run cycle
  async runProductionCycle(): Promise<{
    success: boolean;
    results: {
      archive: { archived: number; triggered: boolean };
      extract: { extracted: number; triggered: boolean };
      plan: { goals: string[]; context: string };
    };
    health: HealthStatus;
  }> {
    if (this.isShuttingDown) {
      throw new Error('Engine is shutting down');
    }

    this.log('info', 'Starting production cycle');
    
    const startTime = Date.now();
    
    const [archiveResult, extractResult, planResult] = await Promise.all([
      this.withRetry(async () => {
        const tasks = await this.engine.archiveCompletedTasks();
        return { archived: tasks.archived, triggered: tasks.archived > 0 };
      }, 'archive'),
      
      this.withRetry(async () => {
        const observations = await this.engine.extractJournalObservations();
        return { extracted: observations.extracted, triggered: observations.extracted > 0 };
      }, 'extract'),
      
      this.withRetry(async () => {
        const plan = await this.engine.generateSessionPlan();
        return plan;
      }, 'plan')
    ]);
    
    const duration = Date.now() - startTime;
    
    this.log('info', 'Production cycle complete', {
      duration,
      archived: archiveResult.archived,
      extracted: extractResult.extracted,
      goals: planResult.goals.length
    });
    
    return {
      success: true,
      results: {
        archive: archiveResult,
        extract: extractResult,
        plan: planResult
      },
      health: this.getHealth()
    };
  }

  async start(): Promise<void> {
    this.log('info', 'Production engine started', {
      environment: this.config.nodeEnv,
      logLevel: this.config.logLevel
    });
  }
}

export { ProductionEngine };
export type { ProductionConfig, HealthStatus };
export default ProductionEngine;
