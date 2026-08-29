import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    projects: [
      {
        // Parser e servidor do painel: rodam em Node de verdade, tocando o disco.
        test: {
          name: "servidor",
          include: ["src/**/*.test.ts"],
          exclude: ["src/cli/**", "src/teste/**", "src/nucleo/**", "src/plugin/**", "src/harness/**", "src/update/**", "src/doctor/**"],
          environment: "node",
          testTimeout: 20000,
        },
      },
      {
        // CLI: escreve em disco de verdade, em pasta temporária, e chama o git.
        test: {
          name: "cli",
          include: [
            "src/cli/**/*.test.ts",
            "src/teste/**/*.test.ts",
            "src/nucleo/**/*.test.ts",
            "src/plugin/**/*.test.ts",
            "src/harness/**/*.test.ts",
            "src/update/**/*.test.ts",
            "src/doctor/**/*.test.ts",
          ],
          environment: "node",
          testTimeout: 30000,
        },
      },
      {
        // Telas: precisam de DOM.
        plugins: [react()],
        test: {
          name: "ui",
          include: ["ui/src/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          testTimeout: 20000,
        },
      },
    ],
  },
});
