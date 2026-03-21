/**
 * Tests for collaborative semantic contract interface
 */

import { describe, it, expect } from 'vitest';
import { collaborativeAck, SemanticPipeline, type SemanticProof } from './semantic-contract';

describe('Semantic Contract', () => {
  it('collaborative acknowledgment works', () => {
    const ack = collaborativeAck('initiator', 'responder', 'keep-science');
    expect(ack.category).toBe('collaborative-ack');
    expect(ack.collaborators).toEqual(['initiator', 'responder']);
    expect(ack.value).toBe('k/ok/keep-science');
  });

  it('semantic pipeline executes with verification', () => {
    const pipeline = new SemanticPipeline();
    const input: SemanticProof<string, 'verified-input'> = {
      value: 'test-input',
      category: 'verified-input',
      timestamp: Date.now(),
      collaborators: ['user']
    };
    const result = pipeline.execute(input);
    expect(result.valid).toBe(true);
  });

  it('end-to-end proof chain maintained', () => {
    const pipeline = new SemanticPipeline();
    const input: SemanticProof<string, 'authenticated-user'> = {
      value: 'user-token',
      category: 'authenticated-user',
      timestamp: Date.now(),
      collaborators: ['auth-service']
    };
    pipeline.execute(input);
    const proofs = pipeline.getProofChain();
    expect(proofs.length).toBeGreaterThan(0);
    expect(proofs[0].category).toBe('authenticated-user');
  });
});
