import type {
  Alumno, Curso, Docente, Materia, Inscripcion, Asistencia, Calificacion,
  Acta, Acuerdo, Seguimiento, Tutor, Licencia, CursoMateria, ModuloSemanal,
  DiaSinClases, DashboardResumen, LoginResponse,
} from '../types';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Error de red'); }
  return res.json();
}

export const api = {
  login: (body: { nombreUsuario: string; contrasena: string }) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getAlumnos: (page = 1, limit = 10, filters?: Record<string, string>) => {
    const search = filters?.search;
    return request<PaginatedResult<Alumno>>(`/alumnos?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
  },
  getAllAlumnos: () =>
    request<PaginatedResult<Alumno>>('/alumnos?limit=9999').then(r => r.data),
  getAlumno: (id: number) =>
    request<Alumno>(`/alumnos/${id}`),
  createAlumno: (body: Partial<Alumno>) =>
    request<Alumno>('/alumnos', { method: 'POST', body: JSON.stringify(body) }),
  updateAlumno: (id: number, body: Partial<Alumno>) =>
    request<Alumno>(`/alumnos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAlumno: (id: number) =>
    request<Alumno>(`/alumnos/${id}`, { method: 'DELETE' }),

  getCursos: (page = 1, limit = 10, filters?: Record<string, string>) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.anio) params.set('anio', filters.anio);
    if (filters?.division) params.set('division', filters.division);
    if (filters?.turno) params.set('turno', filters.turno);
    return request<PaginatedResult<Curso>>(`/cursos?${params.toString()}`);
  },
  getAllCursos: () =>
    request<PaginatedResult<Curso>>('/cursos?limit=9999').then(r => r.data),
  getCurso: (id: number) =>
    request<Curso>(`/cursos/${id}`),
  createCurso: (body: Partial<Curso>) =>
    request<Curso>('/cursos', { method: 'POST', body: JSON.stringify(body) }),
  updateCurso: (id: number, body: Partial<Curso>) =>
    request<Curso>(`/cursos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCurso: (id: number) =>
    request<Curso>(`/cursos/${id}`, { method: 'DELETE' }),

  getDocentes: (page = 1, limit = 10, filters?: Record<string, string>) => {
    const search = filters?.search;
    return request<PaginatedResult<Docente>>(`/docentes?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
  },
  getAllDocentes: () =>
    request<PaginatedResult<Docente>>('/docentes?limit=9999').then(r => r.data),
  getDocente: (id: number) =>
    request<Docente>(`/docentes/${id}`),
  createDocente: (body: Partial<Docente>) =>
    request<Docente>('/docentes', { method: 'POST', body: JSON.stringify(body) }),
  updateDocente: (id: number, body: Partial<Docente>) =>
    request<Docente>(`/docentes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDocente: (id: number) =>
    request<Docente>(`/docentes/${id}`, { method: 'DELETE' }),

  getMaterias: (page = 1, limit = 10, filters?: Record<string, string>) => {
    const search = filters?.search;
    return request<PaginatedResult<Materia>>(`/materias?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
  },
  getAllMaterias: () =>
    request<PaginatedResult<Materia>>('/materias?limit=9999').then(r => r.data),
  createMateria: (body: Partial<Materia>) =>
    request<Materia>('/materias', { method: 'POST', body: JSON.stringify(body) }),
  updateMateria: (id: number, body: Partial<Materia>) =>
    request<Materia>(`/materias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMateria: (id: number) =>
    request<Materia>(`/materias/${id}`, { method: 'DELETE' }),

  getMateriasCurso: (cursoId: number) =>
    request<CursoMateria[]>(`/cursos-materias/curso/${cursoId}`),
  getAllCargaHoraria: (anio?: string, division?: string, turno?: string) => {
    const params = new URLSearchParams();
    if (anio) params.set('anio', anio);
    if (division) params.set('division', division);
    if (turno) params.set('turno', turno);
    const qs = params.toString();
    return request<CursoMateria[]>(`/cursos-materias${qs ? `?${qs}` : ''}`);
  },
  asignarMateriaCurso: (body: { cursoId: number; materiaId: number; cargaHoraria: number; modulosPorSemana: number }) =>
    request<CursoMateria>('/cursos-materias', { method: 'POST', body: JSON.stringify(body) }),
  quitarMateriaCurso: (cursoId: number, materiaId: number) =>
    request<void>(`/cursos-materias/${cursoId}/${materiaId}`, { method: 'DELETE' }),
  updateCargaHoraria: (cursoId: number, materiaId: number, body: { cargaHoraria?: number; modulosPorSemana?: number }) =>
    request<CursoMateria>(`/cursos-materias/${cursoId}/${materiaId}`, { method: 'PATCH', body: JSON.stringify(body) }),

  inscribir: (body: { alumnoId: number; cursoId: number }) =>
    request<Inscripcion>('/inscripciones', { method: 'POST', body: JSON.stringify(body) }),
  desinscribir: (alumnoId: number, cursoId: number) =>
    request<void>(`/inscripciones/${alumnoId}/${cursoId}`, { method: 'DELETE' }),

  getAsistenciasAlumno: (id: number) =>
    request<Asistencia[]>(`/asistencias/alumno/${id}`),
  getAsistenciasCurso: (cursoId: number, fecha: string) =>
    request<Asistencia[]>(`/asistencias/curso/${cursoId}?fecha=${fecha}`),
  buscarAsistencias: (q: string, fecha: string) =>
    request<Asistencia[]>(`/asistencias/buscar?q=${encodeURIComponent(q)}&fecha=${fecha}`),
  createAsistencia: (body: { alumnoId: number; fecha: string; justificada?: boolean; observacion?: string }) =>
    request<Asistencia>('/asistencias', { method: 'POST', body: JSON.stringify(body) }),
  createAsistenciasMasivo: (body: { alumnoId: number; fecha: string; justificada?: boolean; observacion?: string }[]) =>
    request<Asistencia[]>('/asistencias/masivo', { method: 'POST', body: JSON.stringify(body) }),

  getCalificaciones: (alumnoId: number) =>
    request<Calificacion[]>(`/calificaciones/alumno/${alumnoId}`),
  getPromedio: (alumnoId: number) =>
    request<{ _avg: { nota: number | null }; _count: number }>(`/calificaciones/alumno/${alumnoId}/promedio`),
  getPromedioPorTrimestre: (alumnoId: number) =>
    request<{ trimestre: number; _avg: { nota: number | null }; _count: number }[]>(`/calificaciones/alumno/${alumnoId}/promedio-trimestre`),
  getPromedioPorMateria: (alumnoId: number) =>
    request<{ materia: Materia; promedio: number | null; count: number }[]>(`/calificaciones/alumno/${alumnoId}/promedio-materia`),
  createCalificacion: (body: { alumnoId: number; materiaId: number; nota: number; trimestre: number; observacion?: string }) =>
    request<Calificacion>('/calificaciones', { method: 'POST', body: JSON.stringify(body) }),
  updateCalificacion: (id: number, body: Partial<{ nota: number; trimestre: number; observacion?: string }>) =>
    request<Calificacion>(`/calificaciones/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  getActas: (alumnoId: number) =>
    request<Acta[]>(`/actas/alumno/${alumnoId}`),
  createActa: (body: { alumnoId: number; tipo: string; descripcion: string; numero: string }) =>
    request<Acta>('/actas', { method: 'POST', body: JSON.stringify(body) }),
  getAcuerdos: (alumnoId: number) =>
    request<Acuerdo[]>(`/acuerdos/alumno/${alumnoId}`),
  createAcuerdo: (body: { alumnoId: number; tipo: string; descripcion: string }) =>
    request<Acuerdo>('/acuerdos', { method: 'POST', body: JSON.stringify(body) }),
  updateAcuerdo: (id: number, body: Partial<Acuerdo>) =>
    request<Acuerdo>(`/acuerdos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getSeguimientos: (alumnoId: number) =>
    request<Seguimiento[]>(`/seguimientos/alumno/${alumnoId}`),
  createSeguimiento: (body: { alumnoId: number; tipo: string; titulo: string; descripcion: string }) =>
    request<Seguimiento>('/seguimientos', { method: 'POST', body: JSON.stringify(body) }),
  getTutores: (alumnoId: number) =>
    request<Tutor[]>(`/tutores/alumno/${alumnoId}`),
  createTutor: (body: { alumnoId: number; nombre: string; apellido: string; dni: string }) =>
    request<Tutor>('/tutores', { method: 'POST', body: JSON.stringify(body) }),
  deleteTutor: (id: number) =>
    request<void>(`/tutores/${id}`, { method: 'DELETE' }),

  getLicencias: (docenteId: number) =>
    request<Licencia[]>(`/licencias/docente/${docenteId}`),
  createLicencia: (body: { docenteId: number; fechaInicio: string; fechaFin: string; codigo: string; motivo: string; observacion?: string }) =>
    request<Licencia>('/licencias', { method: 'POST', body: JSON.stringify(body) }),
  updateLicencia: (id: number, body: Partial<Licencia>) =>
    request<Licencia>(`/licencias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLicencia: (id: number) =>
    request<void>(`/licencias/${id}`, { method: 'DELETE' }),

  getModulosSemana: (mes: string) =>
    request<ModuloSemanal[]>(`/modulos-semana?mes=${mes}`),
  upsertModuloSemana: (body: { docenteId: number; cursoId: number; materiaId: number; semanaInicio: string; modulosPrevistos: number; modulosDictados: number; factor?: string; observacion?: string }) =>
    request<ModuloSemanal>('/modulos-semana', { method: 'POST', body: JSON.stringify(body) }),
  updateModuloSemana: (id: number, body: Partial<ModuloSemanal>) =>
    request<ModuloSemanal>(`/modulos-semana/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteModuloSemana: (id: number) =>
    request<void>(`/modulos-semana/${id}`, { method: 'DELETE' }),

  getDashboard: () =>
    request<DashboardResumen>('/dashboard/resumen'),
  getAlumnosPorCurso: () =>
    request<{ curso: Curso; cantidad: number }[]>('/dashboard/alumnos-por-curso'),
  getCalificacionesResumen: () =>
    request<{ promedioGeneral: number | null; notaMax: number | null; notaMin: number | null; total: number }>('/dashboard/calificaciones-resumen'),

  getDiasSinClases: (params?: { desde?: string; hasta?: string; cursoId?: number }) => {
    const qs = new URLSearchParams();
    if (params?.desde) qs.set('desde', params.desde);
    if (params?.hasta) qs.set('hasta', params.hasta);
    if (params?.cursoId) qs.set('cursoId', String(params.cursoId));
    const s = qs.toString();
    return request<DiaSinClases[]>(`/dias-sin-clases${s ? `?${s}` : ''}`);
  },
  crearDiaSinClases: (body: { fecha: string; tipo: string; descripcion?: string; cursoId?: number }) =>
    request<DiaSinClases>('/dias-sin-clases', { method: 'POST', body: JSON.stringify(body) }),
  eliminarDiaSinClases: (id: number) =>
    request<void>(`/dias-sin-clases/${id}`, { method: 'DELETE' }),

  exportPdfCalificaciones: (alumnoId: number) => window.open(`${BASE}/reportes/calificaciones/${alumnoId}`, '_blank'),
  exportPdfAsistencia: (alumnoId: number, desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    const qs = params.toString();
    window.open(`${BASE}/reportes/asistencia/${alumnoId}${qs ? `?${qs}` : ''}`, '_blank');
  },
  exportPdfCurso: (cursoId: number) => window.open(`${BASE}/reportes/curso/${cursoId}`, '_blank'),
};
