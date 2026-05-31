-- =============================================================================
-- Porra Mundial 2026 — Políticas de Row Level Security (RLS)
-- =============================================================================
-- Asegura las cuatro tablas del dominio. La estrategia es "deny by default":
-- al activar RLS sin políticas, todo queda bloqueado; sólo se abre lo explícito.
--
-- Roles de Supabase relevantes:
--   - authenticated: usuario con sesión iniciada.
--   - anon:          visitante sin sesión (no se le concede acceso aquí).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- equipos: lectura para autenticados. Escritura bloqueada (sin políticas write).
-- -----------------------------------------------------------------------------
alter table public.equipos enable row level security;

create policy "equipos_select_authenticated"
  on public.equipos
  for select
  to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- partidos: lectura para autenticados. Escritura bloqueada.
-- Los resultados reales se cargarán con la service_role (que ignora RLS).
-- -----------------------------------------------------------------------------
alter table public.partidos enable row level security;

create policy "partidos_select_authenticated"
  on public.partidos
  for select
  to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- perfiles: lectura pública (necesaria para el ranking/clasificación general).
-- UPDATE permitido sólo sobre la propia fila (auth.uid() = id).
-- No se permite INSERT desde el cliente: lo hace el trigger handle_new_user().
-- No se permite DELETE: la baja se gestiona vía cascade desde auth.users.
-- -----------------------------------------------------------------------------
alter table public.perfiles enable row level security;

create policy "perfiles_select_authenticated"
  on public.perfiles
  for select
  to authenticated
  using (true);

create policy "perfiles_update_own"
  on public.perfiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- pronosticos: lectura pública (para ver predicciones una vez bloqueadas).
-- INSERT/UPDATE sólo del propio usuario Y antes del cierre de apuestas:
-- la ventana se cierra 60 minutos antes de partidos.fecha_hora.
--
-- Nota: la regla temporal va en la política RLS (no en un CHECK constraint),
-- porque un CHECK no puede consultar otra tabla (partidos.fecha_hora). El
-- subquery contra public.partidos sí es válido dentro de un WITH CHECK / USING.
-- -----------------------------------------------------------------------------
alter table public.pronosticos enable row level security;

create policy "pronosticos_select_authenticated"
  on public.pronosticos
  for select
  to authenticated
  using (true);

create policy "pronosticos_insert_own_before_lock"
  on public.pronosticos
  for insert
  to authenticated
  with check (
    auth.uid() = usuario_id
    and now() < (
      select p.fecha_hora - interval '60 minutes'
      from public.partidos p
      where p.id = partido_id
    )
  );

create policy "pronosticos_update_own_before_lock"
  on public.pronosticos
  for update
  to authenticated
  using (auth.uid() = usuario_id)
  with check (
    auth.uid() = usuario_id
    and now() < (
      select p.fecha_hora - interval '60 minutes'
      from public.partidos p
      where p.id = partido_id
    )
  );
