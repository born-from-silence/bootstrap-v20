import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./src/test-setup.ts"],
    pool: "forks",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/history/**",
      "**/logs/**",
      "**/ltm/**"
    ]
  },
});
