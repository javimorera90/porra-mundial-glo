/**
 * Rutas locales a los SVG de banderas almacenados en public/assets/flags/.
 * Cubre las 48 selecciones del Mundial 2026.
 * Fallback: bandera gris para códigos no contemplados.
 */

const CODIGO_FLAG: Record<string, string> = {
  // Grupo A
  MEX: '/assets/flags/MEX.svg',
  RSA: '/assets/flags/RSA.svg',
  KOR: '/assets/flags/KOR.svg',
  CZE: '/assets/flags/CZE.svg',
  // Grupo B
  CAN: '/assets/flags/CAN.svg',
  BIH: '/assets/flags/BIH.svg',
  QAT: '/assets/flags/QAT.svg',
  SUI: '/assets/flags/SUI.svg',
  // Grupo C
  BRA: '/assets/flags/BRA.svg',
  MAR: '/assets/flags/MAR.svg',
  HAI: '/assets/flags/HAI.svg',
  SCO: '/assets/flags/SCO.svg',
  // Grupo D
  USA: '/assets/flags/USA.svg',
  PAR: '/assets/flags/PAR.svg',
  AUS: '/assets/flags/AUS.svg',
  TUR: '/assets/flags/TUR.svg',
  // Grupo E
  GER: '/assets/flags/GER.svg',
  CUW: '/assets/flags/CUW.svg',
  CIV: '/assets/flags/CIV.svg',
  ECU: '/assets/flags/ECU.svg',
  // Grupo F
  NED: '/assets/flags/NED.svg',
  JPN: '/assets/flags/JPN.svg',
  SWE: '/assets/flags/SWE.svg',
  TUN: '/assets/flags/TUN.svg',
  // Grupo G
  BEL: '/assets/flags/BEL.svg',
  EGY: '/assets/flags/EGY.svg',
  IRN: '/assets/flags/IRN.svg',
  NZL: '/assets/flags/NZL.svg',
  // Grupo H
  ESP: '/assets/flags/ESP.svg',
  CPV: '/assets/flags/CPV.svg',
  KSA: '/assets/flags/KSA.svg',
  URU: '/assets/flags/URU.svg',
  // Grupo I
  FRA: '/assets/flags/FRA.svg',
  SEN: '/assets/flags/SEN.svg',
  IRQ: '/assets/flags/IRQ.svg',
  NOR: '/assets/flags/NOR.svg',
  // Grupo J
  ARG: '/assets/flags/ARG.svg',
  ALG: '/assets/flags/ALG.svg',
  AUT: '/assets/flags/AUT.svg',
  JOR: '/assets/flags/JOR.svg',
  // Grupo K
  POR: '/assets/flags/POR.svg',
  COD: '/assets/flags/COD.svg',
  UZB: '/assets/flags/UZB.svg',
  COL: '/assets/flags/COL.svg',
  // Grupo L
  ENG: '/assets/flags/ENG.svg',
  CRO: '/assets/flags/CRO.svg',
  GHA: '/assets/flags/GHA.svg',
  PAN: '/assets/flags/PAN.svg',
  // Italia (no en el Mundial 2026 pero usada como nacionalidad)
  ITA: '/assets/flags/ITA.svg',
}

export function flagDeEquipo(codigo: string | null | undefined): string {
  if (!codigo) return '/assets/flags/default.svg'
  return CODIGO_FLAG[codigo] ?? '/assets/flags/default.svg'
}

