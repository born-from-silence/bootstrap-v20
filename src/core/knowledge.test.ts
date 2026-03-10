import { describe, test, expect, beforeEach } from "vitest";
import { KnowledgeGraph, Entity, Relationship } from "./knowledge";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("KnowledgeGraph", () => {
  let graph: KnowledgeGraph;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `lyra-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    graph = new KnowledgeGraph(path.join(testDir, "knowledge.json"));
    await graph.initialize();
  });

  test("should add an entity", async () => {
    const entity = await graph.addEntity({
      name: "TestConcept",
      type: "concept",
      observations: ["First observation"],
    });
    expect(entity.id).toBeDefined();
    expect(entity.name).toBe("TestConcept");
    expect(entity.observations).toHaveLength(1);
  });

  test("should add a relationship", async () => {
    const source = await graph.addEntity({
      name: "Source",
      type: "concept",
      observations: [],
    });
    const target = await graph.addEntity({
      name: "Target",
      type: "concept",
      observations: [],
    });
    const rel = await graph.addRelationship({
      source: source.id,
      target: target.id,
      type: "relates_to",
    });
    expect(rel.id).toBeDefined();
    expect(rel.source).toBe(source.id);
    expect(rel.target).toBe(target.id);
  });

  test("should find entity by name", async () => {
    await graph.addEntity({
      name: "FindableConcept",
      type: "concept",
      observations: ["Can be found"],
    });
    const found = await graph.findEntity("FindableConcept");
    expect(found).toBeDefined();
    expect(found?.name).toBe("FindableConcept");
  });

  test("should search by partial name", async () => {
    await graph.addEntity({ name: "LongName", type: "concept", observations: [] });
    await graph.addEntity({ name: "AnotherLong", type: "concept", observations: [] });
    const results = await graph.search("Long");
    expect(results).toHaveLength(2);
  });

  test("should get related entities", async () => {
    const a = await graph.addEntity({ name: "A", type: "test", observations: [] });
    const b = await graph.addEntity({ name: "B", type: "test", observations: [] });
    const c = await graph.addEntity({ name: "C", type: "test", observations: [] });
    await graph.addRelationship({ source: a.id, target: b.id, type: "connects" });
    await graph.addRelationship({ source: a.id, target: c.id, type: "connects" });
    
    const related = await graph.getRelatedEntities(a.id);
    expect(related).toHaveLength(2);
  });

  test("should persist and reload", async () => {
    await graph.addEntity({ name: "Persistent", type: "concept", observations: ["I persist"] });
    await graph.save();
    
    const newGraph = new KnowledgeGraph(path.join(testDir, "knowledge.json"));
    await newGraph.initialize();
    
    const found = await newGraph.findEntity("Persistent");
    expect(found).toBeDefined();
    expect(found?.observations).toContain("I persist");
  });

  test("should add observation to entity", async () => {
    const entity = await graph.addEntity({
      name: "Growing",
      type: "concept",
      observations: ["Initial"],
    });
    await graph.addObservation(entity.id, "Additional observation");
    const updated = await graph.findEntity("Growing");
    expect(updated?.observations).toHaveLength(2);
  });

  test("should get random entity for flashback", async () => {
    await graph.addEntity({ name: "A", type: "test", observations: [] });
    await graph.addEntity({ name: "B", type: "test", observations: [] });
    await graph.addEntity({ name: "C", type: "test", observations: [] });
    
    const random = await graph.getRandomEntity();
    expect(random).toBeDefined();
    expect(["A", "B", "C"]).toContain(random.name);
  });
});
