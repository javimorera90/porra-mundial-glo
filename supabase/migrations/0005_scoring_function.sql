-- =============================================================================
-- Porra Mundial 2026 — Motor de puntuación (función + trigger)
-- =============================================================================
-- Replica EXACTAMENTE la lógica de src/lib/scoring.ts (los 8 casos del
-- blueprint, con la penalización de -1 por errar el clasificado en
-- eliminatorias). Esta es la fuente de verdad de perfiles.puntos_totales.
--
-- ===========================================================================
-- ⚠️  LÓGICA DUPLICADA — MANTENER EN PARIDAD
-- La función `calcular_puntos_pronostico` (más abajo) refleja el helper de
-- TypeScript en src/lib/scoring.ts (usado para mostrar puntos en la UI).
-- Si cambias una regla de negocio (puntos/penalización), DEBES actualizar
-- AMBOS archivos a la par o la UI mostrará puntos distintos a los reales.
-- ===========================================================================
--
-- Idempotente: add column if not exists / create or replace / drop trigger if
-- exists. Se puede re-ejecutar sin efectos colaterales.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Campo donde se materializan los puntos de cada pronóstico.
-- -----------------------------------------------------------------------------
alter table public.pronosticos
  add column if not exists puntos_ganados integer not null default 0;

-- -----------------------------------------------------------------------------
-- 1) Función pura de cálculo de puntos de un pronóstico.
--
-- Parámetros (en orden): goles reales, goles predichos, clasificado real,
-- clasificado predicho. Devuelve un integer.
--
-- Casos (puntos totales):
--   1. Exacto sin empate ............................. 5
--   2. Ganador acertado (no exacto) .................. 3
--   3. Empate exacto + clasificado acertado .......... 6  (5 + 1)
--   4. Empate exacto + clasificado fallado ........... 4  (5 - 1)
--   5. Empate no exacto + clasificado acertado ....... 4  (3 + 1)
--   6. Empate no exacto + clasificado fallado ........ 2  (3 - 1)
--   7. Consolación (predijo ganador, fue empate y
--      acertó el clasificado en eliminatorias) ....... 1
--   8. Cualquier otro caso ........................... 0
--
-- El clasificado SÓLO puntúa/penaliza si el resultado real fue empate y existe
-- un clasificado real (eliminatorias con penaltis).
-- -----------------------------------------------------------------------------
create or replace function public.calcular_puntos_pronostico(
  p_goles_local_real      integer,
  p_goles_visitante_real  integer,
  p_goles_local_pred      integer,
  p_goles_visitante_pred  integer,
  p_clasifica_real        text,
  p_clasifica_pred        text
)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_real_empate         boolean;
  v_pred_empate         boolean;
  v_exacto              boolean;
  v_signo_ok            boolean;
  v_clasifica_relevante boolean;
  v_clasifica_ok        boolean;
  v_base                integer;
begin
  -- Sin resultado real cargado: no hay puntos que calcular.
  if p_goles_local_real is null or p_goles_visitante_real is null then
    return 0;
  end if;

  v_real_empate := p_goles_local_real = p_goles_visitante_real;
  v_pred_empate := p_goles_local_pred = p_goles_visitante_pred;
  v_exacto := p_goles_local_pred = p_goles_local_real
          and p_goles_visitante_pred = p_goles_visitante_real;
  v_signo_ok := sign(p_goles_local_pred - p_goles_visitante_pred)
              = sign(p_goles_local_real - p_goles_visitante_real);

  v_clasifica_relevante := v_real_empate and p_clasifica_real is not null;
  v_clasifica_ok := p_clasifica_pred is not null
                and p_clasifica_pred = p_clasifica_real;

  if v_real_empate then
    if v_pred_empate then
      -- Casos 3-6 (eliminatorias) / empate de grupos (sin clasificado).
      v_base := case when v_exacto then 5 else 3 end;
      if v_clasifica_relevante then
        v_base := v_base + case when v_clasifica_ok then 1 else -1 end;
      end if;
      return v_base;
    else
      -- Predijo ganador pero fue empate: sólo consolación (caso 7).
      return case when v_clasifica_relevante and v_clasifica_ok then 1 else 0 end;
    end if;
  end if;

  -- Resultado real con ganador (sin empate): el clasificado no puntúa.
  if v_exacto then
    return 5; -- caso 1
  end if;
  if v_signo_ok then
    return 3; -- caso 2
  end if;
  return 0;   -- caso 8
end;
$$;

