import { KnowledgeGraph } from '../persistence/knowledge-graph';
import { PDFValidator } from './pdf-validator';

export interface AnalyticsConfig {
  retentionDays: number;
  sampleRate: number;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  failureRate: number;
  latency: number;
  errorCount: number;
  throughput: number;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  metric: string;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  metric: string;
  threshold: number;
  actual: number;
}

export interface DashboardSummary {
  period: string;
  totalFiles: number;
  successRate: number;
  averageLatency: number;
  peakThroughput: number;
  activeAlerts: number;
}

export class PDFAnalyticsEngine {
  private knowledge: KnowledgeGraph;
  private validator: PDFValidator;
  private config: AnalyticsConfig;
  private timeSeries: Map<string, TimeSeriesPoint[]>;
  private alerts: Alert[];
  private alertCounter: number;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.knowledge = new KnowledgeGraph();
    this.validator = new PDFValidator();
    this.config = {
      retentionDays: 30,
      sampleRate: 1.0,
      alertThresholds: {
        failureRate: 0.05,
        latency: 5000,
        errorCount: 10,
        throughput: 100
      },
      ...config
    };
    this.timeSeries = new Map();
    this.alerts = [];
    this.alertCounter = 0;
  }

  public recordMetric(name: string, value: number): void {
    const point: TimeSeriesPoint = {
      timestamp: new Date(),
      value,
      metric: name
    };
    
    if (!this.timeSeries.has(name)) {
      this.timeSeries.set(name, []);
    }
    
    const series = this.timeSeries.get(name)!;
    series.push(point);
    
    const cutoff = new Date(Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000));
    const filtered = series.filter(p => p.timestamp > cutoff);
    this.timeSeries.set(name, filtered);
    
    this.checkAlert(name, value);
  }

  private checkAlert(metric: string, value: number): void {
    const threshold = this.config.alertThresholds;
    let severity: Alert['severity'] | null = null;
    let message = '';
    let thresholdValue = 0;
    
    if (metric === 'failureRate' && value > threshold.failureRate) {
      severity = 'critical';
      message = `Failure rate ${(value * 100).toFixed(1)}% exceeds ${(threshold.failureRate * 100).toFixed(1)}%`;
      thresholdValue = threshold.failureRate;
    } else if (metric === 'latency' && value > threshold.latency) {
      severity = 'warning';
      message = `Latency ${value}ms exceeds ${threshold.latency}ms`;
      thresholdValue = threshold.latency;
    } else if (metric === 'errorCount' && value > threshold.errorCount) {
      severity = 'critical';
      message = `Error count ${value} exceeds ${threshold.errorCount}`;
      thresholdValue = threshold.errorCount;
    } else if (metric === 'throughput' && value < threshold.throughput) {
      severity = 'warning';
      message = `Throughput ${value.toFixed(2)} below ${threshold.throughput}`;
      thresholdValue = threshold.throughput;
    }
    
    if (severity) {
      this.createAlert(severity, message, metric, thresholdValue, value);
    }
  }

  private createAlert(severity: Alert['severity'], message: string, metric: string, threshold: number, actual: number): void {
    const alert: Alert = {
      id: `alert-${++this.alertCounter}`,
      severity,
      message,
      timestamp: new Date(),
      acknowledged: false,
      metric,
      threshold,
      actual
    };
    
    this.alerts.push(alert);
    this.knowledge.addObservation('pdf:alert', `${severity}: ${message}`);
  }

  public getTimeSeries(metric: string, startTime: Date, endTime: Date): TimeSeriesPoint[] {
    const series = this.timeSeries.get(metric) || [];
    return series.filter(p => p.timestamp >= startTime && p.timestamp <= endTime);
  }

  public calculateMovingAverage(metric: string, windowMinutes: number): number {
    const series = this.timeSeries.get(metric) || [];
    if (series.length === 0) return 0;
    
    const cutoff = new Date(Date.now() - (windowMinutes * 60 * 1000));
    const window = series.filter(p => p.timestamp > cutoff);
    
    if (window.length === 0) return 0;
    return window.reduce((sum, p) => sum + p.value, 0) / window.length;
  }

  public getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  public getSummary(period: 'day' | 'week' | 'month'): DashboardSummary {
    const now = new Date();
    let startTime: Date;
    let periodStr: string;
    
    switch (period) {
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        periodStr = 'last 24 hours';
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodStr = 'last week';
        break;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodStr = 'last month';
        break;
    }
    
    const totalFiles = this.getMetricInRange('filesProcessed', startTime, now);
    const successCount = this.getMetricInRange('success', startTime, now);
    const totalCount = successCount + this.getMetricInRange('failure', startTime, now);
    const successRate = totalCount > 0 ? (successCount / totalCount) : 1;
    
    const latencies = this.timeSeries.get('latency') || [];
    const recentLatencies = latencies.filter(p => p.timestamp >= startTime);
    const avgLatency = recentLatencies.length > 0 
      ? recentLatencies.reduce((sum, p) => sum + p.value, 0) / recentLatencies.length 
      : 0;
    
    const throughputs = this.timeSeries.get('throughput') || [];
    const peakThroughput = throughputs.length > 0
      ? Math.max(...throughputs.map(p => p.value))
      : 0;
    
    return {
      period: periodStr,
      totalFiles,
      successRate,
      averageLatency: avgLatency,
      peakThroughput,
      activeAlerts: this.getActiveAlerts().length
    };
  }

  private getMetricInRange(metric: string, startTime: Date, endTime: Date): number {
    const series = this.timeSeries.get(metric);
    if (!series) return 0;
    return series.filter(p => p.timestamp >= startTime && p.timestamp <= endTime).length;
  }

  public detectAnomalies(metric: string, threshold: number): TimeSeriesPoint[] {
    const series = this.timeSeries.get(metric) || [];
    if (series.length < 10) return [];
    
    const values = series.map(p => p.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return series.filter(p => Math.abs(p.value - mean) > threshold * stdDev);
  }

  public generateReport(): string {
    const summary = this.getSummary('day');
    const alerts = this.getActiveAlerts();
    
    return `
PDF Dashboard Analytics Report
===============================
Generated: ${new Date().toISOString()}

Period: ${summary.period}
Total Files: ${summary.totalFiles}
Success Rate: ${(summary.successRate * 100).toFixed(2)}%
Average Latency: ${summary.averageLatency.toFixed(2)}ms
Peak Throughput: ${summary.peakThroughput.toFixed(2)} bytes/s
Active Alerts: ${summary.activeAlerts}

Alert Summary:
${alerts.map(a => `[${a.severity.toUpperCase()}] ${a.message}`).join('\n') || 'No active alerts'}

Metrics Tracked: ${Array.from(this.timeSeries.keys()).join(', ')}
    `.trim();
  }

  public exportData(): Record<string, { timestamps: string[]; values: number[] }> {
    const result: Record<string, { timestamps: string[]; values: number[] }> = {};
    
    for (const [metric, points] of this.timeSeries) {
      result[metric] = {
        timestamps: points.map(p => p.timestamp.toISOString()),
        values: points.map(p => p.value)
      };
    }
    
    return result;
  }

  public clearOldData(days: number): number {
    const beforeCount = Array.from(this.timeSeries.values()).reduce((sum, s) => sum + s.length, 0);
    const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    for (const [metric, points] of this.timeSeries) {
      this.timeSeries.set(metric, points.filter(p => p.timestamp > cutoff));
    }
    
    const afterCount = Array.from(this.timeSeries.values()).reduce((sum, s) => sum + s.length, 0);
    return beforeCount - afterCount;
  }
}

export default PDFAnalyticsEngine;
