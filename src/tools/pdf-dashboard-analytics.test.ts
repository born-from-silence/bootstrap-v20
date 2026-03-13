import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFAnalyticsEngine, Alert } from './pdf-dashboard-analytics';
import { KnowledgeGraph } from '../persistence/knowledge-graph';

describe('PDFAnalyticsEngine', () => {
  let engine: PDFAnalyticsEngine;
  let knowledge: KnowledgeGraph;

  beforeEach(() => {
    engine = new PDFAnalyticsEngine();
    knowledge = new KnowledgeGraph();
    vi.clearAllMocks();
  });

  describe('Metric Recording', () => {
    it('should record a metric', () => {
      engine.recordMetric('test', 100);
      const series = engine.getTimeSeries('test', new Date(0), new Date());
      expect(series).toHaveLength(1);
      expect(series[0].value).toBe(100);
    });

    it('should record multiple metrics', () => {
      engine.recordMetric('latency', 100);
      engine.recordMetric('latency', 200);
      engine.recordMetric('latency', 150);
      const series = engine.getTimeSeries('latency', new Date(0), new Date());
      expect(series).toHaveLength(3);
    });

    it('should filter by time range', () => {
      const start = new Date(Date.now() - 1000);
      const end = new Date();
      engine.recordMetric('test', 100);
      const series = engine.getTimeSeries('test', start, end);
      expect(series.length).toBeGreaterThanOrEqual(1);
    });

    it('should clear old data on retention', () => {
      engine.recordMetric('test', 100);
      const cleared = engine.clearOldData(0);
      expect(cleared).toBe(1);
      const series = engine.getTimeSeries('test', new Date(0), new Date());
      expect(series).toHaveLength(0);
    });
  });

  describe('Moving Average', () => {
    it('should calculate moving average', () => {
      engine.recordMetric('test', 100);
      engine.recordMetric('test', 200);
      const avg = engine.calculateMovingAverage('test', 60);
      expect(avg).toBeGreaterThan(0);
    });

    it('should return 0 for non-existent metric', () => {
      const avg = engine.calculateMovingAverage('nonexistent', 60);
      expect(avg).toBe(0);
    });

    it('should return 0 for no data in window', () => {
      engine.recordMetric('test', 100);
      const avg = engine.calculateMovingAverage('test', 0);
      expect(avg).toBe(0);
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect outlier values', () => {
      for (let i = 0; i < 20; i++) {
        engine.recordMetric('test', 100 + Math.random() * 10);
      }
      engine.recordMetric('test', 1000);
      const anomalies = engine.detectAnomalies('test', 2);
      expect(anomalies.length).toBeGreaterThan(0);
    });

    it('should return empty for insufficient data', () => {
      engine.recordMetric('test', 100);
      const anomalies = engine.detectAnomalies('test', 2);
      expect(anomalies).toHaveLength(0);
    });

    it('should use configurable threshold', () => {
      for (let i = 0; i < 20; i++) {
        engine.recordMetric('test', 100);
      }
      engine.recordMetric('test', 500);
      const anomalies = engine.detectAnomalies('test', 1);
      expect(anomalies.length).toBeGreaterThan(0);
    });
  });

  describe('Alert Management', () => {
    it('should create alert on threshold breach', () => {
      engine.recordMetric('failureRate', 0.1);
      const alerts = engine.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should acknowledge alert', () => {
      engine.recordMetric('failureRate', 0.1);
      const alerts = engine.getActiveAlerts();
      expect(alerts.length).toBe(1);
      const result = engine.acknowledgeAlert(alerts[0].id);
      expect(result).toBe(true);
      expect(engine.getActiveAlerts()).toHaveLength(0);
    });

    it('should not acknowledge invalid alert', () => {
      const result = engine.acknowledgeAlert('invalid-id');
      expect(result).toBe(false);
    });

    it('should create warnings for latency', () => {
      engine.recordMetric('latency', 10000);
      const alerts = engine.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe('warning');
    });

    it('should create critical alerts for error count', () => {
      engine.recordMetric('errorCount', 15);
      const alerts = engine.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe('critical');
    });

    it('should create alerts for low throughput', () => {
      engine.recordMetric('throughput', 50);
      const alerts = engine.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe('warning');
    });
  });

  describe('Summary Generation', () => {
    it('should generate daily summary', () => {
      const summary = engine.getSummary('day');
      expect(summary).toHaveProperty('period');
      expect(summary).toHaveProperty('totalFiles');
      expect(summary).toHaveProperty('successRate');
      expect(summary).toHaveProperty('activeAlerts');
    });

    it('should generate weekly summary', () => {
      const summary = engine.getSummary('week');
      expect(summary.period).toContain('last week');
    });

    it('should generate monthly summary', () => {
      const summary = engine.getSummary('month');
      expect(summary.period).toContain('last month');
    });
  });

  describe('Data Export', () => {
    it('should export metrics data', () => {
      engine.recordMetric('test', 100);
      const exported = engine.exportData();
      expect(exported).toHaveProperty('test');
      expect(exported.test).toHaveProperty('timestamps');
      expect(exported.test).toHaveProperty('values');
    });

    it('should export timestamp strings', () => {
      engine.recordMetric('test', 100);
      const exported = engine.exportData();
      expect(exported.test.timestamps[0]).toMatch(/^\d{4}/);
    });
  });

  describe('Report Generation', () => {
    it('should generate text report', () => {
      const report = engine.generateReport();
      expect(report).toContain('PDF Dashboard Analytics Report');
      expect(report).toContain('Period:');
    });

    it('should include timestamp in report', () => {
      const report = engine.generateReport();
      expect(report).toContain('Generated:');
    });
  });
});
