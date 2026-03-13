import { describe, it, expect } from 'vitest';
import { PDFPipelineDashboard } from './pdf-dashboard';

describe('PDFPipelineDashboard', () => {
  it('should initialize with known issues', () => {
    const dashboard = new PDFPipelineDashboard();
    const issues = dashboard.getKnownIssues();
    
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.id === 'PDF-001')).toBe(true);
    expect(issues.some(i => i.id === 'PDF-005')).toBe(true); // Upload contradiction
  });

  it('should have pipeline statuses', () => {
    const dashboard = new PDFPipelineDashboard();
    const pipelines = dashboard.getAllPipelines();
    
    expect(pipelines.length).toBeGreaterThan(0);
    
    const failing = dashboard.getFailingPipelines();
    expect(Array.isArray(failing)).toBe(true);
  });

  it('should have upload pipeline identified as failing', () => {
    const dashboard = new PDFPipelineDashboard();
    const uploadPipeline = dashboard.getPipelineStatus('upload-pipeline');
    
    expect(uploadPipeline).toBeDefined();
    expect(uploadPipeline?.status).toBe('failing');
    expect(uploadPipeline?.failureRate).toBe(1.0);
    expect(uploadPipeline?.knownIssues).toContain('PDF-005');
  });

  it('should generate dashboard report', () => {
    const dashboard = new PDFPipelineDashboard();
    const report = dashboard.generateDashboardReport();
    
    expect(report).toContain('PDF Pipeline Dashboard Report');
    expect(report).toContain('Generated:');
    expect(report).toContain('Failing Pipelines');
  });

  it('should track test logs for failing pipelines', () => {
    const dashboard = new PDFPipelineDashboard();
    const validatorPipeline = dashboard.getPipelineStatus('pdf-validator');
    
    expect(validatorPipeline?.testLogs.length).toBeGreaterThan(0);
    expect(validatorPipeline?.testLogs[0].result).toBeDefined();
  });
});
