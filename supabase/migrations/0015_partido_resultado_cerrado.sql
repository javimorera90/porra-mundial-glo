-- Marca administrativa: el resultado ya no debe editarse sin confirmación explícita.
-- También disponible para ejecutar a mano: supabase/scripts/apply_resultado_cerrado.sql
alter table public.partidos
  add column if not exists resultado_cerrado boolean not null default false;

comment on column public.partidos.resultado_cerrado is
  'Si true, el panel admin exige confirmación extra antes de modificar el marcador real.';

update public.partidos
set resultado_cerrado = false
where resultado_cerrado is distinct from true
  and resultado_cerrado is not true;
