-- =============================================================================
-- [DB-Agent] Porra Mundial 2026 — Metadata de perfil corporativo
-- =============================================================================
-- Garantiza la existencia de las columnas de datos corporativos en `perfiles`:
--   hub          → Sede del empleado (Madrid, Barcelona, Valencia, Remote)
--   estudio      → Departamento técnico (Backend, Frontend, etc.)
--   nacionalidad → País de origen del empleado
--
-- Las columnas ya están declaradas en el esquema base (0001_initial_schema.sql).
-- Esta migración actúa como contrato explícito del dominio corporativo y es
-- idempotente: `add column if not exists` la hace re-ejecutable sin efectos.
--
-- No requiere nuevas políticas RLS: la política `perfiles_update_own` de
-- 0003_rls_policies.sql ya permite a cada usuario autenticado actualizar
-- únicamente su propia fila (auth.uid() = id). Cero acceso al rol `anon`.
-- =============================================================================

alter table public.perfiles
  add column if not exists hub text;

alter table public.perfiles
  add column if not exists estudio text;

alter table public.perfiles
  add column if not exists nacionalidad text;