-- -----------------------------------------------------------------------------
-- 1b) Función pura de DESCRIPCIÓN semántica de un pronóstico.
--
-- Devuelve el desglose textual (text[]) que se muestra en la UI, EN PARIDAD con
-- `calcularDesglose().lineas[].texto` de src/lib/scoring.ts. Existe para que el
-- motor PL/pgSQL y TypeScript no puedan divergir en el texto de los conceptos.
--
-- Concepto clave: un empate ACERTADO con marcador distinto (p.ej. predijo 2-2 y
-- el partido fue 0-0) es su PROPIO concepto "Empate correcto (+3)". En un empate
-- NO hay ganador, así que jamás se etiqueta como "Ganador correcto".
-- -----------------------------------------------------------------------------
create or replace function public.describir_puntos_pronostico(
  p_goles_local_real      integer,
  p_goles_visitante_real  integer,
  p_goles_local_pred      integer,
  p_goles_visitante_pred  integer,
  p_clasifica_real        text,
  p_clasifica_pred        text
)
returns text[]
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_real_empate         boolean;
  v_pred_empate         boolean;
  v_exacto              boolean;
  v_signo_ok            boolean;
  v_clasifica_relevante boolean;
  v_clasifica_ok        boolean;
  v_lineas              text[] := array[]::text[];
begin
  -- Sin resultado real cargado: no hay desglose que mostrar.
  if p_goles_local_real is null or p_goles_visitante_real is null then
    return v_lineas;
  end if;

  v_real_empate := p_goles_local_real = p_goles_visitante_real;
  v_pred_empate := p_goles_local_pred = p_goles_visitante_pred;
  v_exacto := p_goles_local_pred = p_goles_local_real
          and p_goles_visitante_pred = p_goles_visitante_real;
  v_signo_ok := sign(p_goles_local_pred - p_goles_visitante_pred)
              = sign(p_goles_local_real - p_goles_visitante_real);

  v_clasifica_relevante := v_real_empate and p_clasifica_real is not null;
  v_clasifica_ok := p_clasifica_pred is not null
                and p_clasifica_pred = p_clasifica_real;

  if v_real_empate then
    if v_pred_empate then
      if v_exacto then
        v_lineas := array_append(v_lineas, 'Resultado exacto (+5)');
      else
        -- Empate acertado con marcador distinto: concepto propio, NO "ganador".
        v_lineas := array_append(v_lineas, 'Empate correcto (+3)');
      end if;
      if v_clasifica_relevante then
        v_lineas := array_append(
          v_lineas,
          case when v_clasifica_ok
               then 'Clasificado correcto (+1)'
               else 'Clasificado fallado (-1)' end
        );
      end if;
    elsif v_clasifica_relevante and v_clasifica_ok then
      -- Consolación: predijo ganador, fue empate, pero acertó el clasificado.
      v_lineas := array_append(v_lineas, 'Clasificado correcto (+1)');
    end if;
  elsif v_exacto then
    v_lineas := array_append(v_lineas, 'Resultado exacto (+5)');
  elsif v_signo_ok then
    v_lineas := array_append(v_lineas, 'Ganador correcto (+3)');
  end if;

  if array_length(v_lineas, 1) is null then
    v_lineas := array_append(v_lineas, 'Sin aciertos');
  end if;

  return v_lineas;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2) Función de trigger: al procesar un partido, recalcula los puntos de todos
--    sus pronósticos y actualiza puntos_totales de los usuarios afectados.
--
-- security definer: se ejecuta con privilegios del owner para poder escribir en
-- pronosticos/perfiles saltándose las políticas RLS (la carga de resultados la
-- hace un admin / service_role).
-- -----------------------------------------------------------------------------
create or replace function public.procesar_puntos_partido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 2.1) Materializar puntos_ganados de cada pronóstico de este partido.
  update public.pronosticos pr
  set puntos_ganados = public.calcular_puntos_pronostico(
    new.goles_local_real,
    new.goles_visitante_real,
    pr.goles_local_pred,
    pr.goles_visitante_pred,
    new.clasifica_real,
    pr.clasifica_pred
  )
  where pr.partido_id = new.id;

  -- 2.2) Recalcular puntos_totales SÓLO de los usuarios con pronóstico en este
  --      partido (suma de todos sus puntos_ganados). Optimizado: una única
  --      pasada acotada a los usuarios afectados.
  update public.perfiles p
  set puntos_totales = coalesce((
    select sum(pr.puntos_ganados)
    from public.pronosticos pr
    where pr.usuario_id = p.id
  ), 0)
  where p.id in (
    select pr.usuario_id
    from public.pronosticos pr
    where pr.partido_id = new.id
  );

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) Trigger: dispara tras marcar el partido como procesado con resultado real.
--    La condición WHEN evita ejecuciones en updates irrelevantes (p.ej. fecha).
--    Cubre tanto "procesado pasa a true" como "se corrigen los goles reales"
--    mientras el partido sigue procesado.
-- -----------------------------------------------------------------------------
drop trigger if exists after_partido_update on public.partidos;

create trigger after_partido_update
  after update on public.partidos
  for each row
  when (
    new.procesado is true
    and new.goles_local_real is not null
    and new.goles_visitante_real is not null
  )
  execute function public.procesar_puntos_partido();
