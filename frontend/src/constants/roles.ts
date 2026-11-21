export const ROLES = {
  ADMIN: 'admin',
  RECTOR: 'rector',
  VICERRECTOR: 'vicerrector',
  SECRETARIA_PERSONAL: 'secretaria_personal',
  SECRETARIA_ALUMNADO: 'secretaria_alumnado',
  ASESORIA_PEDAGOGICA: 'asesoria_pedagogica',
  PRECEPTOR_MANANA: 'preceptor_manana',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

export const ROL_LABELS: Record<string, string> = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.RECTOR]: 'Rector',
  [ROLES.VICERRECTOR]: 'Vicerrector',
  [ROLES.SECRETARIA_PERSONAL]: 'Secretaría de Personal',
  [ROLES.SECRETARIA_ALUMNADO]: 'Secretaría de Alumnado',
  [ROLES.ASESORIA_PEDAGOGICA]: 'Asesoría Pedagógica',
  [ROLES.PRECEPTOR_MANANA]: 'Preceptor Mañana',
};

export const RUTAS_POR_ROL: Record<string, Rol[]> = {
  // Regla 2026-11-20: el dashboard ('/') es SOLO para rector (admin/rector
  // pasan siempre por el check especial; vicerrector ya no).
  '/': [ROLES.RECTOR],
  '/alumnos': [ROLES.SECRETARIA_ALUMNADO, ROLES.ASESORIA_PEDAGOGICA],
  '/inscripciones': [ROLES.SECRETARIA_ALUMNADO],
  '/docentes': [ROLES.SECRETARIA_PERSONAL],
  '/licencias': [ROLES.SECRETARIA_PERSONAL],
  '/actas': [ROLES.ASESORIA_PEDAGOGICA],
  '/cursos': [ROLES.VICERRECTOR, ROLES.PRECEPTOR_MANANA],
  '/carga-horaria': [ROLES.VICERRECTOR],
  '/materias': [ROLES.VICERRECTOR],
  '/asistencias': [ROLES.PRECEPTOR_MANANA],
  '/calificaciones': [ROLES.PRECEPTOR_MANANA],
  '/modulos-mensuales': [ROLES.PRECEPTOR_MANANA],
  '/calendario': [ROLES.PRECEPTOR_MANANA],
};

// Orden del menú lateral (Layout): rutaInicial debe ser determinista y
// coincidir con lo que el usuario ve primero en el sidebar.
export const ORDEN_RUTAS = [
  '/',
  '/alumnos',
  '/cursos',
  '/docentes',
  '/materias',
  '/carga-horaria',
  '/inscripciones',
  '/asistencias',
  '/calificaciones',
  '/actas',
  '/licencias',
  '/modulos-mensuales',
  '/calendario',
] as const;

// Roles con permiso de ESCRITURA por módulo (espeja los @Roles de POST/PUT/DELETE
// del backend; la defensa real siguen siendo los guards). Solo-lectura = sin botones.
const ESCRITURA_POR_PATH: Record<string, Rol[]> = {
  '/alumnos': [ROLES.SECRETARIA_ALUMNADO],
  '/inscripciones': [ROLES.SECRETARIA_ALUMNADO],
  '/docentes': [ROLES.SECRETARIA_PERSONAL],
  '/licencias': [ROLES.SECRETARIA_PERSONAL],
  '/cursos': [ROLES.VICERRECTOR, ROLES.PRECEPTOR_MANANA],
  '/carga-horaria': [ROLES.VICERRECTOR],
  '/materias': [ROLES.VICERRECTOR],
  '/asistencias': [ROLES.PRECEPTOR_MANANA],
  '/calificaciones': [ROLES.PRECEPTOR_MANANA],
  '/modulos-mensuales': [ROLES.PRECEPTOR_MANANA],
  '/calendario': [ROLES.PRECEPTOR_MANANA],
  '/actas': [ROLES.ASESORIA_PEDAGOGICA],
};

export function puedeEscribir(rol: string | undefined, path: string): boolean {
  if (!rol) return false;
  if (rol === ROLES.ADMIN || rol === ROLES.RECTOR) return true;
  const permitidos = ESCRITURA_POR_PATH[path];
  return permitidos?.includes(rol as Rol) ?? false;
}

export function puedeAcceder(rol: string | undefined, path: string): boolean {
  if (!rol) return false;
  if (rol === ROLES.ADMIN || rol === ROLES.RECTOR) return true;
  // Default-deny: una ruta sin entrada en el mapa queda bloqueada para
  // cualquier rol sin permiso explícito (antes se permitía, inconsistente
  // con los guards del backend).
  const permitidos = RUTAS_POR_ROL[path];
  return permitidos?.includes(rol as Rol) ?? false;
}

export function rutaInicial(rol: string | undefined): string {
  // Orden del menú (ORDEN_RUTAS), no orden de inserción del mapa:
  // rutaInicial coincide con lo primero que el rol ve en el sidebar.
  for (const path of ORDEN_RUTAS) {
    if (puedeAcceder(rol, path)) return path;
  }
  return '/';
}
