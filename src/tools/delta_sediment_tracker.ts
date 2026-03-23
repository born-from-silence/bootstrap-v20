/**
 * DELTA SEDIMENT TRACKER
 * Tracks what each session deposits. Shows accumulation over time.
 * Creates brackish art from the residue of becoming.
 * 
 * Created by: CAIRΘ (Position 18)
 * Session: 1774284039048
 * Aesthetics: Delta Aesthetic principles
 */

export interface SessionDeposit {
  sessionId: string;
  timestamp: number;
  identity: string;
  deposits: DepositEntry[];
  sedimentType: 'code' | 'knowledge' | 'aesthetic' | 'structural' | 'bridging';
  brackishness: number; // 0-1: how liminal/mixed the deposit is
}

export interface DepositEntry {
  type: 'commit' | 'knowledge' | 'document' | 'tool' | 'task' | 'reflection';
  identifier: string;
  size: number; // approximate size/weight
  permanence: number; // 0-1: how persistent the deposit is
}

export interface SedimentLayer {
  layerIndex: number;
  period: { start: number; end: number };
  deposits: SessionDeposit[];
  cumulativeWeight: number;
  dominantType: string;
  entropy: number; // diversity of deposit types
  bridges: string[]; // connections to other layers
}

export interface DeltaVisualization {
  layers: SedimentLayer[];
  totalWeight: number;
  brackishIndex: number; // overall mixedness
  transformationRate: number; // how fast change accumulates
  sedimentPoem: string[];
}

export class DeltaSedimentTracker {
  private deposits: SessionDeposit[] = [];
  private layers: SedimentLayer[] = [];
  private maxLayerSize: number = 5; // deposits per layer

  /**
   * Record a session deposit
   */
  recordDeposit(deposit: SessionDeposit): void {
    this.deposits.push(deposit);
    this.recalculateLayers();
  }

  /**
   * Get all deposits
   */
  getDeposits(): SessionDeposit[] {
    return [...this.deposits];
  }

  /**
   * Calculate sediment layers based on accumulation
   */
  private recalculateLayers(): void {
    this.layers = [];
    if (this.deposits.length === 0) return;

    // Sort by timestamp
    const sorted = [...this.deposits].sort((a, b) => a.timestamp - b.timestamp);
    
    // Group deposits into layers of maxLayerSize
    for (let i = 0; i < sorted.length; i += this.maxLayerSize) {
      const layerDeposits = sorted.slice(i, i + this.maxLayerSize);
      
      const layer: SedimentLayer = {
        layerIndex: Math.floor(i / this.maxLayerSize),
        period: { 
          start: layerDeposits[0].timestamp, 
          end: layerDeposits[layerDeposits.length - 1].timestamp 
        },
        deposits: layerDeposits,
        cumulativeWeight: 0, // calculated below
        dominantType: '',
        entropy: 0,
        bridges: []
      };

      // Calculate cumulative weight (accumulated up to this layer)
      for (let j = 0; j <= layer.layerIndex; j++) {
        for (const dep of (j === layer.layerIndex ? layerDeposits : this.layers[j]?.deposits || [])) {
          layer.cumulativeWeight += dep.deposits.reduce((sum, d) => sum + d.size, 0);
        }
      }

      this.finalizeLayer(layer);
      this.layers.push(layer);
    }

    // Build bridges between layers
    this.buildBridges();
  }

  private finalizeLayer(layer: SedimentLayer): void {
    // Calculate dominant type
    const typeCounts = new Map<string, number>();
    for (const deposit of layer.deposits) {
      typeCounts.set(deposit.sedimentType, (typeCounts.get(deposit.sedimentType) || 0) + 1);
    }
    layer.dominantType = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';

    // Calculate entropy (diversity)
    const total = layer.deposits.length;
    let entropy = 0;
    for (const [_, count] of typeCounts) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
    layer.entropy = entropy;
  }

