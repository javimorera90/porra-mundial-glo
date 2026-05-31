-- =============================================================================
-- Porra Mundial 2026 — Datos iniciales (seed)
-- =============================================================================
-- Carga de selecciones reales y partidos ficticios de Fase de Grupos con fechas
-- futuras (el torneo arranca el 11/06/2026). Ejecutar con service_role o
-- mediante `supabase db reset`, que ignora RLS.
--
-- Idempotente: usa ON CONFLICT para poder re-ejecutarse sin duplicar datos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Selecciones nacionales (banderas vía flagcdn.com).
-- -----------------------------------------------------------------------------
insert into public.equipos (codigo, nombre, bandera_url) values
  ('USA', 'Estados Unidos', 'https://flagcdn.com/us.svg'),
  ('MEX', 'México',         'https://flagcdn.com/mx.svg'),
  ('CAN', 'Canadá',         'https://flagcdn.com/ca.svg'),
  ('ESP', 'España',         'https://flagcdn.com/es.svg'),
  ('ARG', 'Argentina',      'https://flagcdn.com/ar.svg'),
  ('BRA', 'Brasil',         'https://flagcdn.com/br.svg')
on conflict (codigo) do update
  set nombre      = excluded.nombre,
      bandera_url = excluded.bandera_url;

-- -----------------------------------------------------------------------------
-- Partidos ficticios de Fase de Grupos con fechas futuras (UTC).
-- El id es `generated always as identity`, por eso no se especifica.
-- Idempotente gracias a la restricción UNIQUE (equipo_local, equipo_visitante,
-- fase): re-ejecutar sólo actualiza la fecha_hora, no duplica.
-- -----------------------------------------------------------------------------
insert into public.partidos (equipo_local, equipo_visitante, fecha_hora, fase) values
  ('MEX', 'CAN', timestamptz '2026-06-11 19:00:00+00', 'Grupos'),
  ('USA', 'ESP', timestamptz '2026-06-12 22:00:00+00', 'Grupos'),
  ('ARG', 'BRA', timestamptz '2026-06-13 21:00:00+00', 'Grupos')
on conflict (equipo_local, equipo_visitante, fase) do update
  set fecha_hora = excluded.fecha_hora;
