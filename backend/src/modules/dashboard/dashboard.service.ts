import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './repositories/dashboard.repository';
import { DiasSinClasesRepository } from '../dias-sin-clases/repositories/dias-sin-clases.repository';
import type {
  DashboardResumenResponse,
  AlumnosPorCursoResponse,
  CalificacionesResumenResponse,
} from './dto/dashboard-response';

@Injectable()
export class DashboardService {
  constructor(
    private repo: DashboardRepository,
    private diasSinClasesRepo: DiasSinClasesRepository,
  ) {}

  async resumen(): Promise<DashboardResumenResponse> {
    const [alumnos, docentes, cursos, usuarios] = await Promise.all([
      this.repo.countAlumnosActivos(),
      this.repo.countDocentesActivos(),
      this.repo.countCursosActivos(),
      this.repo.countUsuariosActivos(),
    ]);

    const hoy = new Date();
    const fechaHoy = new Date(
      Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
    );

    const esHabil = async (d: Date): Promise<boolean> => {
      const dia = d.getUTCDay();
      if (dia === 0 || dia === 6) return false;
      const fin = new Date(d);
      fin.setUTCDate(fin.getUTCDate() + 1);
      const sinClases = await this.diasSinClasesRepo.findEntreFechas(d, fin);
      return !sinClases.some((r) => r.cursoId === null);
    };

    const fecha = new Date(fechaHoy);
    let intentos = 0;
    while (!(await esHabil(fecha)) && intentos < 30) {
      fecha.setUTCDate(fecha.getUTCDate() - 1);
      intentos++;
    }

    const maniana = new Date(fecha);
    maniana.setUTCDate(maniana.getUTCDate() + 1);

    const [registros, totalAlumnos] = await Promise.all([
      this.repo.findAsistenciasByFecha(fecha, maniana),
      this.repo.countInscripcionesActivas(),
    ]);
    const asistenciaHoy = {
      total: totalAlumnos,
      presentes: totalAlumnos - registros.length,
      ausentes: registros.length,
      fecha: fecha.toISOString().split('T')[0],
      fechaHoy: fechaHoy.toISOString().split('T')[0],
    };

    const [modulosAggr, porMateriaRaw, porFactorRaw] = await Promise.all([
      this.repo.aggregateModulos(),
      this.repo.modulosPorMateria(),
      this.repo.modulosPorFactor(),
    ]);

    const materias = await this.repo.findMaterias();
    const materiasMap = new Map(materias.map((m) => [m.id, m.nombre]));

    const modulos = {
      totalPrevistos: modulosAggr._sum.modulosPrevistos ?? 0,
      totalDictados: modulosAggr._sum.modulosDictados ?? 0,
      eficiencia: modulosAggr._sum.modulosPrevistos
        ? Math.round(
            (Number(modulosAggr._sum.modulosDictados) /
              Number(modulosAggr._sum.modulosPrevistos)) *
              100,
          )
        : 0,
      porMateria: porMateriaRaw.map((g) => ({
        nombre: materiasMap.get(g.materiaId) ?? `ID ${g.materiaId}`,
        previstos: g._sum.modulosPrevistos ?? 0,
        dictados: g._sum.modulosDictados ?? 0,
      })),
      porFactor: porFactorRaw.map((g) => ({
        factor: g.factor,
        registros: g._count,
        noDictados: g._sum.cantidad ?? 0,
      })),
    };

    return {
      totales: { alumnos, docentes, cursos, usuarios },
      asistenciaHoy,
      modulos,
    };
  }

  async alumnosPorCurso(): Promise<AlumnosPorCursoResponse[]> {
    const cursos = await this.repo.findCursosConInscripciones();
    return cursos.map((c) => ({
      id: c.id,
      nombre: `${c.anio}°${c.division} - ${c.turno} (${c.orientacion})`,
      alumnos: c._count.inscripciones,
    }));
  }

  async ultimasAsistencias(limite = 10) {
    return this.repo.findUltimasAsistencias(limite);
  }

  async calificacionesResumen(): Promise<CalificacionesResumenResponse> {
    const aggr = await this.repo.aggregateCalificaciones();
    return {
      totalCalificaciones: aggr._count,
      promedioGeneral: Math.round(Number(aggr._avg.nota) * 100) / 100,
      notaMaxima: aggr._max.nota,
      notaMinima: aggr._min.nota,
    };
  }
}
