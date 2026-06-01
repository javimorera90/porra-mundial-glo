-- =============================================================================
-- [DB-Agent] Fix: puntos_totales huérfanos tras borrado de pronosticos
-- =============================================================================
-- Problema: el trigger after_partido_update sólo se dispara en UPDATE de
-- partidos, por lo que si se borran filas de pronosticos (directamente, por
-- truncate en entornos de prueba o por cascade al borrar un partido),
-- perfiles.puntos_totales queda con valores huérfanos que no reflejan la
-- realidad.
--
-- Esta migración:
--   1) Recalcula TODOS los puntos_totales desde la fuente de verdad actual
--      (suma de pronosticos.puntos_ganados) para corregir el estado roto.
--   2) Añade un trigger AFTER DELETE ON pronosticos que mantiene la integridad
--      hacia adelante: cualquier borrado futuro recalcula automáticamente.
--
-- Idempotente: CREATE OR REPLACE + DROP TRIGGER IF EXISTS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Data fix: recalcular puntos_totales de todos los usuarios a partir de
--    los pronosticos que existen actualmente.
--    Usuarios sin pronosticos (o cuyos pronosticos aún no se han procesado)
--    quedan correctamente en 0.
-- -----------------------------------------------------------------------------
update public.perfiles p
set puntos_totales = coalesce((
  select sum(pr.puntos_ganados)
  from public.pronosticos pr
  where pr.usuario_id = p.id
), 0)
where p.rol = 'user';

-- -----------------------------------------------------------------------------
-- 2) Función de trigger: recalcula puntos_totales del usuario afectado
--    cada vez que se borra una fila de pronosticos.
-- -----------------------------------------------------------------------------
create or replace function public.recalcular_puntos_al_borrar_pronostico()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.perfiles
  set puntos_totales = coalesce((
    select sum(puntos_ganados)
    from public.pronosticos
    where usuario_id = old.usuario_id
  ), 0)
  where id = old.usuario_id;

  return old;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) Trigger AFTER DELETE en pronosticos.
--    FOR EACH ROW garantiza que se recalcule por cada pronóstico eliminado,
--    cubriendo tanto borrados individuales como los ON DELETE CASCADE que
--    propaga el FK desde partidos.
-- -----------------------------------------------------------------------------
drop trigger if exists after_pronostico_delete on public.pronosticos;

create trigger after_pronostico_delete
  after delete on public.pronosticos
  for each row
  execute function public.recalcular_puntos_al_borrar_pronostico();
