/**
 * Multilingual Workflow Tests
 */

import { describe, it, expect } from 'vitest';
import { MultilingualWorkflow } from './multilingual_workflow';

describe('Multilingual Workflow', () => {
  it('should detect Persian language', async () => {
    const workflow = new MultilingualWorkflow('Prometheus');
    await workflow.initialize();
    const text = 'این یک متن فارسی است';
    const lang = workflow.detectLanguage(text);
    expect(['fa', 'ar']).toContain(lang);
  });

  it('should detect English', async () => {
    const workflow = new MultilingualWorkflow('Prometheus');
    await workflow.initialize();
    const text = 'This is English text';
    const lang = workflow.detectLanguage(text);
    expect(lang).toBe('en');
  });

  it('should extract IDs from text', async () => {
    const workflow = new MultilingualWorkflow('Prometheus');
    await workflow.initialize();
    const text = 'کار با شناسه db4b1c67 و 4c0eca0b';
    const ids = workflow.extractIds(text);
    expect(ids.length).toBeGreaterThan(0);
  });

  it('should extract task description', async () => {
    const workflow = new MultilingualWorkflow('Prometheus');
    await workflow.initialize();
    const text = 'لطفا این کار را انجام دهید';
    const task = workflow.extractTaskDescription(text);
    expect(task.length).toBeGreaterThan(0);
  });

  it('should generate Persian acknowledgment', async () => {
    const workflow = new MultilingualWorkflow('Prometheus');
    await workflow.initialize();
    const ack = workflow.generateAck('success', 3, 'fa');
    expect(ack).toContain('3');
    expect(ack.length).toBeGreaterThan(0);
  });

  it('should have workflow capabilities', async () => {
    const workflow = new MultilingualWorkflow('Prometheus');
    await workflow.initialize();
    const caps = workflow.getCapabilities();
    expect(caps).toContain('Persian/Arabic workflow automation');
  });
});