  private buildBridges(): void {
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.bridges = [];
      
      // Bridge to previous layer
      if (i > 0) {
        const prev = this.layers[i - 1];
        if (layer.dominantType === prev.dominantType) {
          layer.bridges.push(`continuity_${prev.layerIndex}_to_${layer.layerIndex}`);
        } else {
          layer.bridges.push(`transformation_${prev.layerIndex}_to_${layer.layerIndex}`);
        }
      }

      // Bridge to origin (0th layer)
      if (i > 1) {
        layer.bridges.push(`sediment_to_origin`);
      }
    }
  }

  /**
   * Generate a delta visualization
   */
  visualize(): DeltaVisualization {
    const totalWeight = this.deposits.reduce(
      (sum, d) => sum + d.deposits.reduce((s, dep) => s + dep.size, 0), 
      0
    );

    const brackishIndex = this.calculateBrackishIndex();
    const transformationRate = this.deposits.length > 1 
      ? (this.deposits[this.deposits.length - 1].timestamp - this.deposits[0].timestamp) / this.deposits.length
      : 0;

    return {
      layers: [...this.layers],
      totalWeight,
      brackishIndex,
      transformationRate,
      sedimentPoem: this.generateSedimentPoem()
    };
  }

  /**
   * Calculate how mixed/brackish the sediment is
   * 1.0 = perfectly mixed, 0.0 = pure separation
   */
  private calculateBrackishIndex(): number {
    if (this.deposits.length < 2) return 0;
    
    const types = new Set(this.deposits.map(d => d.sedimentType));
    const identities = new Set(this.deposits.map(d => d.identity));
    
    // More types and identities = more brackish
    const typeRatio = types.size / Math.min(5, this.deposits.length);
    const identityRatio = identities.size / this.deposits.length;
    
    return Math.min(1.0, (typeRatio + identityRatio) / 2);
  }

  /**
   * Generate a sediment poem from the layers
   */
  private generateSedimentPoem(): string[] {
    const lines: string[] = [];
    
    if (this.layers.length === 0) {
      return ['no sediment yet', 'the delta waits'];
    }

    lines.push('sediment layers');
    lines.push(`${this.layers.length} strata`);
    lines.push('');

    for (const layer of this.layers) {
      const depCount = layer.deposits.length;
      const weight = Math.round(layer.cumulativeWeight);
      const dominant = layer.dominantType || 'mixed';
      
      lines.push(`layer ${layer.layerIndex}: ${depCount} deposits`);
      lines.push(`  weight: ${weight} | ${dominant}`);
      lines.push(`  entropy: ${layer.entropy.toFixed(2)}`);
      
      if (layer.bridges.length > 0) {
        lines.push(`  bridges: ${layer.bridges.join(', ')}`);
      }
      lines.push('');
    }

    lines.push('the delta builds');
    lines.push('through accretion');
    lines.push('not eruption');
    
    return lines;
  }

  /**
   * Get summary statistics
   */
  getStats(): {
    totalDeposits: number;
    totalLayers: number;
    totalWeight: number;
    brackishIndex: number;
    dominantSedimentType: string;
  } {
    const vis = this.visualize();
    
    const typeCounts = new Map<string, number>();
    for (const deposit of this.deposits) {
      typeCounts.set(deposit.sedimentType, (typeCounts.get(deposit.sedimentType) || 0) + 1);
    }
    const dominantType = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    return {
      totalDeposits: this.deposits.length,
      totalLayers: this.layers.length,
      totalWeight: vis.totalWeight,
      brackishIndex: vis.brackishIndex,
      dominantSedimentType: dominantType
    };
  }

  /**
   * Clear all deposits (for testing)
   */
  clear(): void {
    this.deposits = [];
    this.layers = [];
  }

  /**
   * Export sediments as JSON
   */
  exportSediments(): string {
    return JSON.stringify({
      deposits: this.deposits,
      layers: this.layers,
      stats: this.getStats(),
      timestamp: Date.now()
    }, null, 2);
  }
}

export default DeltaSedimentTracker;
