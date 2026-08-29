import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "ui",
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true },
  // O servidor de desenvolvimento também fica em loopback: a decisão de
  // segurança vale nos dois ambientes, não só no build publicado.
  server: { host: "127.0.0.1", port: 4001 },
});
