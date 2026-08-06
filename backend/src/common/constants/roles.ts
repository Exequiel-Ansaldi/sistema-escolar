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
