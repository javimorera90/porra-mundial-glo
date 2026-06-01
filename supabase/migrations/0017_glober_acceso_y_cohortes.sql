-- =============================================================================
-- [DB-Agent] Porra Mundial 2026 — Acceso @globant.com, excepciones y cohortes
-- =============================================================================
-- 1) Columna is_glober en perfiles (true solo para @globant.com).
-- 2) Tabla emails_acceso_excepcion para cuentas de prueba autorizadas.
-- 3) Función email_acceso_permitido + trigger en auth.users.
-- 4) RLS de perfiles: cada usuario ve su cohorte (mismo is_glober).
--
-- Gestión de excepciones (ejemplo):
--   INSERT INTO public.emails_acceso_excepcion (email) VALUES ('test@test.com');
--
-- Única superficie anon: EXECUTE sobre email_acceso_permitido (validación pre-login).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) is_glober en perfiles
-- -----------------------------------------------------------------------------
alter table public.perfiles
  add column if not exists is_glober boolean not null default false;

update public.perfiles
set is_glober = lower(email) like '%@globant.com'
where is_glober is distinct from (lower(email) like '%@globant.com');

-- -----------------------------------------------------------------------------
-- 2) Tabla de emails permitidos fuera de @globant.com
-- -----------------------------------------------------------------------------
create table if not exists public.emails_acceso_excepcion (
  email text primary key,
  constraint emails_acceso_excepcion_lowercase check (email = lower(email))
);

alter table public.emails_acceso_excepcion enable row level security;

-- Sin políticas: solo funciones SECURITY DEFINER acceden a la tabla.

-- -----------------------------------------------------------------------------
-- 3) ¿El correo puede registrarse / iniciar sesión?
-- -----------------------------------------------------------------------------
create or replace function public.email_acceso_permitido(p_email text)
returns boolean
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email is null or v_email = '' then
    return false;
  end if;

  if position('+' in split_part(v_email, '@', 1)) > 0 then
    return false;
  end if;

  if v_email like '%@globant.com' then
    return true;
  end if;

  return exists (
    select 1
    from public.emails_acceso_excepcion e
    where e.email = v_email
  );
end;
$$;

grant execute on function public.email_acceso_permitido(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4) Trigger BEFORE en auth.users: rechazar correos no permitidos
-- -----------------------------------------------------------------------------
create or replace function public.enforce_email_acceso_permitido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.email_acceso_permitido(new.email) then
    raise exception 'Solo se permiten correos @globant.com o cuentas autorizadas para pruebas'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_email_acceso on auth.users;

create trigger enforce_email_acceso
  before insert or update of email on auth.users
  for each row
  execute function public.enforce_email_acceso_permitido();

-- -----------------------------------------------------------------------------
-- 5) Perfil automático al registrarse (incluye is_glober)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, email, nombre_completo, is_glober)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nombre_completo'), ''),
      'Participante sin nombre'
    ),
    lower(new.email) like '%@globant.com'
  );
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 6) Helper RLS: cohorte del usuario actual
-- -----------------------------------------------------------------------------
create or replace function public.mi_es_glober()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select p.is_glober from public.perfiles p where p.id = auth.uid()),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- 7) RLS perfiles: propia fila, admin, o misma cohorte is_glober
-- -----------------------------------------------------------------------------
drop policy if exists "perfiles_select_authenticated" on public.perfiles;

create policy "perfiles_select_authenticated"
  on public.perfiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.es_admin()
    or is_glober = public.mi_es_glober()
  );
