-- =============================================================================
-- [DB-Agent] Porra Mundial 2026 — Bloqueo de alias de correo (signo +)
-- =============================================================================
-- Impide cuentas duplicadas vía alias (p. ej. pepe+test@gmail.com).
-- Defensa en dos capas:
--   1) Trigger BEFORE en auth.users (registro / cambio de email en Auth).
--   2) CHECK en public.perfiles (coherencia del perfil y updates vía API).
-- =============================================================================

create or replace function public.reject_email_with_plus()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if position('+' in split_part(new.email, '@', 1)) > 0 then
    raise exception 'Los correos con alias (+) no están permitidos'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists reject_email_alias on auth.users;

create trigger reject_email_alias
  before insert or update of email on auth.users
  for each row
  execute function public.reject_email_with_plus();

do $$
begin
  if not exists (
    select 1
    from   pg_constraint
    where  conname = 'perfiles_email_sin_alias'
      and  conrelid = 'public.perfiles'::regclass
  ) then
    alter table public.perfiles
      add constraint perfiles_email_sin_alias
        check (position('+' in split_part(email, '@', 1)) = 0);
  end if;
end $$;