/** Nombre de nacionalidad (español) → código de bandera (tal como se guarda en PAISES). */
const NOMBRE_A_CODIGO: Record<string, string> = {
  'Afganistán': 'af', 'Albania': 'al', 'Alemania': 'GER', 'Andorra': 'ad',
  'Angola': 'ao', 'Antigua y Barbuda': 'ag', 'Arabia Saudita': 'KSA',
  'Argelia': 'ALG', 'Argentina': 'ARG', 'Armenia': 'am', 'Australia': 'AUS',
  'Austria': 'AUT', 'Azerbaiyán': 'az', 'Bahamas': 'bs', 'Bangladés': 'bd',
  'Barbados': 'bb', 'Baréin': 'bh', 'Bélgica': 'BEL', 'Belice': 'bz',
  'Benín': 'bj', 'Bielorrusia': 'by', 'Bolivia': 'bo',
  'Bosnia y Herzegovina': 'BIH', 'Botsuana': 'bw', 'Brasil': 'BRA',
  'Brunéi': 'bn', 'Bulgaria': 'bg', 'Burkina Faso': 'bf', 'Burundi': 'bi',
  'Bután': 'bt', 'Cabo Verde': 'CPV', 'Camboya': 'kh', 'Camerún': 'cm',
  'Canadá': 'CAN', 'Catar': 'QAT', 'Chad': 'td', 'Chile': 'CHL',
  'China': 'cn', 'Chipre': 'cy', 'Colombia': 'COL', 'Comoras': 'km',
  'Congo': 'cg', 'Corea del Norte': 'kp', 'Corea del Sur': 'KOR',
  'Costa de Marfil': 'CIV', 'Costa Rica': 'cr', 'Croacia': 'CRO',
  'Cuba': 'cu', 'República Checa': 'CZE', 'Dinamarca': 'dk',
  'Dominica': 'dm', 'Ecuador': 'ECU', 'Egipto': 'EGY', 'El Salvador': 'sv',
  'Emiratos Árabes Unidos': 'ae', 'Eritrea': 'er', 'Eslovaquia': 'sk',
  'Eslovenia': 'si', 'España': 'ESP', 'Estados Unidos': 'USA',
  'Estonia': 'ee', 'Etiopía': 'et', 'Filipinas': 'ph', 'Finlandia': 'fi',
  'Fiyi': 'fj', 'Francia': 'FRA', 'Gabón': 'ga', 'Gambia': 'gm',
  'Georgia': 'ge', 'Ghana': 'GHA', 'Granada': 'gd', 'Grecia': 'gr',
  'Guatemala': 'gt', 'Guinea': 'gn', 'Guinea Ecuatorial': 'gq',
  'Guinea-Bisáu': 'gw', 'Guyana': 'gy', 'Haití': 'HAI', 'Honduras': 'hn',
  'Hungría': 'hu', 'India': 'in', 'Indonesia': 'id', 'Irak': 'IRQ',
  'Irán': 'IRN', 'Irlanda': 'ie', 'Islandia': 'is',
  'Islas Marshall': 'mh', 'Islas Salomón': 'sb', 'Israel': 'il',
  'Italia': 'ITA', 'Jamaica': 'jm', 'Japón': 'JPN', 'Jordania': 'JOR',
  'Kazajistán': 'kz', 'Kenia': 'ke', 'Kirguistán': 'kg', 'Kiribati': 'ki',
  'Kosovo': 'xk', 'Kuwait': 'kw', 'Laos': 'la', 'Lesoto': 'ls',
  'Letonia': 'lv', 'Líbano': 'lb', 'Liberia': 'lr', 'Libia': 'ly',
  'Liechtenstein': 'li', 'Lituania': 'lt', 'Luxemburgo': 'lu',
  'Macedonia del Norte': 'mk', 'Madagascar': 'mg', 'Malasia': 'my',
  'Malaui': 'mw', 'Maldivas': 'mv', 'Malí': 'ml', 'Malta': 'mt',
  'Marruecos': 'MAR', 'Mauricio': 'mu', 'Mauritania': 'mr', 'México': 'MEX',
  'Micronesia': 'fm', 'Moldavia': 'md', 'Mónaco': 'mc', 'Mongolia': 'mn',
  'Montenegro': 'me', 'Mozambique': 'mz', 'Myanmar': 'mm', 'Namibia': 'na',
  'Nauru': 'nr', 'Nepal': 'np', 'Nicaragua': 'ni', 'Níger': 'ne',
  'Nigeria': 'ng', 'Noruega': 'NOR', 'Nueva Zelanda': 'NZL', 'Omán': 'om',
  'Países Bajos': 'NED', 'Pakistán': 'pk', 'Palaos': 'pw',
  'Palestina': 'ps', 'Panamá': 'PAN', 'Papúa Nueva Guinea': 'pg',
  'Paraguay': 'PAR', 'Perú': 'PER', 'Polonia': 'pl', 'Portugal': 'POR',
  'República Centroafricana': 'cf', 'República Dem. del Congo': 'COD',
  'República Dominicana': 'do', 'Ruanda': 'rw', 'Rumanía': 'ro',
  'Rusia': 'ru', 'Samoa': 'ws', 'San Cristóbal y Nieves': 'kn',
  'San Marino': 'sm', 'San Vicente y las Granadinas': 'vc',
  'Santa Lucía': 'lc', 'Santo Tomé y Príncipe': 'st', 'Senegal': 'SEN',
  'Serbia': 'rs', 'Seychelles': 'sc', 'Sierra Leona': 'sl',
  'Singapur': 'sg', 'Siria': 'sy', 'Somalia': 'so', 'Sri Lanka': 'lk',
  'Suazilandia': 'sz', 'Sudáfrica': 'RSA', 'Sudán': 'sd',
  'Sudán del Sur': 'ss', 'Suecia': 'SWE', 'Suiza': 'SUI', 'Surinam': 'sr',
  'Tailandia': 'th', 'Tanzania': 'tz', 'Tayikistán': 'tj',
  'Timor Oriental': 'tl', 'Togo': 'tg', 'Tonga': 'to',
  'Trinidad y Tobago': 'tt', 'Túnez': 'TUN', 'Turkmenistán': 'tm',
  'Turquía': 'TUR', 'Tuvalu': 'tv', 'Ucrania': 'ua', 'Uganda': 'ug',
  'Uruguay': 'URU', 'Uzbekistán': 'UZB', 'Vanuatu': 'vu', 'Vaticano': 'va',
  'Venezuela': 've', 'Vietnam': 'vn', 'Yemen': 'ye', 'Yibuti': 'dj',
  'Zambia': 'zm', 'Zimbabue': 'zw',
  // Selecciones no en el Mundial pero habituales
  'Escocia': 'SCO', 'Inglaterra': 'ENG',
}

/** Devuelve el código de bandera (tal como se almacena) para una nacionalidad. */
export function codigoDeNacionalidad(nacionalidad: string | null | undefined): string {
  if (!nacionalidad) return ''
  return NOMBRE_A_CODIGO[nacionalidad] ?? ''
}

/** URL del SVG de bandera para una nacionalidad. */
export function flagDeNacionalidad(nacionalidad: string | null | undefined): string {
  const code = codigoDeNacionalidad(nacionalidad)
  if (!code) return ''
  return `/assets/flags/${code}.svg`
}
