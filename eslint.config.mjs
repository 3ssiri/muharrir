import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    // These React Compiler rules were introduced by eslint-config-next 16.
    // Keep the existing lint gate stable and adopt them incrementally through
    // tracked issues instead of turning a dependency patch into a broad refactor.
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "src-tauri/target/**",
    "next-env.d.ts",
  ]),
]);
