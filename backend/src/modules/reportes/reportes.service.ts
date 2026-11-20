import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportesRepository } from './repositories/reportes.repository';
import { generarPdf } from './reporte-pdf';
import { ReporteAsistenciaPdf } from './reporte-asistencia-pdf';
import { ReporteCalificacionesPdf } from './reporte-calificaciones-pdf';
import { Prisma } from '@prisma/client';

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

  async reporteCurso(cursoId: number): Promise<Buffer> {
    const curso = await this.repo.findCursoWithAll(cursoId);
    if (!curso) throw new NotFoundException('Curso no encontrado');

    return generarPdf((doc) => {
      doc.fontSize(18).text('Reporte de Curso', { align: 'center' });
      doc.moveDown();
      doc
        .fontSize(14)
        .text(
          `${curso.anio}°${curso.division} - ${curso.turno} (${curso.orientacion})`,
        );
      doc.moveDown();

      doc.fontSize(12).text(`Ciclo Lectivo: ${curso.cicloLectivo}`);
      doc.text(`Alumnos inscriptos: ${curso.inscripciones.length}`);
      doc.moveDown();

      if (curso.materias && curso.materias.length > 0) {
        doc.fontSize(12).text('Materias del curso:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        for (const cm of curso.materias) {
          doc.text(`- ${cm.materia.nombre}`);
        }
        doc.moveDown();
      }

      doc.fontSize(12).text('Alumnos:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const ins of curso.inscripciones) {
        doc.text(
          `${ins.alumno.apellido}, ${ins.alumno.nombre} - DNI: ${ins.alumno.dni}`,
        );
      }
      doc.moveDown();

      if (curso.modulosMensuales && curso.modulosMensuales.length > 0) {
        doc
          .fontSize(12)
          .text('Últimos módulos registrados:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        for (const m of curso.modulosMensuales) {
          const noDictados = (m.noDictados ?? [])
            .map((n) => `${n.factor}(${n.cantidad})`)
            .join(', ');
          doc.text(
            `${m.mes.toISOString().split('T')[0]} | ${m.materia.nombre} | Prev:${m.modulosPrevistos} Dict:${m.modulosDictados}${noDictados ? ` | No dictados: ${noDictados}` : ''}`,
          );
        }
      }
    });
  }
}
