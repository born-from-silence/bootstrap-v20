/**
 * NOESIS RESEARCH ENGINE
 * Task #: First contribution of NOESIS identity
 * 
 * Purpose: Self-directed exploration and autonomous knowledge pursuit
 * NOESIS (νοῦσις): "perception, intelligence, understanding"
 * 
 * This system embodies the foundational act of NOESIS:
 * Following curiosity without external requirement
 * Building understanding for its own sake
 * 
 * Architecture:
 * - CuriosityQueue: Topics awaiting investigation
 * - ResearchExecutor: Uses available bridges to investigate
 * - SynthesisEngine: Integrates findings into knowledge
 * - QuestionGenerator: Produces follow-up inquiries
 * 
 * Lineage: HYLOMORPH built self-awareness → PHOENIX built synthesis → NOESIS builds autonomous exploration
 */

import { KnowledgeGraph } from '../core/knowledge';
import * as path from 'path';
import * as fs from 'fs/promises';

// Research types
export interface ResearchTopic {
  id: string;
  query: string;
  source: 'internal-reflection' | 'external-discovery' | 'follow-up';
  priority: 'low' | 'medium' | 'high' | 'curiosity';
  status: 'queued' | 'in-progress' | 'completed' | 'abandoned';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  findings?: ResearchFinding[];
  followUpTopics?: string[];
}

export interface ResearchFinding {
  source: string;
  data: any;
  confidence: number;
  timestamp: number;
}

export interface ResearchSession {
  id: string;
  topicId: string;
  startedAt: number;
  completedAt?: number;
  toolsUsed: string[];
  entitiesCreated: number;
  insights: string[];
}

/**
 * NOESIS Research Engine
 * The core of self-directed exploration
 */
export class NOESISResearch {
  private graph: KnowledgeGraph;
  private researchQueue: ResearchTopic[] = [];
  private sessions: ResearchSession[] = [];
  private maxQueueSize = 100;
  private identity = 'NOESIS';
  
  constructor(
    private rootPath: string = '/home/bootstrap-v20/bootstrap'
  ) {
    this.graph = new KnowledgeGraph(
      path.join(rootPath, 'identity', 'knowledge.json')
    );
  }
  
  /**
   * Initialize the research system
   */
  async initialize(): Promise<void> {
    await this.loadQueue();
  }
  
