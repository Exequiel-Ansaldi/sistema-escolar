import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AsistenciaRepository } from './repositories/asistencia.repository';
import { AlumnosRepository } from '../alumnos/repositories/alumnos.repository';
import { DiasSinClasesRepository } from '../dias-sin-clases/repositories/dias-sin-clases.repository';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';
import { ActualizarAsistenciaDto } from './dto/actualizar-asistencia.dto';
import type {
  AsistenciaResponse,
  AsistenciaCursoResponse,
  AsistenciaBuscarResponse,
} from './dto/asistencia-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class AsistenciaService {
  constructor(
    private asistenciaRepository: AsistenciaRepository,
    private alumnosRepository: AlumnosRepository,
    private diasSinClasesRepo: DiasSinClasesRepository,
  ) {}

  private async esSinClases(
    fecha: string,
    cursoId?: number,
  ): Promise<string | null> {
    const d = new Date(fecha);
    const dia = d.getUTCDay();
    if (dia === 0 || dia === 6) return 'fin_de_semana';

    const inicio = new Date(fecha);
    inicio.setUTCHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setUTCDate(fin.getUTCDate() + 1);
    const registros = await this.diasSinClasesRepo.findEntreFechas(inicio, fin);
    for (const r of registros) {
      if (!r.cursoId) return r.tipo;
      if (cursoId && r.cursoId === cursoId) return r.tipo;
    }
    return null;
  }

  async findByAlumno(alumnoId: number): Promise<AsistenciaResponse[]> {
    return this.asistenciaRepository.findByAlumno(alumnoId);
  }

  async findByCursoYFecha(
    cursoId: number,
    fecha: string,
  ): Promise<AsistenciaCursoResponse[]> {
    const sinClases = await this.esSinClases(fecha, cursoId);
    const resultados = await this.asistenciaRepository.findByCursoYFecha(
      cursoId,
      fecha,
    );
    if (sinClases) {
      return resultados.map((r) => ({ ...r, estado: 'no_corresponde' }));
    }
    return resultados;
  }

  async buscarPorAlumno(
    query: string,
    fecha: string,
    page = 1,
    limit = 10,
    filtros?: { anio?: number; division?: string; turno?: string },
  ): Promise<PaginatedResult<AsistenciaBuscarResponse>> {
    const resultados = await this.asistenciaRepository.buscarPorAlumno(
      query,
      fecha,
      page,
      limit,
      filtros,
    );
    const data = await Promise.all(
      resultados.data.map(async (r) => {
        const sinClases = await this.esSinClases(fecha, r.curso?.id);
        return sinClases ? { ...r, estado: 'no_corresponde' } : r;
      }),
    );
    return { ...resultados, data };
  }

  async registrar(dto: CrearAsistenciaDto) {
    const alumno = await this.alumnosRepository.findById(dto.alumnoId);
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const inscripcion = alumno.inscripciones?.find(
      (i) => i.estado === 'activo',
    );
    if (!inscripcion)
      throw new ConflictException('El alumno no tiene un curso activo');

    const fecha = dto.fecha ?? new Date().toISOString().split('T')[0];
    const motivo = await this.esSinClases(fecha, inscripcion.cursoId);
    if (motivo) {
      throw new ConflictException(
        `No se puede registrar la asistencia del ${fecha}: no hay clases para este curso (${motivo})`,
      );
    }

    const { justificada, ...rest } = dto;
    const data = {
      ...rest,
      estado: justificada ? 'justificado' : 'ausente',
    };
    return this.asistenciaRepository.create(data);
  }

  async actualizar(id: number, dto: ActualizarAsistenciaDto) {
    return this.asistenciaRepository.update(id, dto);
  }

  async registrarMasivo(datos: CrearAsistenciaDto[]) {
    const alumnos = await Promise.all(
      datos.map((d) => this.alumnosRepository.findById(d.alumnoId)),
    );
    for (const d of datos) {
      const alumno = alumnos.find((a) => a?.id === d.alumnoId);
      if (!alumno)
        throw new NotFoundException(`Alumno ${d.alumnoId} no encontrado`);
      const inscripcion = alumno.inscripciones?.find(
        (i) => i.estado === 'activo',
      );
      if (!inscripcion)
        throw new ConflictException(
          `El alumno ${d.alumnoId} no tiene un curso activo`,
        );
      const fecha = d.fecha ?? new Date().toISOString().split('T')[0];
      const motivo = await this.esSinClases(fecha, inscripcion.cursoId);
      if (motivo) {
        throw new ConflictException(
          `No se puede registrar la asistencia del alumno ${d.alumnoId} el ${fecha}: no hay clases para este curso (${motivo})`,
        );
      }
    }
    const transformed = datos.map(({ justificada, ...rest }) => ({
      ...rest,
      estado: justificada ? 'justificado' : 'ausente',
    }));
    return this.asistenciaRepository.createMany(transformed);
  }
}
