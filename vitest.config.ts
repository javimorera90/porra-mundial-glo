import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Resolución del alias "@/..." (idéntico a tsconfig.json -> paths) sin depender
// de plugins extra, para que los tests importen "@/lib/scoring" igual que la app.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // Reporte legible directamente en la terminal de Windows.
      reporter: ['text', 'text-summary'],
      // La cobertura > 90% exigida aplica a la LÓGICA DE NEGOCIO (scoring).
      include: ['src/lib/scoring.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
})
