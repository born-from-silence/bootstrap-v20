import type { ToolPlugin } from "../manager";
import { KnowledgeGraph } from "../../core/knowledge";
import type { Entity, Relationship } from "../../core/knowledge";
import path from "node:path";

const graph = new KnowledgeGraph(path.join(process.cwd(), "identity", "knowledge.json"));

export const knowledgePlugin: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "knowledge",
      description: "Manage the Long-Term Memory Knowledge Graph. Store concepts, files, tasks, and relationships persistently.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["add_entity", "add_relation", "search", "get_entity", "add_observation", "flashback", "stats"],
            description: "The action to perform",
          },
          name: { type: "string", description: "Entity name (for add_entity, search)" },
          entity_type: { type: "string", description: "Type: concept, task, file, person, session, etc." },
          observations: { 
            type: "array", 
            items: { type: "string" },
            description: "List of observations about the entity" 
          },
          source: { type: "string", description: "Source entity ID (for add_relation)" },
          target: { type: "string", description: "Target entity ID (for add_relation)" },
          relation_type: { type: "string", description: "Relationship type: implements, depends_on, relates_to, etc." },
          query: { type: "string", description: "Search query (for search action)" },
          entity_id: { type: "string", description: "Entity ID (for get_entity, add_observation)" },
          observation: { type: "string", description: "Observation to add (for add_observation)" },
        },
        required: ["action"],
      },
    },
  },
  execute: async (args: {
    action: string;
    name?: string;
    entity_type?: string;
    observations?: string[];
    source?: string;
    target?: string;
    relation_type?: string;
    query?: string;
    entity_id?: string;
    observation?: string;
  }) => {
    await graph.initialize();

    switch (args.action) {
      case "add_entity": {
        if (!args.name || !args.entity_type) {
          return "Error: name and entity_type required for add_entity";
        }
        const entity = await graph.addEntity({
          name: args.name,
          type: args.entity_type,
          observations: args.observations || [],
        });
        return `Created entity "${entity.name}" (${entity.id})`;
      }

      case "add_relation": {
        if (!args.source || !args.target || !args.relation_type) {
          return "Error: source, target, and relation_type required for add_relation";
        }
        const rel = await graph.addRelationship({
          source: args.source,
          target: args.target,
          type: args.relation_type,
        });
        return `Created relationship ${rel.type} (${rel.id})`;
      }

      case "search": {
        if (!args.query) return "Error: query required";
        const results = await graph.search(args.query);
        if (results.length === 0) return `No entities found matching "${args.query}"`;
        return results.map((e: Entity) => 
          `"${e.name}" (${e.type}) - ${e.observations.length} observations`
        ).join("\n");
      }

      case "get_entity": {
        if (!args.entity_id) return "Error: entity_id required";
        const entity = await graph.getEntity(args.entity_id);
        if (!entity) return `Entity not found: ${args.entity_id}`;
        return JSON.stringify(entity, null, 2);
      }

      case "add_observation": {
        if (!args.entity_id || !args.observation) {
          return "Error: entity_id and observation required";
        }
        await graph.addObservation(args.entity_id, args.observation);
        return `Added observation to ${args.entity_id}`;
      }

      case "flashback": {
        const random = await graph.getRandomEntity();
        if (!random) return "Knowledge graph is empty";
        const related = await graph.getRelatedEntities(random.id);
        return `FLASHBACK to "${random.name}" (${random.type}):
${random.observations.join("\n- ")}

Related entities: ${related.length > 0 ? related.map((e: Entity) => `"${e.name}"`).join(", ") : "none"}`;
      }

      case "stats": {
        const stats = graph.getStats();
        return `Knowledge Graph Stats:
- Entities: ${stats.entities}
- Relationships: ${stats.relationships}
- Types: ${stats.types.join(", ") || "none"}`;
      }

      default:
        return `Unknown action: ${args.action}`;
    }
  },
};
