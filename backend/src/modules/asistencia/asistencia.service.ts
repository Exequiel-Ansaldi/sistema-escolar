import { Injectable, NotFoundException } from '@nestjs/common';
import { AsistenciaRepository } from './repositories/asistencia.repository';
import { AlumnosRepository } from '../alumnos/repositories/alumnos.repository';
import { DiasSinClasesRepository } from '../dias-sin-clases/repositories/dias-sin-clases.repository';
import { CrearAsistenciaDto } from './dto/crear-asistencia.dto';

@Injectable()
export class AsistenciaService {
  constructor(
    private asistenciaRepository: AsistenciaRepository,
    private alumnosRepository: AlumnosRepository,
    private diasSinClasesRepo: DiasSinClasesRepository,
  ) {}

  private async esSinClases(fecha: string, cursoId?: number): Promise<string | null> {
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

  async findByAlumno(alumnoId: number) {
    return this.asistenciaRepository.findByAlumno(alumnoId);
  }

  async findByCursoYFecha(cursoId: number, fecha: string) {
    const sinClases = await this.esSinClases(fecha, cursoId);
    const resultados = await this.asistenciaRepository.findByCursoYFecha(cursoId, fecha);
    if (sinClases) {
      return resultados.map(r => ({ ...r, estado: 'no_corresponde' }));
    }
    return resultados;
  }

  async buscarPorAlumno(query: string, fecha: string) {
    const resultados = await this.asistenciaRepository.buscarPorAlumno(query, fecha);
    return Promise.all(resultados.map(async r => {
      const sinClases = await this.esSinClases(fecha, r.curso?.id);
      return sinClases ? { ...r, estado: 'no_corresponde' } : r;
    }));
  }

  async registrar(dto: CrearAsistenciaDto) {
    const alumno = await this.alumnosRepository.findById(dto.alumnoId);
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    const { justificada, ...rest } = dto;
    const data = {
      ...rest,
      estado: justificada ? 'justificado' : 'ausente',
    };
    return this.asistenciaRepository.create(data);
  }

  async actualizar(id: number, dto: Partial<CrearAsistenciaDto>) {
    return this.asistenciaRepository.update(id, dto);
  }

  async registrarMasivo(datos: CrearAsistenciaDto[]) {
    for (const d of datos) {
      const alumno = await this.alumnosRepository.findById(d.alumnoId);
      if (!alumno) throw new NotFoundException(`Alumno ${d.alumnoId} no encontrado`);
    }
    const transformed = datos.map(({ justificada, ...rest }) => ({
      ...rest,
      estado: justificada ? 'justificado' : 'ausente',
    }));
    return this.asistenciaRepository.createMany(transformed);
  }
}