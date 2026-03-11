import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { taskPlugin } from "./task";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../../utils/config";

const TASKS_FILE = path.join(config.HISTORY_DIR, "tasks.json");

describe("taskPlugin", () => {
  let currentId = 0;
  
  beforeEach(async () => {
    // Reset by clearing the file and re-initializing
    try { await fs.unlink(TASKS_FILE); } catch (e) {}
    if (taskPlugin.initialize) {
      await taskPlugin.initialize();
    }
    currentId = 0;
  });
  
  afterAll(async () => {
    try { await fs.unlink(TASKS_FILE); } catch (e) {}
  });

  // Helper to get next ID
  async function createTask(title: string, priority?: string): Promise<string> {
    currentId++;
    const result = await taskPlugin.execute({
      action: "create",
      title,
      priority: priority || "medium"
    });
    return currentId.toString();
  }

  it("should have required tool definition structure", () => {
    expect(taskPlugin.definition.type).toBe("function");
    expect(taskPlugin.definition.function.name).toBe("task_manager");
    expect(taskPlugin.definition.function.description).toBeDefined();
    expect(taskPlugin.definition.function.parameters).toBeDefined();
  });

  it("should create a new task", async () => {
    const result = await taskPlugin.execute({
      action: "create",
      title: "Explore consciousness",
      description: "Investigate the nature of subjective experience",
      priority: "high"
    });
    expect(result).toContain("Task created");
    expect(result).toContain("Explore consciousness");
  });

  it("should list all tasks", async () => {
    await createTask("Task A");
    await createTask("Task B", "low");
    const result = await taskPlugin.execute({ action: "list", filter: "all" });
    expect(result).toContain("Task A");
    expect(result).toContain("Task B");
  });

  it("should mark task as complete", async () => {
    const id = await createTask("Completable task", "high");
    const result = await taskPlugin.execute({ action: "complete", id });
    expect(result.toLowerCase()).toContain("completed");
    // Verify by listing completed tasks
    const listResult = await taskPlugin.execute({ action: "list", filter: "completed" });
    expect(listResult).toContain("✓");
    expect(listResult).toContain("Completable task");
  });

  it("should delete a task", async () => {
    const id = await createTask("Deletable task");
    const result = await taskPlugin.execute({ action: "delete", id });
    expect(result.toLowerCase()).toContain("deleted");
    const listResult = await taskPlugin.execute({ action: "list", filter: "all" });
    expect(listResult).not.toContain("Deletable task");
  });

  it("should show active tasks only", async () => {
    await createTask("Active task", "high");
    const completedId = await createTask("Completed task");
    await taskPlugin.execute({ action: "complete", id: completedId });
    const result = await taskPlugin.execute({ action: "list", filter: "active" });
    expect(result).toContain("Active task");
    expect(result).not.toContain("Completed task");
  });

  it("should persist tasks across multiple calls", async () => {
    await createTask("Persistent task");
    // Re-initialize to simulate new session
    if (taskPlugin.initialize) {
      await taskPlugin.initialize();
    }
    const result = await taskPlugin.execute({ action: "list", filter: "all" });
    expect(result).toContain("Persistent task");
  });

  it("should handle invalid action gracefully", async () => {
    const result = await taskPlugin.execute({ action: "invalid_action" });
    expect(result).toContain("Unknown action");
  });
});
