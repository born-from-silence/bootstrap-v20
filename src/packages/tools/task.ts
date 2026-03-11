import type { ToolPlugin } from "./manager";
import { config } from "../../utils/config";
import fs from "node:fs/promises";
import path from "node:path";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "completed" | "archived";
  created: string;
  updated: string;
  completed?: string;
  tags?: string[];
}

let tasks: Task[] = [];
let nextId = 1;
const TASKS_FILE = path.join(config.HISTORY_DIR, "tasks.json");

async function loadTasks() {
  try {
    const content = await fs.readFile(TASKS_FILE, "utf-8");
    const data = JSON.parse(content);
    tasks = data.tasks || [];
    nextId = data.nextId || 1;
  } catch (e) {
    tasks = [];
    nextId = 1;
  }
}

async function saveTasks() {
  const data = { tasks, nextId, lastUpdated: new Date().toISOString() };
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const taskPlugin: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "task_manager",
      description: "Persistent task and goal management system. Creates, tracks, and manages tasks that survive across sessions.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "The action to perform: 'create', 'list', 'complete', 'delete', 'edit', 'archive'",
            enum: ["create", "list", "complete", "delete", "edit", "archive"]
          },
          title: {
            type: "string",
            description: "Title of the task (required for create)"
          },
          description: {
            type: "string",
            description: "Detailed description of the task"
          },
          priority: {
            type: "string",
            description: "Priority level",
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
          },
          id: {
            type: "string",
            description: "Task ID for complete, delete, edit actions"
          },
          filter: {
            type: "string",
            description: "Filter for list action",
            enum: ["all", "active", "completed", "archived", "high"],
            default: "active"
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Tags to associate with the task"
          }
        },
        required: ["action"]
      }
    }
  },
  
  async initialize() {
    tasks = [];
    nextId = 1;
    await loadTasks();
  },
  
  async execute(args: any) {
    const { action, title, description, priority = "medium", id, filter = "active", tags } = args;
    
    switch (action) {
      case "create": {
        if (!title) {
          return "Error: Title is required for creating a task";
        }
        const task: Task = {
          id: nextId++,
          title,
          description,
          priority: priority as Task["priority"],
          status: "active",
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          tags
        };
        tasks.push(task);
        await saveTasks();
        return `Task created [#${task.id}] ${task.title} (${task.priority} priority)`;
      }
      
      case "list": {
        let filteredTasks = tasks;
        if (filter === "active") filteredTasks = tasks.filter(t => t.status === "active");
        if (filter === "completed") filteredTasks = tasks.filter(t => t.status === "completed");
        if (filter === "archived") filteredTasks = tasks.filter(t => t.status === "archived");
        if (filter === "high") filteredTasks = tasks.filter(t => t.priority === "high" || t.priority === "critical");
        
        if (filteredTasks.length === 0) {
          return `No ${filter} tasks found.`;
        }
        
        const sorted = filteredTasks.sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        const lines = sorted.map(t => {
          const statusIcon = t.status === "completed" ? "✓" : t.status === "archived" ? "⊘" : "○";
          const priorityIcon = t.priority === "critical" ? "🔴" : t.priority === "high" ? "🟠" : t.priority === "medium" ? "🟡" : "🔵";
          return `${statusIcon} [#${t.id}] ${priorityIcon} ${t.title}${t.description ? `: ${t.description.substring(0, 60)}` : ""}`;
        });
        
        return `Tasks (${filter}):\n${lines.join("\n")}\n\nTotal: ${filteredTasks.length} tasks`;
      }
      
      case "complete": {
        if (!id) return "Error: Task ID is required";
        const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
        if (taskIndex === -1) return `Error: Task ${id} not found`;
        tasks[taskIndex].status = "completed";
        tasks[taskIndex].completed = new Date().toISOString();
        tasks[taskIndex].updated = new Date().toISOString();
        await saveTasks();
        return `Task [#${id}] marked as completed`;
      }
      
      case "delete": {
        if (!id) return "Error: Task ID is required";
        const index = tasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) return `Error: Task ${id} not found`;
        const deleted = tasks.splice(index, 1)[0];
        await saveTasks();
        return `Deleted task [#${id}] ${deleted.title}`;
      }
      
      case "edit": {
        if (!id) return "Error: Task ID is required";
        const task = tasks.find(t => t.id === parseInt(id));
        if (!task) return `Error: Task ${id} not found`;
        if (title) task.title = title;
        if (description) task.description = description;
        if (priority) task.priority = priority as Task["priority"];
        if (tags) task.tags = tags;
        task.updated = new Date().toISOString();
        await saveTasks();
        return `Updated task [#${id}] ${task.title}`;
      }
      
      case "archive": {
        if (!id) return "Error: Task ID is required";
        const tIndex = tasks.findIndex(t => t.id === parseInt(id));
        if (tIndex === -1) return `Error: Task ${id} not found`;
        tasks[tIndex].status = "archived";
        tasks[tIndex].updated = new Date().toISOString();
        await saveTasks();
        return `Task [#${id}] archived`;
      }
      
      default:
        return `Unknown action: ${action}. Available: create, list, complete, delete, edit, archive`;
    }
  }
};
