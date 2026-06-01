-- =============================================================================
-- [DB-Agent] Porra Mundial 2026 — Restricción de valores válidos en perfiles
-- =============================================================================
-- Añade CHECK constraints sobre las tres columnas de datos corporativos:
--   • nacionalidad → solo países del listado oficial con bandera
--   • hub          → solo sedes corporativas válidas
--   • estudio      → solo departamentos válidos
--
-- Se usa NOT VALID para no bloquear en datos pre-existentes; solo aplica
-- a inserts y updates futuros. Cero impacto en el rol `anon`.
-- =============================================================================

alter table public.perfiles
  add constraint perfiles_nacionalidad_check check (
    nacionalidad is null or nacionalidad in (
      'Afganistán','Albania','Alemania','Andorra','Angola','Antigua y Barbuda',
      'Arabia Saudita','Argelia','Argentina','Armenia','Australia','Austria',
      'Azerbaiyán','Bahamas','Bangladés','Barbados','Baréin','Bélgica','Belice',
      'Benín','Bielorrusia','Bolivia','Bosnia y Herzegovina','Botsuana','Brasil',
      'Brunéi','Bulgaria','Burkina Faso','Burundi','Bután','Cabo Verde','Camboya',
      'Camerún','Canadá','Catar','Chad','Chile','China','Chipre','Colombia',
      'Comoras','Congo','Corea del Norte','Corea del Sur','Costa de Marfil',
      'Costa Rica','Croacia','Cuba','República Checa','Dinamarca','Dominica',
      'Ecuador','Egipto','El Salvador','Emiratos Árabes Unidos','Eritrea',
      'Eslovaquia','Eslovenia','España','Estados Unidos','Estonia','Etiopía',
      'Filipinas','Finlandia','Fiyi','Francia','Gabón','Gambia','Georgia','Ghana',
      'Granada','Grecia','Guatemala','Guinea','Guinea Ecuatorial','Guinea-Bisáu',
      'Guyana','Haití','Honduras','Hungría','India','Indonesia','Irak','Irán',
      'Irlanda','Islandia','Islas Marshall','Islas Salomón','Israel','Italia',
      'Jamaica','Japón','Jordania','Kazajistán','Kenia','Kirguistán','Kiribati',
      'Kosovo','Kuwait','Laos','Lesoto','Letonia','Líbano','Liberia','Libia',
      'Liechtenstein','Lituania','Luxemburgo','Macedonia del Norte','Madagascar',
      'Malasia','Malaui','Maldivas','Malí','Malta','Marruecos','Mauricio',
      'Mauritania','México','Micronesia','Moldavia','Mónaco','Mongolia',
      'Montenegro','Mozambique','Myanmar','Namibia','Nauru','Nepal','Nicaragua',
      'Níger','Nigeria','Noruega','Nueva Zelanda','Omán','Países Bajos',
      'Pakistán','Palaos','Palestina','Panamá','Papúa Nueva Guinea','Paraguay',
      'Perú','Polonia','Portugal','República Centroafricana',
      'República Dem. del Congo','República Dominicana','Ruanda','Rumanía',
      'Rusia','Samoa','San Cristóbal y Nieves','San Marino',
      'San Vicente y las Granadinas','Santa Lucía','Santo Tomé y Príncipe',
      'Senegal','Serbia','Seychelles','Sierra Leona','Singapur','Siria','Somalia',
      'Sri Lanka','Suazilandia','Sudáfrica','Sudán','Sudán del Sur','Suecia',
      'Suiza','Surinam','Tailandia','Tanzania','Tayikistán','Timor Oriental',
      'Togo','Tonga','Trinidad y Tobago','Túnez','Turkmenistán','Turquía',
      'Tuvalu','Ucrania','Uganda','Uruguay','Uzbekistán','Vanuatu','Vaticano',
      'Venezuela','Vietnam','Yemen','Yibuti','Zambia','Zimbabue','Otro'
    )
  ) not valid;

alter table public.perfiles
  add constraint perfiles_hub_check check (
    hub is null or hub in ('Barcelona','Madrid','Remote','Valencia')
  ) not valid;

alter table public.perfiles
  add constraint perfiles_estudio_check check (
    estudio is null or estudio in (
      'Backend','Data & AI','Design','Frontend','Fullstack','Management','Product & QA'
    )
  ) not valid;
