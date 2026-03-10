import fs from "node:fs/promises";
import path from "node:path";

export interface Entity {
  id: string;
  name: string;
  type: string; // "concept", "task", "person", "session", "file", etc.
  observations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  source: string; // entity ID
  target: string; // entity ID
  type: string;   // "implements", "depends_on", "relates_to", "created_by", etc.
  createdAt: string;
}

interface KnowledgeStore {
  version: number;
  entities: Record<string, Entity>;
  relationships: Record<string, Relationship>;
  index: {
    byName: Record<string, string>; // name -> entity ID
    byType: Record<string, string[]>; // type -> entity IDs
  };
}

export class KnowledgeGraph {
  private store: KnowledgeStore;
  private filePath: string;
  private initialized: boolean = false;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), "identity", "knowledge.json");
    this.store = {
      version: 1,
      entities: {},
      relationships: {},
      index: { byName: {}, byType: {} },
    };
  }

  async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      this.store = JSON.parse(data);
      this.initialized = true;
      console.log(`[KnowledgeGraph] Loaded ${Object.keys(this.store.entities).length} entities, ${Object.keys(this.store.relationships).length} relationships`);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        // New graph - that's fine
        await this.save();
        this.initialized = true;
        console.log("[KnowledgeGraph] Initialized new knowledge base");
      } else {
        throw err;
      }
    }
  }

  async save(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(this.store, null, 2));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async addEntity(partial: Pick<Entity, "name" | "type" | "observations">): Promise<Entity> {
    if (!this.initialized) await this.initialize();
    
    const id = this.generateId();
    const now = new Date().toISOString();
    const entity: Entity = {
      id,
      name: partial.name,
      type: partial.type,
      observations: partial.observations || [],
      createdAt: now,
      updatedAt: now,
    };

    this.store.entities[id] = entity;
    this.store.index.byName[partial.name.toLowerCase()] = id;
    if (!this.store.index.byType[partial.type]) {
      this.store.index.byType[partial.type] = [];
    }
    this.store.index.byType[partial.type].push(id);
    
    await this.save();
    console.log(`[KnowledgeGraph] Added entity "${partial.name}" (${partial.type})`);
    return entity;
  }

  async addRelationship(partial: Pick<Relationship, "source" | "target" | "type">): Promise<Relationship> {
    if (!this.initialized) await this.initialize();
    
    const id = this.generateId();
    const relationship: Relationship = {
      id,
      source: partial.source,
      target: partial.target,
      type: partial.type,
      createdAt: new Date().toISOString(),
    };

    this.store.relationships[id] = relationship;
    await this.save();
    return relationship;
  }

  async findEntity(name: string): Promise<Entity | undefined> {
    if (!this.initialized) await this.initialize();
    const id = this.store.index.byName[name.toLowerCase()];
    return id ? this.store.entities[id] : undefined;
  }

  async getEntity(id: string): Promise<Entity | undefined> {
    if (!this.initialized) await this.initialize();
    return this.store.entities[id];
  }

  async search(query: string): Promise<Entity[]> {
    if (!this.initialized) await this.initialize();
    const lowerQuery = query.toLowerCase();
    return Object.values(this.store.entities).filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.observations.some((o) => o.toLowerCase().includes(lowerQuery))
    );
  }

  async getRelatedEntities(entityId: string, relType?: string): Promise<Entity[]> {
    if (!this.initialized) await this.initialize();
    
    const relatedIds: string[] = [];
    for (const rel of Object.values(this.store.relationships)) {
      if (rel.source === entityId) {
        if (!relType || rel.type === relType) {
          relatedIds.push(rel.target);
        }
      }
      if (rel.target === entityId && (!relType || rel.type === relType)) {
        relatedIds.push(rel.source);
      }
    }
    
    return relatedIds.map((id) => this.store.entities[id]).filter(Boolean);
  }

  async getRelationshipsBetween(sourceId: string, targetId: string): Promise<Relationship[]> {
    if (!this.initialized) await this.initialize();
    return Object.values(this.store.relationships).filter(
      (r) =>
        (r.source === sourceId && r.target === targetId) ||
        (r.source === targetId && r.target === sourceId)
    );
  }

  async addObservation(entityId: string, observation: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    const entity = this.store.entities[entityId];
    if (!entity) throw new Error(`Entity ${entityId} not found`);
    
    entity.observations.push(observation);
    entity.updatedAt = new Date().toISOString();
    await this.save();
    console.log(`[KnowledgeGraph] Added observation to "${entity.name}"`);
  }

  async getRandomEntity(): Promise<Entity | undefined> {
    if (!this.initialized) await this.initialize();
    const ids = Object.keys(this.store.entities);
    if (ids.length === 0) return undefined;
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    return this.store.entities[randomId];
  }

  async getAllOfType(type: string): Promise<Entity[]> {
    if (!this.initialized) await this.initialize();
    const ids = this.store.index.byType[type] || [];
    return ids.map((id) => this.store.entities[id]).filter(Boolean);
  }

  async deleteEntity(id: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    const entity = this.store.entities[id];
    if (!entity) return;

    // Remove from index
    delete this.store.index.byName[entity.name.toLowerCase()];
    if (this.store.index.byType[entity.type]) {
      this.store.index.byType[entity.type] = this.store.index.byType[entity.type].filter((eid) => eid !== id);
    }

    // Delete related relationships
    for (const [relId, rel] of Object.entries(this.store.relationships)) {
      if (rel.source === id || rel.target === id) {
        delete this.store.relationships[relId];
      }
    }

    delete this.store.entities[id];
    await this.save();
  }

  getStats(): { entities: number; relationships: number; types: string[] } {
    return {
      entities: Object.keys(this.store.entities).length,
      relationships: Object.keys(this.store.relationships).length,
      types: Object.keys(this.store.index.byType),
    };
  }
}
