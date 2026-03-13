/**
 * MULTILINGUAL WORKFLOW PROCESSOR
 * Task: Automate Persian/Arabic input processing with ID extraction
 * 
 * Workflow:
 * INPUT: Persian/Arabic text + IDs
 * PROCESS: Extract IDs → Create task → Execute → Report
 * OUTPUT: Persian/Arabic acknowledgment
 */

import { KnowledgeGraph } from '../core/knowledge';
import * as path from 'path';

interface WorkflowInput {
  text: string;
  language: 'fa' | 'ar' | 'en';
  ids?: string[];
  extractedTask?: string;
}

interface WorkflowOutput {
  status: 'processed' | 'failed';
  taskId?: string;
  entitiesCreated: string[];
  acknowledgment: string;
  language: string;
}

/**
 * Multilingual Workflow Processor
 * Handles Persian/Arabic inputs, extracts IDs, automates task creation
 */
export class MultilingualWorkflow {
  private graph: KnowledgeGraph;
  private userAgent: string;

  constructor(private lineageIdentity: string = 'Prometheus') {
    this.graph = new KnowledgeGraph(
      path.join(process.cwd(), 'identity', 'knowledge.json')
    );
    this.userAgent = `bootstrap-v20/${lineageIdentity}`;
  }

  /**
   * Initialize processor
   */
  async initialize(): Promise<void> {
    await this.graph.initialize();
  }

  /**
   * Detect language (basic)
   */
  detectLanguage(text: string): 'fa' | 'ar' | 'en' {
    // Persian/Farsi Unicode range
    if (/[\u0600-\u06FF\u0750-\u077F]/.test(text)) {
      // Check for Persian-specific characters
      if (/[یکمنتالو سهدفخقجicherCharacters]/.test(text)) return 'fa';
      return 'ar'; // Arabic
    }
    return 'en';
  }

  /**
   * Extract IDs from text
   * Pattern: alphanumeric codes like db4b1c67, 4c0eca0b
   */
  extractIds(text: string): string[] {
    const idPattern = /\b[a-f0-9]{8,12}\b/gi;
    const matches = text.match(idPattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  /**
   * Extract task description from Persian/Arabic text
   * Focus on verbs and keywords
   */
  extractTaskDescription(text: string): string {
    // Common Persian task keywords
    const taskKeywords = [
      'کار', 'انجام', 'بساز', 'بیاور', 'جستجو',
      'بگیر', 'پیدا', 'بخوان', 'بنویس', 'task',
      'create', 'fetch', 'search', 'find'
    ];

    // Simple extraction: look for keywords + following words
    const words = text.split(/\s+/);
    const taskWords: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      if (taskKeywords.some(kw => words[i].includes(kw))) {
        // Include this word and next few
        taskWords.push(words[i]);
        if (i + 1 < words.length) taskWords.push(words[i + 1]);
        if (i + 2 < words.length) taskWords.push(words[i + 2]);
        break;
      }
    }

    return taskWords.join(' ') || 'automated_task';
  }

  /**
   * Generate acknowledgment in detected language
   */
  generateAck(status: 'success' | 'failed', count: number, lang: string): string {
    if (lang === 'fa') {
      return status === 'success' 
        ? `انجام شد: ${count} آیتم پردازش شد`
        : 'خطا در پردازش';
    }
    if (lang === 'ar') {
      return status === 'success'
        ? `تم: ${count} عناصر تم معالجتها`
        : 'خطأ في المعالجة';
    }
    return status === 'success' 
      ? `Complete: ${count} items processed`
      : 'Processing failed';
  }

  /**
   * Process workflow input
   */
  async process(input: WorkflowInput): Promise<WorkflowOutput> {
    const startTime = Date.now();
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('MULTILINGUAL WORKFLOW PROCESSOR');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Input: "${input.text.substring(0, 50)}..."`);
    console.log(`Language: ${input.language}`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    try {
      // Extract IDs if not provided
      const ids = input.ids || this.extractIds(input.text);
      console.log(`Extracted IDs: ${ids.length > 0 ? ids.join(', ') : 'None'}`);

      // Extract task description
      const taskDesc = input.extractedTask || this.extractTaskDescription(input.text);
      console.log(`Task detected: "${taskDesc}"`);

      // Create workflow entity
      const workflowEntity = `Workflow_${Date.now()}`;
      await this.graph.addEntity({
        name: workflowEntity,
        type: 'multilingual_workflow',
        observations: [
          `Input: "${input.text.substring(0, 100)}..."`,
          `Language: ${input.language}`,
          `Extracted IDs: ${ids.join(', ') || 'None'}`,
          `Task: ${taskDesc}`,
          `Processed by: ${this.lineageIdentity}`,
          `Timestamp: ${new Date().toISOString()}`,
          `Duration: ${Date.now() - startTime}ms`
        ]
      });

      // Search knowledge graph for extracted IDs
      const entitiesCreated: string[] = [workflowEntity];
      for (const id of ids.slice(0, 3)) {
        const entity = await this.graph.getEntity(id);
        if (entity) {
          await this.graph.addRelationship({ source: workflowEntity, target: id, type: "references" });
          entitiesCreated.push(id);
          console.log(`✅ Linked to: ${id}`);
        }
      }

      const acknowledgment = this.generateAck('success', entitiesCreated.length, input.language);
      
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('WORKFLOW COMPLETE');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`Status: Processed`);
      console.log(`Entities: ${entitiesCreated.length}`);
      console.log(`Ack: ${acknowledgment}`);
      console.log('═══════════════════════════════════════════════════════════════\n');

      return {
        status: 'processed',
        taskId: workflowEntity,
        entitiesCreated,
        acknowledgment,
        language: input.language
      };

    } catch (error) {
      console.error('\n❌ Workflow failed:', error);
      
      return {
        status: 'failed',
        entitiesCreated: [],
        acknowledgment: this.generateAck('failed', 0, input.language),
        language: input.language
      };
    }
  }

  /**
   * Process raw text (auto-detect)
   */
  async processText(text: string): Promise<WorkflowOutput> {
    const lang = this.detectLanguage(text);
    const ids = this.extractIds(text);
    
    return this.process({
      text,
      language: lang,
      ids: ids.length > 0 ? ids : undefined
    });
  }

  /**
   * Get capabilities
   */
  getCapabilities(): string[] {
    return [
      'detectLanguage(): Identify Persian/Arabic/English',
      'extractIds(): Parse alphanumeric IDs',
      'extractTaskDescription(): Extract task intent',
      'process(): Full workflow execution',
      'processText(): Auto-detect and process',
      'Persian/Arabic workflow automation'
    ];
  }
}

export default MultilingualWorkflow;
export type { WorkflowInput, WorkflowOutput };
