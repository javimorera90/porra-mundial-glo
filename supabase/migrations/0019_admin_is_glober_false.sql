-- =============================================================================
-- [DB-Agent] Admin: cohorte no-glober y visible en leaderboard
-- =============================================================================
-- El rol admin pertenece a is_glober = false (misma cohorte que pruebas / externos).
-- La app incluye admins en getLeaderboard filtrando por is_glober, no por rol.
-- =============================================================================

update public.perfiles
set is_glober = false
where rol = 'admin';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_admin_no_glober'
  ) then
    alter table public.perfiles
      add constraint chk_admin_no_glober
        check (rol <> 'admin' or is_glober = false);
  end if;
end $$;
