-- =============================================================================
-- Añade resultado_cerrado a TODOS los partidos (existentes y futuros).
-- Ejecutar en Supabase: SQL Editor → New query → pegar → Run.
-- Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- =============================================================================

alter table public.partidos
  add column if not exists resultado_cerrado boolean not null default false;

comment on column public.partidos.resultado_cerrado is
  'Si true, el panel admin exige confirmación extra antes de modificar el marcador real.';

-- Las filas ya creadas reciben false por el DEFAULT al añadir la columna.
-- Este UPDATE cubre el caso raro de NULL si la columna existía sin NOT NULL.
update public.partidos
set resultado_cerrado = false
where resultado_cerrado is distinct from true
  and resultado_cerrado is not true;

-- Comprobación (debe devolver 0 filas con resultado_cerrado nulo)
-- select count(*) filter (where resultado_cerrado is null) as nulos from public.partidos;