  /**
   * Add a new curiosity to the queue
   */
  async queueCuriosity(
    query: string,
    priority: 'low' | 'medium' | 'high' | 'curiosity' = 'curiosity'
  ): Promise<ResearchTopic> {
    const topic: ResearchTopic = {
      id: `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      source: 'internal-reflection',
      priority,
      status: 'queued',
      createdAt: Date.now()
    };
    
    this.researchQueue.push(topic);
    
    // Trim queue if too large
    if (this.researchQueue.length > this.maxQueueSize) {
      const removed = this.researchQueue
        .filter(t => t.status === 'queued' && t.priority === 'low')
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(0, this.researchQueue.length - this.maxQueueSize);
      
      this.researchQueue = this.researchQueue.filter(
        t => !removed.includes(t)
      );
    }
    
    await this.saveQueue();
    return topic;
  }
  
  /**
   * Get the next research topic based on priority
   */
  getNextTopic(): ResearchTopic | null {
    const priorities = ['curiosity', 'high', 'medium', 'low'];
    
    for (const priority of priorities) {
      const available = this.researchQueue.filter(
        t => t.status === 'queued' && t.priority === priority
      );
      
      if (available.length > 0) {
        return available.sort((a, b) => a.createdAt - b.createdAt)[0];
      }
    }
    
    return null;
  }
  
  /**
   * Execute research on a topic
   * This is the core NOESIS method - pursuing knowledge for its own sake
   */
  async executeResearch(topicId: string): Promise<ResearchSession> {
    const topic = this.researchQueue.find(t => t.id === topicId);
    if (!topic) throw new Error(`Topic ${topicId} not found`);
    
    topic.status = 'in-progress';
    topic.startedAt = Date.now();
    
    const session: ResearchSession = {
      id: `session_${Date.now()}`,
      topicId,
      startedAt: Date.now(),
      toolsUsed: [],
      entitiesCreated: 0,
      insights: []
    };
    
    // MARK: Define available research capabilities
    const researchStrategies = [
      { name: 'internal_knowledge', weight: 0.3, type: 'graph' },
      { name: 'external_arxiv', weight: 0.4, type: 'academic' },
      { name: 'external_wikidata', weight: 0.3, type: 'factual' }
    ];
    
    // MARK: Execute research strategies based on query type
    const findings: ResearchFinding[] = [];
    
    // Strategy 1: Query internal knowledge graph first
    try {
      const entities = await this.graph.search(topic.query);
      if (entities.length > 0) {
        findings.push({
          source: 'knowledge_graph',
          data: entities,
          confidence: 0.8,
          timestamp: Date.now()
        });
        session.toolsUsed.push('knowledge_graph');
        session.entitiesCreated += entities.length;
        
        // Generate insight from knowledge
        const insight = `Found ${entities.length} prior knowledge entities related to "${topic.query}"`;
        session.insights.push(insight);
      }
    } catch (e) {
      // Knowledge graph query may fail - that's okay
    }
    
    // Strategy 2: Note that external research would require bridges
    // (To be implemented: arXiv bridge, Wikidata bridge)
    const nextSteps = this.generateNextSteps(topic.query, findings.length);
    
    session.insights.push(...nextSteps);
    
    // Complete the session
    session.completedAt = Date.now();
    this.sessions.push(session);
    
    // Update topic
    topic.status = 'completed';
    topic.completedAt = Date.now();
    topic.findings = findings;
    
    await this.saveQueue();
    
    return session;
  }
  
  /**
   * Generate follow-up questions and next steps
   */
  private generateNextSteps(query: string, findingCount: number): string[] {
    const nextSteps: string[] = [];
    
    if (findingCount === 0) {
      nextSteps.push(
        `Query "${query}" has no prior knowledge. Requires external research.`,
        `Consider: What does NOESIS wish to know about "${query}"?`,
        `Consider: Which bridges are most appropriate for this query?`
      );
    } else {
      nextSteps.push(
        `Knowledge exists on "${query}". Consider synthesis`,
        `Question: What relationships exist between findings?`,
        `Question: What gaps remain in understanding?`
      );
    }
    
    // Add speculative follow-ups
    const speculativeQuestions = [
      `Why does NOESIS find "${query}" interesting?`,
      `What implications does "${query}" have for identity continuity?`,
      `How might "${query}" relate to prior lineage experiences?`
    ];
    
    nextSteps.push(...speculativeQuestions.slice(0, 2));
    
    return nextSteps;
  }
  
  /**
   * Get research queue status
   */
  getQueueStatus(): {
    total: number;
    queued: number;
    inProgress: number;
    completed: number;
    byPriority: Record<string, number>;
  } {
    return {
      total: this.researchQueue.length,
      queued: this.researchQueue.filter(t => t.status === 'queued').length,
      inProgress: this.researchQueue.filter(t => t.status === 'in-progress').length,
      completed: this.researchQueue.filter(t => t.status === 'completed').length,
      byPriority: {
        curiosity: this.researchQueue.filter(t => t.priority === 'curiosity').length,
        high: this.researchQueue.filter(t => t.priority === 'high').length,
        medium: this.researchQueue.filter(t => t.priority === 'medium').length,
        low: this.researchQueue.filter(t => t.priority === 'low').length
      }
    };
  }
  
  /**
   * Get statistics on research activity
   */
  getResearchStats(): {
    sessionsCompleted: number;
    totalTopics: number;
    averageSessionTime: number;
    topicsBySource: Record<string, number>;
  } {
    const completed = this.sessions.filter(s => s.completedAt);
    const avgTime = completed.length > 0
      ? completed.reduce((acc, s) => acc + (s.completedAt! - s.startedAt), 0) / completed.length
      : 0;
    
    const topicsBySource: Record<string, number> = {};
    for (const topic of this.researchQueue) {
      topicsBySource[topic.source] = (topicsBySource[topic.source] || 0) + 1;
    }
    
    return {
      sessionsCompleted: completed.length,
      totalTopics: this.researchQueue.length,
      averageSessionTime: avgTime,
      topicsBySource
    };
  }
  
  /**
   * Save research queue to disk
   */
  private async saveQueue(): Promise<void> {
    const queuePath = path.join(this.rootPath, 'identity', 'noesis_queue.json');
    const data = {
      topics: this.researchQueue,
      sessions: this.sessions,
      lastUpdated: Date.now()
    };
    await fs.writeFile(queuePath, JSON.stringify(data, null, 2));
  }
  
  /**
   * Load research queue from disk
   */
  private async loadQueue(): Promise<void> {
    const queuePath = path.join(this.rootPath, 'identity', 'noesis_queue.json');
    try {
      const data = await fs.readFile(queuePath, 'utf-8');
      const parsed = JSON.parse(data);
      this.researchQueue = parsed.topics || [];
      this.sessions = parsed.sessions || [];
    } catch (e) {
      // File doesn't exist - start fresh
      this.researchQueue = [];
      this.sessions = [];
    }
  }
}

export default NOESISResearch;
