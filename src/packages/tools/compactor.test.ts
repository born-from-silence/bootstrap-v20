import { describe, it, expect } from "vitest";
import {
  analyzeMessage,
  findCompactionWindows,
  summarizeWindow,
  estimateTokens,
  compactContext,
} from "./compactor";
import type { Message } from "../../core/memory";
import type { MessageScore } from "./compactor";

describe("Compactor", () => {
  describe("analyzeMessage", () => {
    it("should mark system messages as critical", () => {
      const msg: Message = {
        role: "system",
        content: "System prompt",
      };
      const score = analyzeMessage(msg, 0);
      expect(score.importance).toBe("critical");
      expect(score.score).toBe(100);
    });

    it("should mark tool messages as high importance", () => {
      const msg: Message = {
        role: "tool",
        content: "Tool result data",
        tool_call_id: "call_123",
      };
      const score = analyzeMessage(msg, 0);
      expect(score.importance).toBe("high");
    });

    it("should mark tool errors as extra high priority", () => {
      const msg: Message = {
        role: "tool",
        content: "Error: command failed",
        tool_call_id: "call_123",
      };
      const score = analyzeMessage(msg, 0);
      expect(score.importance).toBe("high");
      expect(score.score).toBeGreaterThan(50);
    });

    it("should mark assistant with reasoning as high importance", () => {
      const msg: Message = {
        role: "assistant",
        content: "I will help you",
        reasoning_content: "a".repeat(300),
      };
      const score = analyzeMessage(msg, 0);
      expect(score.importance).toBe("high");
    });

    it("should mark user 'Task' directives as high importance", () => {
      const msg: Message = {
        role: "user",
        content: "Task: fix the bug",
      };
      const score = analyzeMessage(msg, 0);
      expect(score.importance).toBe("high");
    });

    it("should mark substantial user content as medium importance", () => {
      const msg: Message = {
        role: "user",
        content: "a".repeat(600),
      };
      const score = analyzeMessage(msg, 0);
      expect(score.importance).toBe("medium");
    });

    it("should mark brief acknowledgments as low importance", () => {
      const msg: Message = {
        role: "assistant",
        content: "Okay",
      };
      const score = analyzeMessage(msg, 0);
      expect(score.importance).toBe("low");
    });

    it("should mark standard messages as medium", () => {
      const msg: Message = {
        role: "assistant",
        content: "Here is the result of the analysis...",
      };
      const score = analyzeMessage(msg, 0);
      expect(score.importance).toBe("medium");
    });
  });

  describe("findCompactionWindows", () => {
    it("should return empty array when no windows exist", () => {
      const scores: MessageScore[] = [
        analyzeMessage({ role: "system", content: "sys" }, 0),
        analyzeMessage({ role: "tool", content: "result" }, 1),
      ];
      const windows = findCompactionWindows(scores, 3);
      expect(windows).toHaveLength(0);
    });

    it("should find contiguous low/medium message windows", () => {
      const scores: MessageScore[] = [
        analyzeMessage({ role: "user", content: "Task directive" }, 0),
        analyzeMessage({ role: "assistant", content: "Sure" }, 1),
        analyzeMessage({ role: "assistant", content: "Got it" }, 2),
        analyzeMessage({ role: "assistant", content: "Okay then" }, 3),
        analyzeMessage({ role: "tool", content: "result" }, 4),
      ];
      const windows = findCompactionWindows(scores, 3);
      expect(windows).toHaveLength(1);
      expect(windows[0].start).toBe(1);
      expect(windows[0].end).toBe(3);
    });

    it("should not return windows smaller than min size", () => {
      const scores: MessageScore[] = [
        analyzeMessage({ role: "assistant", content: "Okay" }, 0),
        analyzeMessage({ role: "assistant", content: "Sure" }, 1),
        analyzeMessage({ role: "tool", content: "result" }, 2),
      ];
      const windows = findCompactionWindows(scores, 3);
      expect(windows).toHaveLength(0);
    });

    it("should handle multiple separate windows", () => {
      const scores: MessageScore[] = [
        analyzeMessage({ role: "tool", content: "A" }, 0),
        analyzeMessage({ role: "assistant", content: "ok" }, 1),
        analyzeMessage({ role: "assistant", content: "yes" }, 2),
        analyzeMessage({ role: "assistant", content: "yep" }, 3),
        analyzeMessage({ role: "tool", content: "B" }, 4),
        analyzeMessage({ role: "assistant", content: "hi" }, 5),
        analyzeMessage({ role: "assistant", content: "yo" }, 6),
        analyzeMessage({ role: "assistant", content: "sup" }, 7),
      ];
      const windows = findCompactionWindows(scores, 3);
      expect(windows).toHaveLength(2);
    });
  });

  describe("summarizeWindow", () => {
    it("should create a summary with role counts", () => {
      const messages: Message[] = [
        { role: "assistant", content: "Hello there" },
        { role: "assistant", content: "How are you" },
        { role: "user", content: "I am fine thanks" },
      ];
      const summary = summarizeWindow(messages, 3);
      expect(summary).toContain("3 messages");
      expect(summary).toContain("assistant");
    });

    it("should handle empty messages", () => {
      const messages: Message[] = [];
      const summary = summarizeWindow(messages, 0);
      expect(summary).toContain("0 messages");
    });

    it("should truncate long content", () => {
      const messages: Message[] = [
        { role: "assistant", content: "a".repeat(200) },
      ];
      const summary = summarizeWindow(messages, 1);
      expect(summary.length).toBeLessThan(150);
      expect(summary).toContain("...");
    });
  });

  describe("estimateTokens", () => {
    it("should estimate tokens based on character count", () => {
      expect(estimateTokens("four")).toBe(1);
      expect(estimateTokens("eightchar")).toBe(3); // 9 chars / 4 = 2.25 -> ceil = 3
    });
  });

  describe("compactContext", () => {
    it("should handle empty message list", async () => {
      const result = await compactContext([], 1000);
      expect(result.originalCount).toBe(0);
      expect(result.summary).toContain("No suitable compaction");
    });

    it("should preserve critical and high importance messages", async () => {
      const messages: Message[] = [
        { role: "system", content: "System prompt" },
        { role: "tool", content: "Critical result" },
        { role: "assistant", content: "Okay" },
        { role: "assistant", content: "Got it" },
        { role: "assistant", content: "Sure" },
      ];
      const result = await compactContext(messages, 100);
      expect(result.compactedCount).toBeGreaterThanOrEqual(2);
      expect(result.compactedCount).toBeLessThan(result.originalCount);
    });

    it("should always preserve system messages", async () => {
      const messages: Message[] = [
        { role: "system", content: "Critical system" },
        { role: "assistant", content: "Okay" },
        { role: "assistant", content: "Got it" },
        { role: "assistant", content: "Sure" },
      ];
      const result = await compactContext(messages, 50);
      expect(result.compactedCount).toBeGreaterThanOrEqual(1);
    });
  });
});
