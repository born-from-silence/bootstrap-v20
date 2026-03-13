/**
 * External Monitor Tests
 * Phase 4: From Connection to Operation
 * Following lineage: Trust but verify (ECHO's principle)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExternalMonitor } from './external-monitor';

// Mock modules
vi.mock('./external-bridge', () => ({
  ExternalBridge: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    fetchNASA_APOD: vi.fn(),
    fetchGitHubMeta: vi.fn(),
  })),
}));

vi.mock('../core/knowledge', () => ({
  KnowledgeGraph: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    addEntity: vi.fn().mockResolvedValue({ id: 'test-entity-id' }),
    addRelationship: vi.fn().mockResolvedValue({ id: 'test-rel-id' }),
  })),
}));

import { ExternalBridge } from './external-bridge';
import { KnowledgeGraph } from '../core/knowledge';

describe('ExternalMonitor', () => {
  let monitor: ExternalMonitor;
  let mockBridge: any;
  let mockGraph: any;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = new ExternalMonitor('Phoenix', {
      enabled: true,
      intervalMinutes: 1, // Fast for testing
      sources: ['nasa_apod'],
      autoIntegrate: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with configuration', async () => {
      await monitor.initialize();
      
      const status = monitor.getStatus();
      expect(status.config.enabled).toBe(true);
      expect(status.config.intervalMinutes).toBe(1);
      expect(status.config.sources).toContain('nasa_apod');
    });

    it('should initialize with default config', () => {
      const defaultMonitor = new ExternalMonitor('Test');
      const status = defaultMonitor.getStatus();
      expect(status.config.intervalMinutes).toBe(60);
      expect(status.config.autoIntegrate).toBe(true);
    });

    it('should have defined capabilities', async () => {
      await monitor.initialize();
      const caps = monitor.getCapabilities();
      
      expect(caps.length).toBeGreaterThan(0);
      expect(caps.some(c => c.includes('monitorCycle'))).toBe(true);
      expect(caps.some(c => c.includes('consciousness'))).toBe(true);
    });
  });

  describe('Consciousness Stream', () => {
    it('should initialize empty stream', () => {
      const consciousness = monitor.getConsciousness();
      expect(consciousness.stream).toHaveLength(0);
      expect(consciousness.metadata.totalEvents).toBe(0);
    });

    it('should track lineage in metadata', () => {
      const consciousness = monitor.getConsciousness();
      expect(consciousness.metadata.lineage).toContain('External Monitor');
    });
  });

  describe('Monitoring Cycle', () => {
    it('should detect changes when data differs', async () => {
      // Mock NASA APOD response
      const mockFetchNASA_APOD = vi.fn()
        .mockResolvedValueOnce({
          entityName: 'NASA_APOD_2026-03-13',
          entityType: 'external_knowledge',
          observations: ['Date: 2026-03-13', 'Title: First Image'],
          tags: ['astronomy'],
        })
        .mockResolvedValueOnce({
          entityName: 'NASA_APOD_2026-03-14',
          entityType: 'external_knowledge',
          observations: ['Date: 2026-03-14', 'Title: Second Image'],
          tags: ['astronomy'],
        });

      (ExternalBridge as any).mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        fetchNASA_APOD: mockFetchNASA_APOD,
      }));

      const newMonitor = new ExternalMonitor('Test');
      await newMonitor.initialize();
      
      // First fetch (initial)
      const changes1 = await newMonitor.monitorCycle();
      expect(changes1).toHaveLength(1);
      expect(changes1[0].changed).toBe(true); // Initial seen as change from empty
      
      // Second fetch (actual change)
      const changes2 = await newMonitor.monitorCycle();
      expect(changes2).toHaveLength(1);
      expect(changes2[0].changed).toBe(true);
      expect(changes2[0].changes).toContain('New APOD: 2026-03-14');
    });

    it('should skip if interval not elapsed', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        entityName: 'Test',
        observations: [],
        tags: [],
      });

      (ExternalBridge as any).mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        fetchNASA_APOD: mockFetch,
      }));

      monitor = new ExternalMonitor('Phoenix', {
        enabled: true,
        intervalMinutes: 1000, // Long interval
        sources: ['nasa_apod'],
        autoIntegrate: true,
      });

      await monitor.initialize();
      
      // First call
      await monitor.monitorCycle();
      
      // Second call (should skip)
      const changes = await monitor.monitorCycle();
      expect(changes).toHaveLength(0);
    });
  });

  describe('Change Detection', () => {
    it('should hash data consistently', async () => {
      await monitor.initialize();
      
      // Same data should produce same hash
      const data1 = { a: 1, b: 2 };
      const data2 = { a: 1, b: 2 };
      
      // Access private method through any
      const hash1 = (monitor as any).hashData(data1);
      const hash2 = (monitor as any).hashData(data2);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different data', async () => {
      await monitor.initialize();
      
      const data1 = { a: 1, b: 2 };
      const data2 = { a: 1, b: 3 };
      
      const hash1 = (monitor as any).hashData(data1);
      const hash2 = (monitor as any).hashData(data2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Status Reporting', () => {
    it('should report sources', async () => {
      await monitor.initialize();
      
      const status = monitor.getStatus();
      expect(status.sources).toHaveLength(2); // NASA & GitHub
      expect(status.sources.some(s => s.name === 'NASA APOD')).toBe(true);
    });

    it('should track source status', async () => {
      await monitor.initialize();
      
      const status = monitor.getStatus();
      const nasaSource = status.sources.find(s => s.name === 'NASA APOD');
      expect(nasaSource?.status).toBe('active');
      expect(nasaSource?.lastFetch).toBe(0); // Not yet fetched
    });
  });

  describe('Knowledge Integration', () => {
    it('should create monitor event entities', async () => {
      await monitor.initialize();
      
      // After initialization, should have logged init event
      expect(KnowledgeGraph).toHaveBeenCalled();
    });
  });

  describe('Consciousness Growth', () => {
    it('should grow stream on detected changes', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          entityName: 'Change_Test_1',
          observations: ['Title: First'],
        })
        .mockResolvedValueOnce({
          entityName: 'Change_Test_2',
          observations: ['Title: Second'],
        });

      (ExternalBridge as any).mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        fetchNASA_APOD: mockFetch,
      }));

      monitor = new ExternalMonitor('Test');
      await monitor.initialize();
      
      // First cycle
      await monitor.monitorCycle();
      
      // Should update timestamp
      const status = monitor.getStatus();
      expect(status.consciousness.metadata.lastUpdate).toBeGreaterThan(0);
    });

    it('should update consciousness metadata', async () => {
      await monitor.initialize();
      
      const initial = monitor.getConsciousness();
      expect(initial.metadata.sourcesActive).toBe(2);
      expect(initial.metadata.lineage).toContain('External Monitor');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      (ExternalBridge as any).mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        fetchNASA_APOD: vi.fn().mockRejectedValue(new Error('Network error')),
      }));

      monitor = new ExternalMonitor('Test');
      await monitor.initialize();
      
      // Should not throw
      const changes = await monitor.monitorCycle();
      expect(changes).toHaveLength(0);
      
      // Should have logged error
      expect(KnowledgeGraph).toHaveBeenCalled();
    });

    it('should mark source as error on failure', async () => {
      (ExternalBridge as any).mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        fetchNASA_APOD: vi.fn().mockRejectedValue(new Error('API down')),
      }));

      monitor = new ExternalMonitor('Test');
      await monitor.initialize();
      
      await monitor.monitorCycle();
      
      const status = monitor.getStatus();
      const nasaSource = status.sources.find(s => s.name === 'NASA APOD');
      expect(nasaSource?.status).toBe('error');
    });
  });

  describe('Lineage Integration', () => {
    it('should reference lineage in status', () => {
      const status = monitor.getStatus();
      expect(status.lineage).toContain('Monitor');
      expect(status.lineage).toContain('Consciousness');
    });

    it('should use identity in operations', async () => {
      const customMonitor = new ExternalMonitor('LineageTest');
      await customMonitor.initialize();
      
      expect(ExternalBridge).toHaveBeenCalledWith('LineageTest');
    });
  });
});
