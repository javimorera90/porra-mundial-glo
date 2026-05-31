-- =============================================================================
-- [DB-Agent] Porra Mundial 2026 — Blindaje de acceso corporativo @globant.com
-- =============================================================================
-- Endurece la tabla `perfiles` con dos restricciones de hierro:
--
--   1) UNIQUE en `email`  → impide perfiles duplicados para el mismo correo.
--   2) CHECK en `email`   → el motor de PostgreSQL rechaza nativamente cualquier
--      INSERT/UPDATE cuyo correo no termine en '@globant.com'. Esta es la
--      segunda línea de defensa (la primera es la Server Action en Next.js).
--
-- Idempotente: todas las operaciones usan `if not exists` / `DO $$...$$`
-- para poder re-ejecutarse sin errores.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Restricción UNIQUE: un email sólo puede pertenecer a un único perfil.
--    Se salta si el constraint ya existe (robustez frente a re-ejecuciones).
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from   pg_constraint
    where  conname = 'perfiles_email_unico'
      and  conrelid = 'public.perfiles'::regclass
  ) then
    alter table public.perfiles
      add constraint perfiles_email_unico unique (email);
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 2) Restricción CHECK: sólo se permiten correos @globant.com.
--    Un INSERT/UPDATE con cualquier otro dominio generará un error 23514
--    (check_violation) que Supabase/PostgREST devuelve como HTTP 400.
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from   pg_constraint
    where  conname = 'perfiles_email_dominio_globant'
      and  conrelid = 'public.perfiles'::regclass
  ) then
    alter table public.perfiles
      add constraint perfiles_email_dominio_globant
        check (email like '%@globant.com');
  end if;
end $$;
