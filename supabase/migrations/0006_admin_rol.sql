-- =============================================================================
-- [DB-Agent] Porra Mundial 2026 — Rol de administrador y permisos de gestión
-- =============================================================================
-- Formaliza la columna `rol` en perfiles, un helper `es_admin()` y la política
-- RLS que permite a los administradores cargar resultados en `partidos`.
--
-- Mantiene la filosofía del proyecto: la seguridad vive en la base de datos
-- (RLS), no en una service_role expuesta. El Server Action re-verifica el rol
-- como segunda capa (defensa en profundidad).
--
-- Idempotente: add column if not exists / create or replace / drop policy if
-- exists. Re-ejecutable sin efectos colaterales.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Columna `rol`. CHECK para restringir a los dos valores válidos.
-- -----------------------------------------------------------------------------
alter table public.perfiles
  add column if not exists rol text not null default 'user';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'perfiles_rol_valido'
  ) then
    alter table public.perfiles
      add constraint perfiles_rol_valido check (rol in ('user', 'admin'));
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 2) Helper `es_admin()`: ¿el usuario actual es administrador?
--    security definer + stable para evaluarse de forma segura y eficiente
--    dentro de las políticas RLS sin recursión sobre perfiles.
-- -----------------------------------------------------------------------------
create or replace function public.es_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfiles
    where id = auth.uid()
      and rol = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- 3) Política RLS: sólo los administradores pueden ACTUALIZAR partidos
--    (cargar goles reales, clasificado y marcar procesado). El resto de
--    escrituras siguen bloqueadas (no hay políticas de insert/delete).
-- -----------------------------------------------------------------------------
drop policy if exists "partidos_update_admin" on public.partidos;

create policy "partidos_update_admin"
  on public.partidos
  for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());
