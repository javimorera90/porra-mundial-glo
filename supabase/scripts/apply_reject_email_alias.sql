-- =============================================================================
-- Bloqueo de alias de correo (signo +) en auth.users y public.perfiles.
-- Ejecutar en Supabase: SQL Editor → New query → pegar → Run.
-- Idempotente: puedes ejecutarlo varias veces sin romper nada.
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
