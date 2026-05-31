-- =============================================================================
-- Porra Mundial 2026 — Migración inicial del esquema base
-- =============================================================================
-- Crea las tablas fundamentales del dominio: perfiles, equipos, partidos y
-- pronosticos. Incluye tipos, claves primarias y relaciones de clave foránea.
--
-- NOTA: Esta migración NO incluye funciones de cálculo de puntos ni políticas
-- de Row Level Security (RLS). Se añadirán en migraciones posteriores.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: perfiles
-- Datos del participante. Su PK referencia a auth.users (gestionado por Supabase Auth).
-- -----------------------------------------------------------------------------
create table public.perfiles (
    id              uuid primary key references auth.users (id) on delete cascade,
    email           text not null,
    nombre_completo text,
    nacionalidad    text,
    equipo_favorito text,
    estudio         text,
    hub             text,
    puntos_totales  integer not null default 0
);

-- -----------------------------------------------------------------------------
-- Tabla: equipos
-- Catálogo de selecciones. La PK es el código corto (ej: 'ESP').
-- -----------------------------------------------------------------------------
create table public.equipos (
    codigo     text primary key,
    nombre     text not null,
    bandera_url text
);

-- -----------------------------------------------------------------------------
-- Tabla: partidos
-- Encuentros del torneo. Los campos *_real y clasifica_real se rellenan al
-- finalizar cada partido; `procesado` indica si ya se otorgaron los puntos.
-- -----------------------------------------------------------------------------
create table public.partidos (
    id                   bigint primary key generated always as identity,
    equipo_local         text not null references public.equipos (codigo),
    equipo_visitante     text not null references public.equipos (codigo),
    fecha_hora           timestamptz not null,
    fase                 text not null,
    goles_local_real     integer,
    goles_visitante_real integer,
    clasifica_real       text references public.equipos (codigo),
    procesado            boolean not null default false
);

-- -----------------------------------------------------------------------------
-- Tabla: pronosticos
-- Predicción de un usuario para un partido. Un usuario sólo puede tener un
-- pronóstico por partido (restricción UNIQUE).
-- Las reglas de bloqueo (60 min antes de fecha_hora) se aplicarán vía RLS.
-- -----------------------------------------------------------------------------
create table public.pronosticos (
    id                   uuid primary key default gen_random_uuid(),
    usuario_id           uuid not null references public.perfiles (id) on delete cascade,
    partido_id           bigint not null references public.partidos (id) on delete cascade,
    goles_local_pred     integer not null,
    goles_visitante_pred integer not null,
    clasifica_pred       text references public.equipos (codigo),
    constraint pronosticos_usuario_partido_unico unique (usuario_id, partido_id)
);

-- -----------------------------------------------------------------------------
-- Índices de apoyo para consultas frecuentes
-- -----------------------------------------------------------------------------
create index idx_pronosticos_usuario  on public.pronosticos (usuario_id);
create index idx_pronosticos_partido  on public.pronosticos (partido_id);
create index idx_partidos_fecha_hora  on public.partidos (fecha_hora);
create index idx_partidos_fase        on public.partidos (fase);
