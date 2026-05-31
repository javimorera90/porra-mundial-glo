-- =============================================================================
-- [DB-Agent] Porra Mundial 2026 — Rollback temporal de restricción @globant.com
-- =============================================================================
-- Elimina el CHECK que forzaba el dominio corporativo para permitir pruebas
-- con cualquier proveedor de email. La restricción UNIQUE en `email` se mantiene
-- para evitar duplicados de cuenta.
--
-- Idempotente: `DROP CONSTRAINT IF EXISTS` es seguro si ya fue eliminado.
-- Para reactivar el blindaje, volver a aplicar 0008_restriccion_globant.sql.
-- =============================================================================

alter table public.perfiles
  drop constraint if exists perfiles_email_dominio_globant;
