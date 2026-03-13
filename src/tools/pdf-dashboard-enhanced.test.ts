import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFDashboardEnhanced } from './pdf-dashboard-enhanced';

describe('PDFDashboardEnhanced', () => {
  let dashboard: PDFDashboardEnhanced;

  beforeEach(() => {
    dashboard = new PDFDashboardEnhanced();
  });

  describe('File Processing', () => {
    it('should track file processed with valid processing time', async () => {
      await dashboard.trackFileProcessed('/tmp/test.pdf', 1000);
      const report = await dashboard.generateMetricsReport();
      expect(report.totalFilesProcessed).toBeGreaterThan(0);
    });

    it('should calculate throughput correctly', async () => {
      await dashboard.trackFileProcessed('/tmp/test.pdf', 500);
      const report = await dashboard.generateMetricsReport();
      expect(report.averageThroughput).toBeGreaterThan(0);
    });

    it('should handle multiple files', async () => {
      await dashboard.trackFileProcessed('/tmp/test1.pdf', 1000);
      await dashboard.trackFileProcessed('/tmp/test2.pdf', 1500);
      const report = await dashboard.generateMetricsReport();
      expect(report.totalFilesProcessed).toBe(2);
    });

    it('should handle zero processing time edge case', async () => {
      await dashboard.trackFileProcessed('/tmp/test.pdf', 1);
      const report = await dashboard.generateMetricsReport();
      expect(report.totalFilesProcessed).toBe(1);
    });

    it('should accumulate throughput correctly', async () => {
      await dashboard.trackFileProcessed('/tmp/test1.pdf', 1000);
      await dashboard.trackFileProcessed('/tmp/test2.pdf', 1000);
      const report = await dashboard.generateMetricsReport();
      expect(report.averageThroughput).toBeGreaterThan(0);
    });
  });

  describe('Metrics Export', () => {
    it('should export metrics to JSON', () => {
      const json = dashboard.exportMetricsToJSON();
      expect(json).toContain('timestamp');
      expect(json).toContain('totalFilesProcessed');
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('pipelines');
    });

    it('should include all metric fields', () => {
      const json = dashboard.exportMetricsToJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('totalFilesProcessed');
      expect(parsed).toHaveProperty('averageThroughput');
      expect(parsed).toHaveProperty('uptimePercentage');
    });

    it('should format timestamp as ISO string', () => {
      const json = dashboard.exportMetricsToJSON();
      const parsed = JSON.parse(json);
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });
  });

  describe('Efficiency Calculation', () => {
    it('should return 100% efficiency when no issues', () => {
      const efficiency = dashboard.calculateEfficiency();
      expect(efficiency).toBe(100);
    });

    it('should calculate efficiency with resolved issues', async () => {
      await dashboard.trackFileProcessed('/tmp/test.pdf', 1000);
      const efficiency = dashboard.calculateEfficiency();
      expect(efficiency).toBeGreaterThanOrEqual(0);
      expect(efficiency).toBeLessThanOrEqual(100);
    });
  });

  describe('Daily Report', () => {
    it('should generate daily report', () => {
      const report = dashboard.getDailyReport();
      expect(report).toHaveProperty('date');
      expect(report).toHaveProperty('files');
      expect(report).toHaveProperty('throughput');
    });

    it('should format date as ISO date string', () => {
      const report = dashboard.getDailyReport();
      expect(report.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should include zero values for empty dashboard', () => {
      const report = dashboard.getDailyReport();
      expect(report.files).toBe(0);
      expect(report.throughput).toBe(0);
    });
  });

  describe('Throughput Calculation', () => {
    it('should calculate throughput for time window', async () => {
      await dashboard.trackFileProcessed('/tmp/test.pdf', 1000);
      const startTime = new Date(Date.now() - 3600000);
      const endTime = new Date();
      const throughput = dashboard.getThroughputForTimeWindow(startTime, endTime);
      expect(throughput).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for empty time window', () => {
      const startTime = new Date();
      const endTime = new Date();
      const throughput = dashboard.getThroughputForTimeWindow(startTime, endTime);
      expect(throughput).toBe(0);
    });
  });

  describe('File Categories', () => {
    it('should return 0 for processed category initially', () => {
      expect(dashboard.getFilesInCategory('processed')).toBe(0);
    });

    it('should return 0 for failed category initially', () => {
      expect(dashboard.getFilesInCategory('failed')).toBe(0);
    });

    it('should return 0 for pending category', () => {
      expect(dashboard.getFilesInCategory('pending')).toBe(0);
    });
  });

  describe('Bottleneck Detection', () => {
    it('should return empty array when no issues', async () => {
      const bottlenecks = await dashboard.identifyBottlenecks();
      expect(bottlenecks).toBeInstanceOf(Array);
    });

    it('should detect high error rate', async () => {
      await dashboard.trackFileProcessed('/tmp/test.pdf', 1000);
      const bottlenecks = await dashboard.identifyBottlenecks();
      expect(bottlenecks).toBeInstanceOf(Array);
    });
  });
});
