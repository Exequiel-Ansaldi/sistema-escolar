import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './repositories/dashboard.repository';
import { DiasSinClasesRepository } from '../dias-sin-clases/repositories/dias-sin-clases.repository';
import type {
  DashboardResumenResponse,
  AprobadosPorCursoResponse,
  PromedioPorAnioResponse,
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

  async aprobadosPorCurso(): Promise<AprobadosPorCursoResponse[]> {
    const [inscripciones, promedios] = await Promise.all([
      this.repo.findInscripcionesActivasConCurso(),
      this.repo.calificacionesPromedioPorAlumnoMateria(),
    ]);

    const cursoDeAlumno = new Map<
      number,
      (typeof inscripciones)[number]['curso']
    >();
    for (const i of inscripciones) {
      if (!cursoDeAlumno.has(i.alumnoId))
        cursoDeAlumno.set(i.alumnoId, i.curso);
    }

    const promedioPorAlumno = new Map<number, number>();
    for (const g of promedios) {
      const actual = promedioPorAlumno.get(g.alumnoId) ?? 0;
      promedioPorAlumno.set(g.alumnoId, actual + (g._avg.nota ?? 0));
    }
    const materiasPorAlumno = new Map<number, number>();
    for (const g of promedios) {
      materiasPorAlumno.set(
        g.alumnoId,
        (materiasPorAlumno.get(g.alumnoId) ?? 0) + 1,
      );
    }

    const porAnioTurno = new Map<
      string,
      { anio: number; turno: string; aprobados: number; alumnos: number }
    >();
    for (const i of inscripciones) {
      const curso = cursoDeAlumno.get(i.alumnoId);
      if (!curso) continue;
      const key = `${curso.anio}-${curso.turno}`;
      const entry = porAnioTurno.get(key) ?? {
        anio: curso.anio,
        turno: curso.turno,
        aprobados: 0,
        alumnos: 0,
      };
      entry.alumnos++;
      const total = promedioPorAlumno.get(i.alumnoId);
      const materias = materiasPorAlumno.get(i.alumnoId);
      if (
        total !== undefined &&
        materias !== undefined &&
        materias > 0 &&
        total / materias >= 6
      ) {
        entry.aprobados++;
      }
      porAnioTurno.set(key, entry);
    }

    return [...porAnioTurno.values()].sort(
      (a, b) => a.anio - b.anio || a.turno.localeCompare(b.turno),
    );
  }

  async promedioPorAnio(): Promise<PromedioPorAnioResponse[]> {
    const [inscripciones, promedios] = await Promise.all([
      this.repo.findInscripcionesActivasConCurso(),
      this.repo.calificacionesPromedioPorAlumnoMateria(),
    ]);

    const anioDeAlumno = new Map<number, number>();
    for (const i of inscripciones) {
      if (!anioDeAlumno.has(i.alumnoId))
        anioDeAlumno.set(i.alumnoId, i.curso.anio);
    }

    const acumuladoPorAnio = new Map<
      number,
      { suma: number; cantidad: number }
    >();
    for (const g of promedios) {
      const anio = anioDeAlumno.get(g.alumnoId);
      if (anio === undefined || g._avg.nota === null) continue;
      const actual = acumuladoPorAnio.get(anio) ?? { suma: 0, cantidad: 0 };
      actual.suma += g._avg.nota;
      actual.cantidad++;
      acumuladoPorAnio.set(anio, actual);
    }

    return [...acumuladoPorAnio.entries()]
      .sort(([a], [b]) => a - b)
      .map(([anio, v]) => ({
        anio,
        promedio: Math.round((v.suma / v.cantidad) * 100) / 100,
      }));
  }

  async ultimasAsistencias(limite = 10) {
    return this.repo.findUltimasAsistencias(limite);
  }
}
