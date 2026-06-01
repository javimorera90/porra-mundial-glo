-- [DB-Agent] Limpia los campos corporativos del perfil admin y añade restricción
-- de integridad: un perfil con rol 'admin' no puede tener sede, departamento
-- ni nacionalidad. De este modo nunca aparecerá en los filtros del Leaderboard.

-- 1. Borrar los valores existentes en el perfil admin
UPDATE perfiles
SET hub = NULL, estudio = NULL, nacionalidad = NULL
WHERE rol = 'admin';

-- 2. Restricción declarativa: admin ⇒ campos corporativos nulos
ALTER TABLE perfiles
  ADD CONSTRAINT chk_admin_no_corporate_fields
  CHECK (
    rol <> 'admin'
    OR (hub IS NULL AND estudio IS NULL AND nacionalidad IS NULL)
  );
