export interface DashboardTotalesResponse {
  alumnos: number;
  docentes: number;
  cursos: number;
  usuarios: number;
}

export interface AsistenciaHoyResponse {
  total: number;
  presentes: number;
  ausentes: number;
  fecha: string;
  fechaHoy: string;
}

export interface ModulosResumenResponse {
  totalPrevistos: number;
  totalDictados: number;
  eficiencia: number;
  porMateria: { nombre: string; previstos: number; dictados: number }[];
  porFactor: { factor: string; registros: number; noDictados: number }[];
}

export interface DashboardResumenResponse {
  totales: DashboardTotalesResponse;
  asistenciaHoy: AsistenciaHoyResponse;
  modulos: ModulosResumenResponse;
}

export interface AprobadosPorCursoResponse {
  anio: number;
  turno: string;
  aprobados: number;
  alumnos: number;
}

export interface PromedioPorAnioResponse {
  anio: number;
  promedio: number;
}
