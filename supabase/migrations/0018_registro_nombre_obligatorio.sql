-- =============================================================================
-- [DB-Agent] Porra Mundial 2026 — Nombre obligatorio en el alta
-- =============================================================================

-- ¿Ya existe un perfil con este email? (para login sin pedir nombre otra vez)
create or replace function public.email_tiene_perfil(p_email text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfiles p
    where lower(p.email) = lower(trim(p_email))
  );
$$;

grant execute on function public.email_tiene_perfil(text) to anon, authenticated;

-- Perfil al registrarse: nombre obligatorio vía user_metadata (signInWithOtp data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text := nullif(trim(new.raw_user_meta_data ->> 'nombre_completo'), '');
begin
  if v_nombre is null or length(v_nombre) < 2 then
    raise exception 'El nombre es obligatorio al registrarse'
      using errcode = '23514';
  end if;

  insert into public.perfiles (id, email, nombre_completo, is_glober)
  values (
    new.id,
    new.email,
    v_nombre,
    lower(new.email) like '%@globant.com'
  );
  return new;
end;
$$;
