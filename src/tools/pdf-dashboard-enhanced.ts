import { KnowledgeGraph } from '../persistence/knowledge-graph';
import { FileSystem } from '../persistence/file-system';
import { PDFValidator } from './pdf-validator';
import { Logger } from '../utils/logger';

export interface PipelineStatus {
  name: string;
  status: 'operational' | 'degraded' | 'failing';
  lastChecked: Date;
  errorCount: number;
  throughputBytesPerSecond: number;
  filesProcessed: number;
}

export interface DashboardMetrics {
  timestamp: Date;
  totalFilesProcessed: number;
  averageThroughput: number;
  uptimePercentage: number;
  issuesResolved: number;
  issuesOpen: number;
}

export class PDFDashboardEnhanced {
  private knowledge: KnowledgeGraph;
  private fs: FileSystem;
  private validator: PDFValidator;
  private logger: Logger;
  private metrics: DashboardMetrics;
  private pipelines: Map<string, PipelineStatus>;

  constructor() {
    this.knowledge = new KnowledgeGraph();
    this.fs = new FileSystem();
    this.validator = new PDFValidator();
    this.logger = new Logger();
    this.metrics = this.initializeMetrics();
    this.pipelines = new Map();
  }

  private initializeMetrics(): DashboardMetrics {
    return {
      timestamp: new Date(),
      totalFilesProcessed: 0,
      averageThroughput: 0,
      uptimePercentage: 100,
      issuesResolved: 0,
      issuesOpen: 5
    };
  }

  public async trackFileProcessed(filePath: string, processingTimeMs: number): Promise<void> {
    const fileSize = await this.fs.getFileSize(filePath);
    const throughput = fileSize / (processingTimeMs / 1000);
    
    this.metrics.totalFilesProcessed++;
    this.metrics.averageThroughput = 
      ((this.metrics.averageThroughput * (this.metrics.totalFilesProcessed - 1)) + throughput) / 
      this.metrics.totalFilesProcessed;
    
    await this.knowledge.addObservation('pdf:file:processed', 
      `Processed ${filePath} with throughput ${throughput.toFixed(2)} bytes/s`);
    
    this.logger.info(`File tracked: ${filePath}, throughput: ${throughput.toFixed(2)} bytes/s`);
  }

  public async generateMetricsReport(): Promise<DashboardMetrics> {
    const report = { ...this.metrics };
    report.timestamp = new Date();
    
    await this.knowledge.addEntity('pdf:metrics:report', 'MetricsReport', [
      `Total files: ${report.totalFilesProcessed}`,
      `Throughput: ${report.averageThroughput.toFixed(2)} bytes/s`,
      `Uptime: ${report.uptimePercentage}%`,
      `Issues open: ${report.issuesOpen}`,
      `Issues resolved: ${report.issuesResolved}`
    ]);
    
    return report;
  }

  public getThroughputForTimeWindow(startTime: Date, endTime: Date): number {
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    if (duration <= 0) return 0;
    
    const windowFiles = this.metrics.totalFilesProcessed * 
      (duration / ((new Date().getTime() - startTime.getTime()) / 1000));
    
    return windowFiles > 0 ? this.metrics.averageThroughput : 0;
  }

  public getFilesInCategory(category: 'processed' | 'failed' | 'pending'): number {
    switch(category) {
      case 'processed': return this.metrics.totalFilesProcessed;
      case 'failed': return this.pipelines.get('upload')?.errorCount || 0;
      case 'pending': return 0;
    }
  }

  public async identifyBottlenecks(): Promise<string[]> {
    const bottlenecks: string[] = [];
    
    for (const [name, status] of this.pipelines) {
      if (status.status === 'failing') {
        bottlenecks.push(`${name}: high failure rate (${status.errorCount} errors)`);
      }
      if (status.throughputBytesPerSecond < 1000) {
        bottlenecks.push(`${name}: low throughput (${status.throughputBytesPerSecond.toFixed(2)} bytes/s)`);
      }
    }
    
    if (this.metrics.issuesOpen > 3) {
      bottlenecks.push('Issues: backlog critical');
    }
    
    return bottlenecks;
  }

  public exportMetricsToJSON(): string {
    return JSON.stringify({
      ...this.metrics,
      timestamp: this.metrics.timestamp.toISOString(),
      pipelines: Array.from(this.pipelines.entries()).map(([name, status]) => ({
        name,
        ...status,
        lastChecked: status.lastChecked.toISOString()
      }))
    }, null, 2);
  }

  public calculateEfficiency(): number {
    const total = this.metrics.issuesResolved + this.metrics.issuesOpen;
    if (total === 0) return 100;
    return (this.metrics.issuesResolved / total) * 100;
  }

  public getDailyReport(): { date: string; files: number; throughput: number } {
    const today = new Date().toISOString().split('T')[0];
    return {
      date: today,
      files: this.metrics.totalFilesProcessed,
      throughput: this.metrics.averageThroughput
    };
  }
}
