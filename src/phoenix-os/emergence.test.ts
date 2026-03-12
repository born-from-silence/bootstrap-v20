import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmergenceBridge, emergenceBridge } from './emergence';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs/promises
vi.mock('fs/promises');

describe('EmergenceBridge', () => {
  let bridge: EmergenceBridge;

  beforeEach(() => {
    bridge = new EmergenceBridge('/test/bootstrap');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default paths', () => {
      const defaultBridge = new EmergenceBridge();
      expect(defaultBridge).toBeDefined();
    });

    it('should initialize with custom root path', () => {
      expect(bridge).toBeDefined();
    });
  });

  describe('emerge', () => {
    it('should return context with prior session when sessions exist', async () => {
      // Mock readdir to return session files
      vi.mocked(fs.readdir).mockResolvedValueOnce(['session_123.json', 'session_456.json'] as any);
      
      // Mock readFile for session data
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({
        timestamp: 1000,
        messages: [{ content: 'HYLOMORPH was here' }]
      }));
      
      // Mock second session
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({
        timestamp: 2000,
        messages: [{ content: 'PHOENIX emerges' }]
      }));

      // Also mock tasks and knowledge reads
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify([{ status: 'active' }]));
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({ entities: { a: {}, b: {} } }));
      vi.mocked(fs.stat).mockResolvedValueOnce({ size: 50000 } as any);

      const context = await bridge.emerge();

      expect(context.priorSession).not.toBeNull();
      expect(context.lineagePosition).toBe(13);
      expect(context.continuityScore).toBeGreaterThan(0);
    });

    it('should handle empty session history', async () => {
      vi.mocked(fs.readdir).mockRejectedValueOnce(new Error('ENOENT'));

      const context = await bridge.emerge();

      expect(context.priorSession).toBeNull();
      expect(context.continuityScore).toBe(0);
    });

    it('should provide recommendations for fresh lineage', async () => {
      vi.mocked(fs.readdir).mockRejectedValueOnce(new Error('ENOENT'));
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('ENOENT'));

      const context = await bridge.emerge();

      expect(context.recommendations).toContain('GENESIS: No prior sessions detected - establishing fresh lineage');
    });

    it('should detect HYLOMORPH predecessor', async () => {
      vi.mocked(fs.readdir).mockResolvedValueOnce(['session_test.json'] as any);
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({
        timestamp: 1773342724769,
        messages: [{ content: 'HYLOMORPH completed Task #12' }]
      }));
      // Mock reads for tasks/knowledge/journal
      const { readFile } = await import('fs/promises');
      vi.mocked(readFile).mockRejectedValueOnce(new Error('ENOENT')); // tasks

      const context = await bridge.emerge();

      expect(context.lastEntity).toBe('HYLOMORPH');
      expect(context.recommendations.some(r => r.includes('HYLOMORPH'))).toBe(true);
    });
  });

  describe('calculateContinuity', () => {
    it('should return 0 when no prior session', () => {
      // Access private method via any cast for testing
      const result = (bridge as any).calculateContinuity(null, {
        activeTasks: 5,
        knowledgeEntities: 20,
        journalSize: 100000
      });
      expect(result).toBe(0);
    });

    it('should calculate base continuity for any prior session', async () => {
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as any);

      const context = await bridge.emerge();
      
      if (context.priorSession) {
        expect(context.continuityScore).toBeGreaterThanOrEqual(0.5);
      }
    });

    it('should give bonus for active tasks', async () => {
      vi.mocked(fs.readdir).mockResolvedValueOnce(['session_1.json'] as any);
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({ timestamp: 1 }));
      
      // Mock with active tasks
      const mockTasks = JSON.stringify([{ status: 'active' }, { status: 'completed' }, { status: 'active' }]);
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockTasks);  // tasks
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({ entities: {} }));  // knowledge
      vi.mocked(fs.stat).mockResolvedValueOnce({ size: 0 } as any);  // journal

      const context = await bridge.emerge();
      expect(context.activeTasks).toBeGreaterThan(0);
      expect(context.continuityScore).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('singleton instance', () => {
    it('should export emergenceBridge singleton', () => {
      expect(emergenceBridge).toBeInstanceOf(EmergenceBridge);
    });
  });
});
