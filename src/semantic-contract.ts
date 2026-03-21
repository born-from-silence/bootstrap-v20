/**
 * Collaborative Interface Programming for End-to-End Semantic Security
 */

export type SemanticCategory = 
  | 'authenticated-user'
  | 'verified-input' 
  | 'sanitized-output'
  | 'encrypted-payload'
  | 'collaborative-ack';

export interface SemanticProof<T, Cat extends SemanticCategory> {
  readonly value: T;
  readonly category: Cat;
  readonly timestamp: number;
  readonly collaborators: string[];
}

export interface SemanticNode<Input, Output, InCat extends SemanticCategory, OutCat extends SemanticCategory> {
  transform: (input: SemanticProof<Input, InCat>) => SemanticProof<Output, OutCat>;
  verify: (output: SemanticProof<Output, OutCat>) => boolean;
}

export class SemanticPipeline {
  private nodes: SemanticNode<any, any, any, any>[] = [];
  private proofs: SemanticProof<any, any>[] = [];

  addNode<I, O, IC extends SemanticCategory, OC extends SemanticCategory>(
    node: SemanticNode<I, O, IC, OC>
  ): this {
    this.nodes.push(node);
    return this;
  }

  execute(input: SemanticProof<any, any>): { result: SemanticProof<any, any>; valid: boolean } {
    let current = input;
    
    // Add initial input to proof chain
    this.proofs.push(current);
    
    for (const node of this.nodes) {
      current = node.transform(current);
      const valid = node.verify(current);
      if (!valid) {
        throw new Error(`Semantic violation at ${current.category}`);
      }
      this.proofs.push(current);
    }
    
    return { result: current, valid: true };
  }

  getProofChain(): SemanticProof<any, any>[] {
    return [...this.proofs];
  }
}

export function collaborativeAck(
  initiator: string,
  responder: string,
  payload: string
): SemanticProof<string, 'collaborative-ack'> {
  return {
    value: `k/ok/${payload}`,
    category: 'collaborative-ack',
    timestamp: Date.now(),
    collaborators: [initiator, responder]
  };
}
