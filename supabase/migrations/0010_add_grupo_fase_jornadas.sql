-- =============================================================================
-- Migración 0010: columna `grupo` en partidos + refactor de fases de grupos
-- =============================================================================
-- Añade la columna `grupo` (letra del grupo: A–L) a la tabla `partidos`
-- y actualiza los valores existentes de `fase` de 'Grupos' a 'GruposJ1'.
--
-- Las nuevas fases posibles para la fase de grupos son:
--   'GruposJ1', 'GruposJ2', 'GruposJ3'
-- =============================================================================

-- 1. Añadir la columna grupo (nullable para permitir partidos eliminatorios)
alter table public.partidos
  add column if not exists grupo text;

-- 2. Renombrar los partidos de fase de grupos existentes a 'GruposJ1'
--    (los que se habían insertado con fase = 'Grupos')
update public.partidos
  set fase = 'GruposJ1'
  where fase = 'Grupos';

-- 3. Actualizar el índice si existía para la columna fase (se recrea automáticamente)
-- El índice idx_partidos_fase de la migración inicial sigue siendo válido.

-- 4. Índice adicional para consultas por grupo
create index if not exists idx_partidos_grupo on public.partidos (grupo);
