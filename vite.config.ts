import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias:
      mode === "diagnostics"
        ? [{ find: "react-dom/client", replacement: "react-dom/profiling" }]
        : [],
  },
  build: {
    manifest: true,
  },
  plugins: [react()],
}));
