import { Injectable } from '@nestjs/common';
import { ReportesRepository } from './repositories/reportes.repository';
import { ReporteCalificacionesPdf } from './reporte-calificaciones-pdf';
import { ReporteAsistenciaPdf } from './reporte-asistencia-pdf';
import { ReporteCursoPdf } from './reporte-curso-pdf';

@Injectable()
export class ReportesService {
  constructor(private repo: ReportesRepository) {}

  reporteCalificaciones(alumnoId: number): Promise<Buffer> {
    return new ReporteCalificacionesPdf(this.repo, alumnoId).emitir();
  }

  reporteAsistencia(
    alumnoId: number,
    fechaDesde?: string,
    fechaHasta?: string,
  ): Promise<Buffer> {
    return new ReporteAsistenciaPdf(
      this.repo,
      alumnoId,
      fechaDesde,
      fechaHasta,
    ).emitir();
  }

  reporteCurso(cursoId: number): Promise<Buffer> {
    return new ReporteCursoPdf(this.repo, cursoId).emitir();
  }
}
