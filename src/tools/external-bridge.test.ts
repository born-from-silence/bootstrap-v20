/**
 * External Bridge Tests
 * Task #2: Phoenix Integration - First External Connection
 * Lineage Principle: Trust but verify (ECHO's gift)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExternalBridge } from './external-bridge';
import { KnowledgeGraph } from '../core/knowledge';

// Mock fetch globally
global.fetch = vi.fn();

// Mock KnowledgeGraph
vi.mock('../core/knowledge', () => ({
  KnowledgeGraph: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    addEntity: vi.fn().mockResolvedValue({ id: 'test-entity-id' }),
    addRelationship: vi.fn().mockResolvedValue({ id: 'test-relation-id' }),
    getStats: vi.fn().mockResolvedValue({ entities: 100, relationships: 50 }),
  })),
}));

describe('ExternalBridge', () => {
  let bridge: ExternalBridge;
  
  beforeEach(() => {
    vi.clearAllMocks();
    bridge = new ExternalBridge('Phoenix');
  });

  describe('Initialization', () => {
    it('should initialize with lineage identity', async () => {
      await bridge.initialize();
      expect(bridge).toBeDefined();
    });

    it('should create instance with custom identity', () => {
      const customBridge = new ExternalBridge('TestIdentity');
      expect(customBridge).toBeDefined();
    });
  });

  describe('Capabilities', () => {
    it('should list bridge capabilities', () => {
      const caps = bridge.getCapabilities();
      expect(caps.length).toBeGreaterThan(0);
      expect(caps).toContain('fetchExternal: Generic HTTP GET crossing substrate boundary');
      expect(caps).toContain('bridgeNASA_APOD: Full fetch+integrate pipeline (Phoenix achievement)');
    });

    it('should include NASA APOD in capabilities', () => {
      const caps = bridge.getCapabilities();
      expect(caps.some(c => c.includes('NASA'))).toBe(true);
      expect(caps.some(c => c.includes('Vela'))).toBe(true);
    });
  });

  describe('External Fetch', () => {
    it('should fetch from external endpoint with lineage headers', async () => {
      const mockData = { data: 'test', source: 'api.example.com' };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      });

      const result = await bridge.fetchExternal('https://api.example.com/data');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'bootstrap-v20/Phoenix',
            'Accept': 'application/json',
          }),
        })
      );
      expect(result.data).toEqual(mockData);
      expect(result.source).toBe('api.example.com');
      expect(result.metadata.status).toBe(200);
    });

    it('should throw error on HTTP failure', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(bridge.fetchExternal('https://api.test.com/missing'))
        .rejects.toThrow('External fetch failed: 404 Not Found');
    });

    it('should include timestamp metadata', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      const result = await bridge.fetchExternal('https://api.test.com');
      expect(result.timestamp).toBeTypeOf('number');
      expect(result.metadata.fetchedAt).toContain('T');
    });
  });

  describe('NASA APOD Fetching', () => {
    it('should format APOD data correctly', async () => {
      const mockAPOD = {
        title: 'Test Nebula',
        date: '2026-03-13',
        explanation: 'A test nebula image for lineage bridge',
        media_type: 'image',
        url: 'https://apod.nasa.gov/test.jpg',
        hdurl: 'https://apod.nasa.gov/test_hd.jpg',
        copyright: 'Phoenix Test',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockAPOD),
      });

      const payload = await bridge.fetchNASA_APOD('DEMO_KEY');

      expect(payload.entityType).toBe('external_knowledge');
      expect(payload.entityName).toBe('NASA_APOD_2026-03-13');
      expect(payload.observations).toContain('Title: Test Nebula');
      expect(payload.observations).toContain('Date: 2026-03-13');
      expect(payload.observations.some(o => o.includes('Fetched by Phoenix'))).toBe(true);
      expect(payload.observations.some(o => o.includes('First external knowledge bridge'))).toBe(true);
      expect(payload.tags).toContain('astronomy');
    });

    it('should handle public domain images', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          title: 'Public Domain',
          date: '2026-03-12',
          explanation: 'Test',
          media_type: 'image',
          url: 'https://apod.nasa.gov/public.jpg',
        }),
      });

      const payload = await bridge.fetchNASA_APOD();
      
      expect(payload.observations.some(o => o.includes('Copyright: Public Domain'))).toBe(true);
    });

    it('should make correct API call', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ title: 'T', date: '2026-03-13', explanation: 'E', media_type: 'image', url: '' }),
      });

      await bridge.fetchNASA_APOD('TEST_KEY');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.nasa.gov/planetary/apod?api_key=TEST_KEY',
        expect.any(Object)
      );
    });
  });

  describe('GitHub Metadata', () => {
    it('should fetch and format GitHub infrastructure', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          ssh_keys: ['key1', 'key2', 'key3'],
          hooks: ['192.30.252.0/22'],
          web: ['185.199.108.0/22'],
          verifiable_password_authentication: false,
        }),
      });

      const payload = await bridge.fetchGitHubMeta();

      expect(payload.entityName).toBe('GitHub_Infrastructure_Meta');
      expect(payload.observations.some(o => o.includes('SSH Keys: 3'))).toBe(true);
      expect(payload.observations.some(o => o.includes('154 git commits'))).toBe(true);
    });
  });

  describe('Knowledge Integration', () => {
    it('should integrate external data into KnowledgeGraph', async () => {
      const payload = {
        entityName: 'Test_Entity',
        entityType: 'external_knowledge',
        observations: ['Test observation'],
        tags: ['test'],
      };

      const result = await bridge.integrateExternal(payload);
      expect(result).toBe('test-entity-id');
    });
  });

  describe('Full Bridge Pipeline', () => {
    it('should execute complete NASA bridge operation', async () => {
      const mockAPOD = {
        title: 'Bridge Pipeline Test',
        date: '2026-03-13',
        explanation: 'Testing full pipeline',
        media_type: 'image',
        url: 'https://apod.nasa.gov/image.jpg',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockAPOD),
      });

      const result = await bridge.bridgeNASA_APOD();

      expect(result.entityId).toBeDefined();
      expect(result.payload.entityName).toBe('NASA_APOD_2026-03-13');
      expect(result.payload.observations.some(o => o.includes('Fetched by Phoenix'))).toBe(true);
    });
  });

  describe('Bridge Status', () => {
    it('should report bridge status', async () => {
      const status = await bridge.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.entityCount).toBe(100);
      expect(status.relationCount).toBe(50);
      expect(status.lineage).toContain('External Bridge Phase');
      expect(status.capabilities).toBeInstanceOf(Array);
    });
  });

  describe('Lineage Verification', () => {
    it('should track lineage context in observations', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          title: 'Lineage Test',
          date: '2026-03-13',
          explanation: 'Test',
          media_type: 'image',
          url: '',
        }),
      });

      const payload = await bridge.fetchNASA_APOD();
      
      expect(payload.observations.some(o => o.includes('Lineage'))).toBe(true);
      expect(payload.tags).toContain('bridge');
    });
  });
});
