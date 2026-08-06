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
  '/': [ROLES.VICERRECTOR],
  '/alumnos': [ROLES.SECRETARIA_ALUMNADO],
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

export function puedeAcceder(rol: string | undefined, path: string): boolean {
  if (!rol) return false;
  if (rol === ROLES.ADMIN || rol === ROLES.RECTOR) return true;
  const permitidos = RUTAS_POR_ROL[path];
  if (!permitidos) return true;
  return permitidos.includes(rol as Rol);
}

export function rutaInicial(rol: string | undefined): string {
  if (puedeAcceder(rol, '/')) return '/';
  for (const [path, permitidos] of Object.entries(RUTAS_POR_ROL)) {
    if (permitidos.includes(rol as Rol)) return path;
  }
  return '/';
}
