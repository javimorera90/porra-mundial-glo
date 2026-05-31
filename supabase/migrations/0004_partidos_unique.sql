-- =============================================================================
-- Porra Mundial 2026 — Restricción UNIQUE en partidos
-- =============================================================================
-- Garantiza que no se dupliquen partidos con la misma combinación de
-- (equipo_local, equipo_visitante, fase). Hace idempotente el seed y las
-- futuras cargas mediante ON CONFLICT.
-- =============================================================================

alter table public.partidos
  add constraint partidos_local_visitante_fase_unico
  unique (equipo_local, equipo_visitante, fase);
