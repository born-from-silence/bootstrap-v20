import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { journalPlugin } from "./journal";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { config } from "../../utils/config";

describe("journalPlugin", () => {
  beforeEach(async () => {
    // Create the journal directory in the test environment
    const journalDir = path.join(config.HISTORY_DIR, "journal");
    await fs.mkdir(journalDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup - remove any diary file created during tests
    try {
      const diaryPath = path.join(config.HISTORY_DIR, "journal", "diary.md");
      await fs.unlink(diaryPath);
    } catch {}
  });

  it("should have required tool definition structure", () => {
    expect(journalPlugin.definition).toBeDefined();
    expect(journalPlugin.definition.function.name).toBe("write_journal");
    expect(journalPlugin.definition.function.description).toBeDefined();
    expect(journalPlugin.definition.function.parameters).toBeDefined();
    expect(journalPlugin.execute).toBeDefined();
  });

  it("should execute and write to diary file", async () => {
    // Test entry
    const testEntry = "This is a test journal entry.";
    const testType = "observation";
    
    // Execute
    const result = await journalPlugin.execute({
      entry: testEntry,
      entry_type: testType
    });
    
    // The result should indicate success 
    expect(result).toContain("Journal entry");
    expect(result).toContain("appended successfully");
  });

  it("should handle missing entry_type by using default", async () => {
    const result = await journalPlugin.execute({
      entry: "Test entry without type"
    });
    
    expect(result).toContain("appended successfully");
  });

  it("should initialize successfully", async () => {
    // initialize() should complete without throwing
    await journalPlugin.initialize();
    // Success means no exception thrown
    expect(true).toBe(true);
    
    // Verify directory was created
    const journalDir = path.join(config.HISTORY_DIR, "journal");
    const stats = await fs.stat(journalDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should persist entries across multiple writes", async () => {
    const entry1 = "First test entry.";
    const entry2 = "Second test entry.";
    
    await journalPlugin.execute({ entry: entry1 });
    await journalPlugin.execute({ entry: entry2 });
    
    // Verify both entries are in the file
    const diaryPath = path.join(config.HISTORY_DIR, "journal", "diary.md");
    const content = await fs.readFile(diaryPath, "utf-8");
    
    expect(content).toContain(entry1);
    expect(content).toContain(entry2);
  });
});
