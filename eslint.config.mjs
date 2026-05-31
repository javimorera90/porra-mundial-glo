import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Código generado por shadcn/ui (vendored). Lo tipamos (tsc) pero no lo
    // linteamos: son primitivas de terceros, no código propio del proyecto.
    "src/components/ui/**",
    "src/hooks/**",
  ]),
]);

export default eslintConfig;
