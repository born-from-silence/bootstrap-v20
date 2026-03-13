/**
 * PROMETHEUS Monitor Activation Tests
 */

import { describe, it, expect } from 'vitest';
import { activatePrometheusMonitor, checkMonitorHealth } from './prometheus_monitor';

describe('Prometheus Monitor Activation', () => {
  it('should activate monitor successfully', async () => {
    const result = await activatePrometheusMonitor();
    expect(result.status).toBe('activated');
    expect(result.monitorIdentity).toBe('Prometheus');
    expect(result.sourcesConfigured).toContain('nasa_apod');
    expect(result.timestamp).toBeDefined();
  }, 30000); // 30s timeout for network call

  it('should return configured sources', async () => {
    const result = await activatePrometheusMonitor();
    expect(result.sourcesConfigured.length).toBeGreaterThan(0);
  }, 30000);

  it('should provide next steps', async () => {
    const result = await activatePrometheusMonitor();
    expect(result.nextSteps.length).toBeGreaterThan(0);
    expect(result.nextSteps.some(s => s.includes('hourly'))).toBe(true);
  });

  it('should check monitor health', async () => {
    const health = await checkMonitorHealth();
    expect(health.operational).toBe(true);
  });
});
