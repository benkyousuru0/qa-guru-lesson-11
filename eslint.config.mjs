import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2021,
      sourceType: "module"
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "no-unused-vars": ["warn"],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-console": "off",
      "no-debugger": "error",
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }]
    }
  }
]);
