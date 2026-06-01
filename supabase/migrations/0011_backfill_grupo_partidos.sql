-- =============================================================================
-- Migración 0011: backfill de la columna `grupo` en partidos existentes
-- =============================================================================
-- Asigna el grupo (A–L) a cada partido según los equipos participantes.
-- Usa la composición oficial de grupos del FIFA World Cup 2026.
-- Es idempotente: se puede ejecutar varias veces sin efectos secundarios.
-- =============================================================================

update public.partidos set grupo = 'A'
  where equipo_local  in ('MEX','RSA','KOR','CZE')
     or equipo_visitante in ('MEX','RSA','KOR','CZE');

update public.partidos set grupo = 'B'
  where equipo_local  in ('CAN','BIH','QAT','SUI')
     or equipo_visitante in ('CAN','BIH','QAT','SUI');

update public.partidos set grupo = 'C'
  where equipo_local  in ('BRA','MAR','HAI','SCO')
     or equipo_visitante in ('BRA','MAR','HAI','SCO');

update public.partidos set grupo = 'D'
  where equipo_local  in ('USA','PAR','AUS','TUR')
     or equipo_visitante in ('USA','PAR','AUS','TUR');

update public.partidos set grupo = 'E'
  where equipo_local  in ('GER','CUW','CIV','ECU')
     or equipo_visitante in ('GER','CUW','CIV','ECU');

update public.partidos set grupo = 'F'
  where equipo_local  in ('NED','JPN','SWE','TUN')
     or equipo_visitante in ('NED','JPN','SWE','TUN');

update public.partidos set grupo = 'G'
  where equipo_local  in ('BEL','EGY','IRN','NZL')
     or equipo_visitante in ('BEL','EGY','IRN','NZL');

update public.partidos set grupo = 'H'
  where equipo_local  in ('ESP','CPV','KSA','URU')
     or equipo_visitante in ('ESP','CPV','KSA','URU');

update public.partidos set grupo = 'I'
  where equipo_local  in ('FRA','SEN','IRQ','NOR')
     or equipo_visitante in ('FRA','SEN','IRQ','NOR');

update public.partidos set grupo = 'J'
  where equipo_local  in ('ARG','ALG','AUT','JOR')
     or equipo_visitante in ('ARG','ALG','AUT','JOR');

update public.partidos set grupo = 'K'
  where equipo_local  in ('POR','COD','UZB','COL')
     or equipo_visitante in ('POR','COD','UZB','COL');

update public.partidos set grupo = 'L'
  where equipo_local  in ('ENG','CRO','GHA','PAN')
     or equipo_visitante in ('ENG','CRO','GHA','PAN');
