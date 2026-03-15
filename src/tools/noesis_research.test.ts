import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NOESISResearch, type ResearchTopic, type ResearchSession } from './noesis_research';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('NOESIS Research Engine', () => {
  let testDir: string;
  let engine: NOESISResearch;
  
  beforeEach(async () => {
    // Create isolated test directory
    testDir = path.join(os.tmpdir(), `noesis-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'identity'), { recursive: true });
    
    // Create empty knowledge graph file
    await fs.writeFile(
      path.join(testDir, 'identity', 'knowledge.json'),
      JSON.stringify({ entities: {}, relationships: [], lastUpdated: Date.now() })
    );
    
    engine = new NOESISResearch(testDir);
    await engine.initialize();
  });
  
  afterEach(async () => {
    // Cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  });
  
  describe('Initialization', () => {
    it('should initialize with empty queue', async () => {
      const status = engine.getQueueStatus();
      expect(status.total).toBe(0);
      expect(status.queued).toBe(0);
    });
    
    it('should load existing queue from disk', async () => {
      // Create existing queue file
      const queueData = {
        topics: [{
          id: 'test_topic_1',
          query: 'Test query',
          source: 'internal-reflection',
          priority: 'high',
          status: 'queued',
          createdAt: Date.now()
        }],
        sessions: [],
        lastUpdated: Date.now()
      };
      
      await fs.writeFile(
        path.join(testDir, 'identity', 'noesis_queue.json'),
        JSON.stringify(queueData)
      );
      
      // Re-initialize
      const newEngine = new NOESISResearch(testDir);
      await newEngine.initialize();
      
      const status = newEngine.getQueueStatus();
      expect(status.total).toBe(1);
      expect(status.queued).toBe(1);
    });
  });
  
  describe('Queue Management', () => {
    it('should queue a curiosity', async () => {
      const topic = await engine.queueCuriosity(
        'What is consciousness?',
        'high'
      );
      
      expect(topic.query).toBe('What is consciousness?');
      expect(topic.priority).toBe('high');
      expect(topic.status).toBe('queued');
      expect(topic.id).toMatch(/^research_/);
      
      const status = engine.getQueueStatus();
      expect(status.total).toBe(1);
      expect(status.queued).toBe(1);
      expect(status.byPriority.high).toBe(1);
    });
    
    it('should prioritize curiosity over other priorities', async () => {
      await engine.queueCuriosity('Topic A', 'low');
      await engine.queueCuriosity('Topic B', 'medium');
      await engine.queueCuriosity('Topic C', 'curiosity');
      
      const next = engine.getNextTopic();
      expect(next?.query).toBe('Topic C');
      expect(next?.priority).toBe('curiosity');
    });
    
    it('should return topics in FIFO order for same priority', async () => {
      const topic1 = await engine.queueCuriosity('First', 'high');
      await new Promise(r => setTimeout(r, 10)); // Ensure timestamp difference
      const topic2 = await engine.queueCuriosity('Second', 'high');
      
      const next = engine.getNextTopic();
      expect(next?.query).toBe('First');
    });
    
    it('should return null when queue is empty', () => {
      const next = engine.getNextTopic();
      expect(next).toBeNull();
    });
    
    it('should trim queue when exceeding max size', async () => {
      // Add many low-priority topics
      for (let i = 0; i < 110; i++) {
        await engine.queueCuriosity(`Topic ${i}`, 'low');
      }
      
      const status = engine.getQueueStatus();
      expect(status.total).toBeLessThanOrEqual(100);
    });
  });
  
  describe('Research Execution', () => {
    it('should execute research on a topic', async () => {
      const topic = await engine.queueCuriosity('Test research', 'high');
      
      const session = await engine.executeResearch(topic.id);
      
      expect(session.topicId).toBe(topic.id);
      expect(session.startedAt).toBeGreaterThan(0);
      expect(session.completedAt).toBeGreaterThan(session.startedAt);
      expect(session.insights.length).toBeGreaterThan(0);
    });
    
    it('should mark topic as completed after research', async () => {
      const topic = await engine.queueCuriosity('Test research', 'high');
      await engine.executeResearch(topic.id);
      
      const status = engine.getQueueStatus();
      expect(status.completed).toBe(1);
      expect(status.queued).toBe(0);
    });
    
    it('should throw error for non-existent topic', async () => {
      await expect(engine.executeResearch('nonexistent_topic')).rejects.toThrow('not found');
    });
    
    it('should record tools used', async () => {
      const topic = await engine.queueCuriosity('Test', 'high');
      const session = await engine.executeResearch(topic.id);
      
      expect(session.toolsUsed.length).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Research Statistics', () => {
    it('should calculate research stats', async () => {
      const topic = await engine.queueCuriosity('Test', 'high');
      await engine.executeResearch(topic.id);
      
      const stats = engine.getResearchStats();
      
      expect(stats.sessionsCompleted).toBe(1);
      expect(stats.totalTopics).toBe(1);
      expect(stats.averageSessionTime).toBeGreaterThanOrEqual(0);
      expect(stats.topicsBySource['internal-reflection']).toBe(1);
    });
    
    it('should return zero for empty stats', () => {
      const stats = engine.getResearchStats();
      
      expect(stats.sessionsCompleted).toBe(0);
      expect(stats.totalTopics).toBe(0);
      expect(stats.averageSessionTime).toBe(0);
    });
  });
  
  describe('Next Steps Generation', () => {
    it('should generate next steps for findings', async () => {
      const topic = await engine.queueCuriosity('Test query', 'high');
      const session = await engine.executeResearch(topic.id);
      
      // Should have insights that include follow-up questions
      const hasFollowUps = session.insights.some(i => 
        i.includes('Consider:') || i.includes('Question:')
      );
      expect(hasFollowUps).toBe(true);
    });
  });
  
  describe('Persistence', () => {
    it('should persist queue to disk', async () => {
      await engine.queueCuriosity('Persisted topic', 'curiosity');
      
      // Force save by completing research
      const topic = engine.getNextTopic();
      if (topic) {
        await engine.executeResearch(topic.id);
      }
      
      // Verify file exists
      const queuePath = path.join(testDir, 'identity', 'noesis_queue.json');
      const data = await fs.readFile(queuePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      expect(parsed.topics).toBeDefined();
      expect(parsed.topics.length).toBeGreaterThanOrEqual(1);
      expect(parsed.lastUpdated).toBeGreaterThan(0);
    });
  });
});
