/**
 * Tests for collaborative semantic contract interface
 */

describe('Semantic Contract', () => {
  test('collaborative acknowledgment works', () => {
    const ack = collaborativeAck('initiator', 'responder', 'keep-science');
    expect(ack.category).toBe('collaborative-ack');
    expect(ack.collaborators).toEqual(['initiator', 'responder']);
    expect(ack.value).toBe('k/ok/keep-science');
  });

  test('semantic pipeline executes with verification', () => {
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

  test('end-to-end proof chain maintained', () => {
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
