// Dominio de estados de licencia (patrón State, Unidad III).
// El propio estado decide qué transiciones admite; `finalizada` también se
// computa en lectura cuando la vigencia terminó (sin tocar la fila).

export type EstadoLicencia =
  | 'pendiente'
  | 'aprobada'
  | 'rechazada'
  | 'finalizada';

export const ESTADOS_LICENCIA: EstadoLicencia[] = [
  'pendiente',
  'aprobada',
  'rechazada',
  'finalizada',
];

/**
 * Tabla de transiciones (estado actual → estados alcanzables).
 *
 * | Estado actual | aprobada    | rechazada   | finalizada  |
 * |---------------|-------------|-------------|-------------|
 * | pendiente     | ✔           | ✔           |             |
 * | aprobada      |             |             | ✔           |
 * | rechazada     | (terminal)  |             |             |
 * | finalizada    | (terminal)  |             |             |
 */
export const TRANSICIONES: Record<EstadoLicencia, EstadoLicencia[]> = {
  pendiente: ['aprobada', 'rechazada'],
  aprobada: ['finalizada'],
  rechazada: [],
  finalizada: [],
};

export function puedeTransitar(
  actual: EstadoLicencia,
  siguiente: EstadoLicencia,
): boolean {
  return TRANSICIONES[actual].includes(siguiente);
}

export function esEstadoValido(valor: string): valor is EstadoLicencia {
  return (ESTADOS_LICENCIA as string[]).includes(valor);
}

/** Estados desde los que el cron puede mover a `finalizada`. */
export const ESTADOS_FINALIZABLES: EstadoLicencia[] = ['pendiente', 'aprobada'];

/**
 * Estado efectivo en lectura: si la vigencia terminó y no está rechazada,
 * se presenta como `finalizada` aunque la fila todavía diga pendiente/aprobada.
 */
export function estadoEfectivo(
  estado: string,
  fechaFin: Date,
  hoy: Date,
): EstadoLicencia {
  if (estado === 'rechazada') return 'rechazada';
  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0);
  const hoyNormalizado = new Date(hoy);
  hoyNormalizado.setHours(0, 0, 0, 0);
  return fin <= hoyNormalizado ? 'finalizada' : (estado as EstadoLicencia);
}
