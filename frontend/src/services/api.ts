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
  login: (body: { nombreUsuario: string; contrasena: string }) => request<{ accessToken: string; usuario: any }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getAlumnos: (page = 1, limit = 10) => request<PaginatedResult<any>>(`/alumnos?page=${page}&limit=${limit}`),
  getAllAlumnos: () => request<any[]>('/alumnos?limit=9999'),
  getAlumno: (id: number) => request<any>(`/alumnos/${id}`),
  createAlumno: (body: any) => request<any>('/alumnos', { method: 'POST', body: JSON.stringify(body) }),
  updateAlumno: (id: number, body: any) => request<any>(`/alumnos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAlumno: (id: number) => request<any>(`/alumnos/${id}`, { method: 'DELETE' }),

  getCursos: (page = 1, limit = 10) => request<PaginatedResult<any>>(`/cursos?page=${page}&limit=${limit}`),
  getAllCursos: () => request<any[]>('/cursos?limit=9999'),
  getCurso: (id: number) => request<any>(`/cursos/${id}`),
  createCurso: (body: any) => request<any>('/cursos', { method: 'POST', body: JSON.stringify(body) }),
  updateCurso: (id: number, body: any) => request<any>(`/cursos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCurso: (id: number) => request<any>(`/cursos/${id}`, { method: 'DELETE' }),

  getDocentes: (page = 1, limit = 10) => request<PaginatedResult<any>>(`/docentes?page=${page}&limit=${limit}`),
  getAllDocentes: () => request<any[]>('/docentes?limit=9999'),
  getDocente: (id: number) => request<any>(`/docentes/${id}`),
  createDocente: (body: any) => request<any>('/docentes', { method: 'POST', body: JSON.stringify(body) }),
  updateDocente: (id: number, body: any) => request<any>(`/docentes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDocente: (id: number) => request<any>(`/docentes/${id}`, { method: 'DELETE' }),

  getMaterias: (page = 1, limit = 10) => request<PaginatedResult<any>>(`/materias?page=${page}&limit=${limit}`),
  getAllMaterias: () => request<any[]>('/materias?limit=9999'),
  createMateria: (body: any) => request<any>('/materias', { method: 'POST', body: JSON.stringify(body) }),
  updateMateria: (id: number, body: any) => request<any>(`/materias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMateria: (id: number) => request<any>(`/materias/${id}`, { method: 'DELETE' }),

  getMateriasCurso: (cursoId: number) => request<any[]>(`/cursos-materias/curso/${cursoId}`),
  getAllCargaHoraria: (anio?: string, division?: string, turno?: string) => {
    const params = new URLSearchParams();
    if (anio) params.set('anio', anio);
    if (division) params.set('division', division);
    if (turno) params.set('turno', turno);
    const qs = params.toString();
    return request<any[]>(`/cursos-materias${qs ? `?${qs}` : ''}`);
  },
  asignarMateriaCurso: (body: any) => request<any>('/cursos-materias', { method: 'POST', body: JSON.stringify(body) }),
  quitarMateriaCurso: (cursoId: number, materiaId: number) => request<any>(`/cursos-materias/${cursoId}/${materiaId}`, { method: 'DELETE' }),
  updateCargaHoraria: (cursoId: number, materiaId: number, body: { cargaHoraria?: number; modulosPorSemana?: number }) => request<any>(`/cursos-materias/${cursoId}/${materiaId}`, { method: 'PATCH', body: JSON.stringify(body) }),

  inscribir: (body: any) => request<any>('/inscripciones', { method: 'POST', body: JSON.stringify(body) }),
  desinscribir: (alumnoId: number, cursoId: number) => request<any>(`/inscripciones/${alumnoId}/${cursoId}`, { method: 'DELETE' }),

  getAsistenciasAlumno: (id: number) => request<any[]>(`/asistencias/alumno/${id}`),
  getAsistenciasCurso: (cursoId: number, fecha: string) => request<any[]>(`/asistencias/curso/${cursoId}?fecha=${fecha}`),
  buscarAsistencias: (q: string, fecha: string) => request<any[]>(`/asistencias/buscar?q=${encodeURIComponent(q)}&fecha=${fecha}`),
  createAsistencia: (body: any) => request<any>('/asistencias', { method: 'POST', body: JSON.stringify(body) }),
  createAsistenciasMasivo: (body: any[]) => request<any[]>('/asistencias/masivo', { method: 'POST', body: JSON.stringify(body) }),

  getCalificaciones: (alumnoId: number) => request<any[]>(`/calificaciones/alumno/${alumnoId}`),
  getPromedio: (alumnoId: number) => request<any>(`/calificaciones/alumno/${alumnoId}/promedio`),
  getPromedioPorTrimestre: (alumnoId: number) => request<any[]>(`/calificaciones/alumno/${alumnoId}/promedio-trimestre`),
  getPromedioPorMateria: (alumnoId: number) => request<any[]>(`/calificaciones/alumno/${alumnoId}/promedio-materia`),
  createCalificacion: (body: any) => request<any>('/calificaciones', { method: 'POST', body: JSON.stringify(body) }),

  getActas: (alumnoId: number) => request<any[]>(`/actas/alumno/${alumnoId}`),
  createActa: (body: any) => request<any>('/actas', { method: 'POST', body: JSON.stringify(body) }),
  getAcuerdos: (alumnoId: number) => request<any[]>(`/acuerdos/alumno/${alumnoId}`),
  createAcuerdo: (body: any) => request<any>('/acuerdos', { method: 'POST', body: JSON.stringify(body) }),
  updateAcuerdo: (id: number, body: any) => request<any>(`/acuerdos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getSeguimientos: (alumnoId: number) => request<any[]>(`/seguimientos/alumno/${alumnoId}`),
  createSeguimiento: (body: any) => request<any>('/seguimientos', { method: 'POST', body: JSON.stringify(body) }),
  getTutores: (alumnoId: number) => request<any[]>(`/tutores/alumno/${alumnoId}`),
  createTutor: (body: any) => request<any>('/tutores', { method: 'POST', body: JSON.stringify(body) }),
  deleteTutor: (id: number) => request<any>(`/tutores/${id}`, { method: 'DELETE' }),

  getLicencias: (docenteId: number) => request<any[]>(`/licencias/docente/${docenteId}`),
  createLicencia: (body: any) => request<any>('/licencias', { method: 'POST', body: JSON.stringify(body) }),
  updateLicencia: (id: number, body: any) => request<any>(`/licencias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLicencia: (id: number) => request<any>(`/licencias/${id}`, { method: 'DELETE' }),

  getModulosSemana: (mes: string) => request<any[]>(`/modulos-semana?mes=${mes}`),
  upsertModuloSemana: (body: any) => request<any>('/modulos-semana', { method: 'POST', body: JSON.stringify(body) }),
  updateModuloSemana: (id: number, body: any) => request<any>(`/modulos-semana/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteModuloSemana: (id: number) => request<any>(`/modulos-semana/${id}`, { method: 'DELETE' }),

  getDashboard: () => request<any>('/dashboard/resumen'),
  getAlumnosPorCurso: () => request<any[]>('/dashboard/alumnos-por-curso'),
  getCalificacionesResumen: () => request<any>('/dashboard/calificaciones-resumen'),

  getDiasSinClases: (params?: { desde?: string; hasta?: string; cursoId?: number }) => {
    const qs = new URLSearchParams();
    if (params?.desde) qs.set('desde', params.desde);
    if (params?.hasta) qs.set('hasta', params.hasta);
    if (params?.cursoId) qs.set('cursoId', String(params.cursoId));
    const s = qs.toString();
    return request<any[]>(`/dias-sin-clases${s ? `?${s}` : ''}`);
  },
  crearDiaSinClases: (body: { fecha: string; tipo: string; descripcion?: string; cursoId?: number }) => request<any>('/dias-sin-clases', { method: 'POST', body: JSON.stringify(body) }),
  eliminarDiaSinClases: (id: number) => request<any>(`/dias-sin-clases/${id}`, { method: 'DELETE' }),

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
