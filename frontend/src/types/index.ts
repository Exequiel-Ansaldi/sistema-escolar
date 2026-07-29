export interface LoginResponse {
  accessToken: string;
  usuario: Usuario;
}

export interface Usuario {
  id: number; nombreUsuario: string; nombre: string; apellido: string;
  activo: boolean; rolId: number; rol?: Rol;
}

export interface Rol {
  id: number; nombreRol: string;
}

export interface Alumno {
  id: number; dni: string; nombre: string; apellido: string;
  nacimiento: string; direccion: string; telefono: string;
  estado: string; fechaIngreso: string; fechaEgreso?: string;
  inscripciones?: Inscripcion[]; tutores?: Tutor[];
}
export interface Curso {
  id: number; anio: number; division: string; turno: string;
  orientacion: string; cicloLectivo: number; estado: string;
}
export interface Docente {
  id: number; dni: string; nombre: string; apellido: string;
  telefono: string; email: string; fechaIngreso: string; estado: string;
  materias?: DocenteMateria[];
}
export interface Materia { id: number; nombre: string; }
export interface Inscripcion { id: number; alumnoId: number; cursoId: number; fechaInscripcion: string; estado: string; curso?: Curso; alumno?: Alumno; }
export interface DocenteMateria { docenteId: number; materiaId: number; materia?: Materia; docente?: Docente; }
export interface Asistencia { id: number; alumnoId: number; fecha: string; estado: string; justificacion?: string; observacion?: string; alumno?: Alumno; }
export interface Calificacion { id: number; alumnoId: number; materiaId: number; nota: number; trimestre: number; fecha: string; observacion?: string; materia?: Materia; }
export interface Acta { id: number; alumnoId: number; fecha: string; tipo: string; descripcion: string; numero: string; }
export interface Acuerdo { id: number; alumnoId: number; fecha: string; tipo: string; descripcion: string; estado: string; }
export interface Seguimiento { id: number; alumnoId: number; fecha: string; tipo: string; titulo: string; descripcion: string; estado: string; }
export interface Tutor { id: number; alumnoId: number; nombre: string; apellido: string; dni: string; }
export interface Licencia { id: number; docenteId: number; fechaInicio: string; fechaFin: string; codigo: string; motivo: string; estado: string; observacion?: string; }
export interface CursoMateria { cursoId: number; materiaId: number; cargaHoraria: number; modulosPorSemana: number; materia?: Materia; curso?: Curso; }
export interface ModuloSemanal { id: number; docenteId: number; cursoId: number; materiaId: number; semanaInicio: string; modulosPrevistos: number; modulosDictados: number; factor?: string; observacion?: string; docente?: Docente; materia?: Materia; curso?: Curso; }
export interface DiaSinClases { id: number; fecha: string; tipo: string; descripcion?: string; cursoId?: number; curso?: Curso; createdAt: string; }
export interface DashboardResumen { totales: { alumnos: number; docentes: number; cursos: number; usuarios: number }; asistenciaHoy: { total: number; presentes: number; ausentes: number }; }
