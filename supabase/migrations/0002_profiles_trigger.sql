-- =============================================================================
-- Porra Mundial 2026 — Automatización de perfiles
-- =============================================================================
-- Crea una fila en `public.perfiles` automáticamente cada vez que se registra
-- un nuevo usuario en `auth.users`, copiando su id y email y usando un
-- placeholder para el nombre (editable luego por el propio usuario vía RLS).
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, email, nombre_completo)
  values (
    new.id,
    new.email,
    -- Si el cliente envió metadatos en el signup los usamos; si no, placeholder.
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nombre_completo'), ''),
      'Participante sin nombre'
    )
  );
  return new;
end;
$$;

-- El trigger se dispara DESPUÉS de insertar en auth.users.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
