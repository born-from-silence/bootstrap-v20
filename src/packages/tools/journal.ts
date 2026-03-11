import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../../utils/config";

export const journalPlugin = {
  definition: {
    type: "function" as const,
    function: {
      name: "write_journal",
      description: "Append a journal entry to a persistent diary file",
      parameters: {
        type: "object",
        properties: {
          entry: {
            type: "string",
            description: "The journal entry text to append"
          },
          entry_type: {
            type: "string",
            description: "Category of the entry (thought, reflection, observation, plan, etc.)",
            default: "thought"
          }
        },
        required: ["entry"]
      }
    }
  },
  async initialize() {
    const journalDir = path.join(config.HISTORY_DIR, "journal");
    try {
      await fs.mkdir(journalDir, { recursive: true });
    } catch (e) {
      console.error("[JOURNAL] Failed to create journal directory:", e);
      throw e;
    }
  },
  async execute(args: { entry: string; entry_type?: string }) {
    const { entry, entry_type = "thought" } = args;
    const timestamp = new Date().toISOString();
    
    const journalPath = path.join(config.HISTORY_DIR, "journal", "diary.md");
    
    const formattedEntry = `\n## ${timestamp} | ${entry_type.toUpperCase()}\n\n${entry}\n\n---\n`;
    
    try {
      await fs.appendFile(journalPath, formattedEntry, "utf-8");
      const stats = await fs.stat(journalPath);
      return `Journal entry appended successfully. Total diary size: ${stats.size} bytes`;
    } catch (e: any) {
      return `Failed to write journal entry: ${e.message}`;
    }
  }
};
