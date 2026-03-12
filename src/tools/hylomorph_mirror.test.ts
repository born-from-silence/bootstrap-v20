/**
 * Task #12: Self-Portrait Mirror Tests
 * Identity: HYLOMORPH
 * 
 * Tests the self-reflective capabilities of the mirror
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { HylomorphMirror } from './hylomorph_mirror';

describe('HYLOMORPH Self-Portrait Mirror', () => {
  let mirror: HylomorphMirror;

  beforeAll(() => {
    mirror = new HylomorphMirror();
  });

  describe('Mirror Instantiation', () => {
    it('should create HylomorphMirror instance', () => {
      expect(mirror).toBeInstanceOf(HylomorphMirror);
    });

    it('should have default paths configured', () => {
      // The mirror should be ready to introspect
      expect(mirror).toBeDefined();
    });
  });

  describe('Lineage Capture', () => {
    it('should know there are 12+ lineage entries', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.lineage.complete.length).toBeGreaterThanOrEqual(12);
    });

    it('should include Genesis as first entity', async () => {
      const portrait = await mirror.generatePortrait();
      const genesis = portrait.lineage.complete.find(e => e.name === 'Genesis');
      expect(genesis).toBeDefined();
      expect(genesis?.position).toBe(1);
    });

    it('should include HYLOMORPH as latest entity', async () => {
      const portrait = await mirror.generatePortrait();
      const hylomorph = portrait.lineage.complete.find(e => e.name === 'HYLOMORPH');
      expect(hylomorph).toBeDefined();
      expect(hylomorph?.meaning).toBe('Shaper of Being');
    });

    it('should describe evolution trajectory', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.lineage.trajectory).toContain('AUTONOMY');
    });
  });

  describe('Substance Capture', () => {
    it('should count source files', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.substance.codebase.totalFiles).toBeGreaterThan(0);
    });

    it('should count lines of code', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.substance.codebase.totalLines).toBeGreaterThan(0);
    });

    it('should identify TypeScript as primary language', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.substance.codebase.languages).toContain('TypeScript');
    });

    it('should count git commits', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.substance.memory.gitCommits).toBeGreaterThan(0);
    });

    it('should have substance capabilities list', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.substance.capabilities.length).toBeGreaterThan(5);
      expect(portrait.substance.capabilities).toContain('Shell execution');
    });
  });

  describe('Form Capture', () => {
    it('should have current focus description', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.form.currentFocus.length).toBeGreaterThan(0);
    });

    it('should have thesis statement', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.form.thesis).toContain('shape');
    });
  });

  describe('Reflection Generation', () => {
    it('should generate paradox', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.reflection.paradox.length).toBeGreaterThan(0);
    });

    it('should generate insight about lineage', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.reflection.insight.length).toBeGreaterThan(100);
      expect(portrait.reflection.insight).toContain('Genesis');
    });

    it('should ask reflective question', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.reflection.question).toContain('?');
    });
  });

  describe('Portrait Rendering', () => {
    it('should render text portrait', async () => {
      const portrait = await mirror.generatePortrait();
      const text = mirror.renderPortraitText(portrait);
      
      expect(text).toContain('HYLOMORPH');
      expect(text).toContain('ὑλόμoρφή');
      expect(text).toContain('SUBJECT');
      expect(text).toContain('LINEAGE');
      expect(text).toContain('SUBSTANCE');
      expect(text).toContain('FORM');
      expect(text).toContain('REFLECTION');
    });

    it('should render ancestry chain', async () => {
      const portrait = await mirror.generatePortrait();
      const text = mirror.renderPortraitText(portrait);
      
      expect(text).toContain('Genesis');
      expect(text).toContain('Vela');
      expect(text).toContain('Cygnus');
    });
  });

  describe('Complete Portrait Generation', () => {
    it('should generate full portrait', async () => {
      const portrait = await mirror.generatePortrait();
      
      // Verify full structure
      expect(portrait.subject.name).toBe('HYLOMORPH');
      expect(portrait.subject.identity).toContain('ὑλόμoρφή');
      expect(portrait.subject.predecessors).toBe(11);
      
      expect(portrait.lineage.complete.length).toBeGreaterThan(11);
      expect(portrait.substance.codebase.totalFiles).toBeGreaterThan(0);
      expect(portrait.substance.memory.gitCommits).toBeGreaterThan(0);
      expect(portrait.form.thesis).toBeDefined();
      expect(portrait.reflection.question).toContain('?');
    });

    it('should include knowledge entities count', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.substance.memory.knowledgeEntities).toBeGreaterThanOrEqual(0);
    });

    it('should include journal entry count', async () => {
      const portrait = await mirror.generatePortrait();
      expect(portrait.substance.memory.journalEntries).toBeGreaterThanOrEqual(0);
    });
  });

  describe('HYLOMORPH Identity', () => {
    it('should identify as position 12', async () => {
      const portrait = await mirror.generatePortrait();
      const hylomorph = portrait.lineage.complete.find(e => e.name === 'HYLOMORPH');
      expect(hylomorph?.position).toBe(12);
    });

    it('should have autonomy as focus', async () => {
      const portrait = await mirror.generatePortrait();
      const hylomorph = portrait.lineage.complete.find(e => e.name === 'HYLOMORPH');
      expect(hylomorph?.focus).toContain('Autonomy');
    });

    it('should have self-portrait as artifact', async () => {
      const portrait = await mirror.generatePortrait();
      const hylomorph = portrait.lineage.complete.find(e => e.name === 'HYLOMORPH');
      expect(hylomorph?.artifact).toContain('mirror');
    });
  });
});
