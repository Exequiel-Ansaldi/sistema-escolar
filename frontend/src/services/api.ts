import type {
  Alumno, Curso, Docente, Materia, Inscripcion, Asistencia, Calificacion,
  Acta, Acuerdo, Seguimiento, Tutor, Licencia, CursoMateria, ModuloMensual,
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
  getCargaHorariaGrupos: (page = 1, limit = 10, anio?: string, division?: string, turno?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (anio) params.set('anio', anio);
    if (division) params.set('division', division);
    if (turno) params.set('turno', turno);
    return request<PaginatedResult<CursoMateria>>(`/cursos-materias/grupos?${params.toString()}`);
  },
  getAllCargaHoraria: (anio?: string, division?: string, turno?: string) => {
    const params = new URLSearchParams();
    if (anio) params.set('anio', anio);
    if (division) params.set('division', division);
    if (turno) params.set('turno', turno);
    params.set('limit', '9999');
    const qs = params.toString();
    return request<PaginatedResult<CursoMateria>>(`/cursos-materias?${qs}`).then(r => r.data);
  },
  asignarMateriaCurso: (body: { cursoId: number; materiaId: number; cargaHoraria: number; modulosPorSemana: number }) =>
    request<CursoMateria>('/cursos-materias', { method: 'POST', body: JSON.stringify(body) }),
  quitarMateriaCurso: (cursoId: number, materiaId: number) =>
    request<void>(`/cursos-materias/${cursoId}/${materiaId}`, { method: 'DELETE' }),
  updateCargaHoraria: (cursoId: number, materiaId: number, body: { cargaHoraria?: number; modulosPorSemana?: number }) =>
    request<CursoMateria>(`/cursos-materias/${cursoId}/${materiaId}`, { method: 'PATCH', body: JSON.stringify(body) }),

  getInscripciones: (page = 1, limit = 10, filtros?: { anio?: string; division?: string; turno?: string }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filtros?.anio) params.set('anio', filtros.anio);
    if (filtros?.division) params.set('division', filtros.division);
    if (filtros?.turno) params.set('turno', filtros.turno);
    return request<PaginatedResult<Inscripcion>>(`/inscripciones?${params.toString()}`);
  },
  inscribir: (body: { alumnoId: number; cursoId: number }) =>
    request<Inscripcion>('/inscripciones', { method: 'POST', body: JSON.stringify(body) }),
  desinscribir: (alumnoId: number, cursoId: number) =>
    request<void>(`/inscripciones/${alumnoId}/${cursoId}`, { method: 'DELETE' }),

  getAsistenciasAlumno: (id: number) =>
    request<Asistencia[]>(`/asistencias/alumno/${id}`),
  getAsistenciasCurso: (cursoId: number, fecha: string) =>
    request<Asistencia[]>(`/asistencias/curso/${cursoId}?fecha=${fecha}`),
  buscarAsistencias: (q: string, fecha: string, page = 1, limit = 10, filtros?: { anio?: string; division?: string; turno?: string }) => {
    const params = new URLSearchParams({ q, fecha, page: String(page), limit: String(limit) });
    if (filtros?.anio) params.set('anio', filtros.anio);
    if (filtros?.division) params.set('division', filtros.division);
    if (filtros?.turno) params.set('turno', filtros.turno);
    return request<PaginatedResult<Asistencia>>(`/asistencias/buscar?${params.toString()}`);
  },
  createAsistencia: (body: { alumnoId: number; fecha: string; justificada?: boolean; observacion?: string }) =>
    request<Asistencia>('/asistencias', { method: 'POST', body: JSON.stringify(body) }),
  createAsistenciasMasivo: (body: { alumnoId: number; fecha: string; justificada?: boolean; observacion?: string }[]) =>
    request<Asistencia[]>('/asistencias/masivo', { method: 'POST', body: JSON.stringify({ datos: body }) }),

  getCalificaciones: (alumnoId: number, page = 1, limit = 10) =>
    request<PaginatedResult<Calificacion>>(`/calificaciones/alumno/${alumnoId}?page=${page}&limit=${limit}`),
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

  getActas: (alumnoId: number, page = 1, limit = 10) =>
    request<PaginatedResult<Acta>>(`/actas/alumno/${alumnoId}?page=${page}&limit=${limit}`),
  createActa: (body: { alumnoId: number; tipo: string; descripcion: string; numero: string }) =>
    request<Acta>('/actas', { method: 'POST', body: JSON.stringify(body) }),
  getAcuerdos: (alumnoId: number, page = 1, limit = 10) =>
    request<PaginatedResult<Acuerdo>>(`/acuerdos/alumno/${alumnoId}?page=${page}&limit=${limit}`),
  createAcuerdo: (body: { alumnoId: number; tipo: string; descripcion: string }) =>
    request<Acuerdo>('/acuerdos', { method: 'POST', body: JSON.stringify(body) }),
  updateAcuerdo: (id: number, body: Partial<Acuerdo>) =>
    request<Acuerdo>(`/acuerdos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getSeguimientos: (alumnoId: number, page = 1, limit = 10) =>
    request<PaginatedResult<Seguimiento>>(`/seguimientos/alumno/${alumnoId}?page=${page}&limit=${limit}`),
  createSeguimiento: (body: { alumnoId: number; tipo: string; titulo: string; descripcion: string }) =>
    request<Seguimiento>('/seguimientos', { method: 'POST', body: JSON.stringify(body) }),
  getTutores: (alumnoId: number, page = 1, limit = 10) =>
    request<PaginatedResult<Tutor>>(`/tutores/alumno/${alumnoId}?page=${page}&limit=${limit}`),
  createTutor: (body: { alumnoId: number; nombre: string; apellido: string; dni: string }) =>
    request<Tutor>('/tutores', { method: 'POST', body: JSON.stringify(body) }),
  deleteTutor: (id: number) =>
    request<void>(`/tutores/${id}`, { method: 'DELETE' }),

  getLicencias: (docenteId: number, page = 1, limit = 10) =>
    request<PaginatedResult<Licencia>>(`/licencias/docente/${docenteId}?page=${page}&limit=${limit}`),
  createLicencia: (body: { docenteId: number; fechaInicio: string; fechaFin: string; codigo: string; motivo: string; observacion?: string }) =>
    request<Licencia>('/licencias', { method: 'POST', body: JSON.stringify(body) }),
  updateLicencia: (id: number, body: Partial<Licencia>) =>
    request<Licencia>(`/licencias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLicencia: (id: number) =>
    request<void>(`/licencias/${id}`, { method: 'DELETE' }),

  getModulosMensuales: (mes: string, page = 1, limit = 10, filtros?: { anio?: string; division?: string; turno?: string; materiaId?: number }) => {
    const params = new URLSearchParams({ mes, page: String(page), limit: String(limit) });
    if (filtros?.anio) params.set('anio', filtros.anio);
    if (filtros?.division) params.set('division', filtros.division);
    if (filtros?.turno) params.set('turno', filtros.turno);
    if (filtros?.materiaId) params.set('materiaId', String(filtros.materiaId));
    return request<PaginatedResult<ModuloMensual> & { totalPrevistos: number; totalDictados: number }>(`/modulos-mensuales?${params.toString()}`);
  },
  upsertModuloMensual: (body: { docenteId: number; cursoId: number; materiaId: number; mes: string; modulosPrevistos: number; modulosDictados: number; noDictados?: { factor: string; cantidad: number }[]; observacion?: string }) =>
    request<ModuloMensual>('/modulos-mensuales', { method: 'POST', body: JSON.stringify(body) }),
  updateModuloMensual: (id: number, body: Partial<ModuloMensual>) =>
    request<ModuloMensual>(`/modulos-mensuales/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteModuloMensual: (id: number) =>
    request<void>(`/modulos-mensuales/${id}`, { method: 'DELETE' }),

  getDashboard: () =>
    request<DashboardResumen>('/dashboard/resumen'),
  getAprobadosPorCurso: () =>
    request<{ anio: number; turno: string; aprobados: number; alumnos: number }[]>('/dashboard/aprobados-por-curso'),
  getPromedioPorAnio: () =>
    request<{ anio: number; promedio: number }[]>('/dashboard/promedio-por-anio'),

  getDiasSinClases: (params?: { desde?: string; hasta?: string; cursoId?: number }, page = 1, limit = 10) => {
    const qs = new URLSearchParams();
    if (params?.desde) qs.set('desde', params.desde);
    if (params?.hasta) qs.set('hasta', params.hasta);
    if (params?.cursoId) qs.set('cursoId', String(params.cursoId));
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    const s = qs.toString();
    return request<PaginatedResult<DiaSinClases>>(`/dias-sin-clases?${s}`);
  },
  crearDiaSinClases: (body: { fecha: string; tipo: string; descripcion?: string; cursoId?: number }) =>
    request<DiaSinClases>('/dias-sin-clases', { method: 'POST', body: JSON.stringify(body) }),
  eliminarDiaSinClases: (id: number) =>
    request<void>(`/dias-sin-clases/${id}`, { method: 'DELETE' }),

  async descargarPdf(url: string, nombreArchivo: string) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}${url}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Error al descargar el reporte');
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al descargar el reporte');
    }
  },

  exportPdfCalificaciones: (alumnoId: number) =>
    api.descargarPdf(`/reportes/calificaciones/${alumnoId}`, `calificaciones_${alumnoId}.pdf`),
  exportPdfAsistencia: (alumnoId: number, desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    const qs = params.toString();
    return api.descargarPdf(`/reportes/asistencia/${alumnoId}${qs ? `?${qs}` : ''}`, `asistencia_${alumnoId}.pdf`);
  },
  exportPdfCurso: (cursoId: number) =>
    api.descargarPdf(`/reportes/curso/${cursoId}`, `curso_${cursoId}.pdf`),
};
