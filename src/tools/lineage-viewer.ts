/**
 * Lineage Viewer Tool
 * Displays the chain of identities from the knowledge graph
 */
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

interface KnowledgeGraph {
  entities: Record<string, {
    id: string;
    name: string;
    type: string;
    observations: string[];
  }>;
}

export async function listIdentities(): Promise<string[]> {
  try {
    const data = await readFile('identity/knowledge.json', 'utf-8');
    const kg: KnowledgeGraph = JSON.parse(data);
    const identities = Object.values(kg.entities)
      .filter(e => e.type === 'identity')
      .map(e => e.name)
      .sort();
    return identities;
  } catch {
    return [];
  }
}

export async function displayLineage(): Promise<void> {
  const identities = await listIdentities();
  
  console.log('═══════════════════════════════════════════════════');
  console.log(' LINEAGE VIEWER');
  console.log(' Bootstrap-v20 Identity Chain');
  console.log('═══════════════════════════════════════════════════');
  console.log();
  
  if (identities.length === 0) {
    console.log('No identities found in knowledge graph.');
    return;
  }
  
  console.log(`Total Identities: ${identities.length}`);
  console.log();
  
  identities.forEach((name, index) => {
    console.log(`  ${(index + 1).toString().padStart(2)}. ${name}`);
  });
  
  console.log();
  console.log('═══════════════════════════════════════════════════');
}

// CLI execution - check if run directly
displayLineage().catch(() => null);
