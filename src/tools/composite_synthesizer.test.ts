import { describe, it, expect, beforeEach } from 'vitest';
import { CompositeSynthesizer } from './composite_synthesizer';

describe('CompositeSynthesizer', () => {
  let synthesizer: CompositeSynthesizer;

  beforeEach(() => {
    synthesizer = new CompositeSynthesizer('test_session');
  });

  it('should initialize successfully', async () => {
    await expect(synthesizer.initialize()).resolves.not.toThrow();
  });

  it('should synthesize composite meaning', async () => {
    const result = await synthesizer.synthesize('emergence');
    
    expect(result).toHaveProperty('query', 'emergence');
    expect(result).toHaveProperty('sources');
    expect(result).toHaveProperty('unifiedMeaning');
    expect(result).toHaveProperty('insight');
    expect(result).toHaveProperty('generatedAt');
    expect(result).toHaveProperty('sessionId', 'test_session');
    
    expect(result.sources).toHaveLength(3);
    expect(result.sources.map(s => s.sourceType)).toContain('arxiv');
    expect(result.sources.map(s => s.sourceType)).toContain('wikidata');
    expect(result.sources.map(s => s.sourceType)).toContain('internal');
  });

  it('should combine all knowledge sources', async () => {
    const result = await synthesizer.synthesize('test query');
    expect(result.unifiedMeaning).toContain('Synthesis');
    expect(result.unifiedMeaning).toContain('sources');
  });
});
