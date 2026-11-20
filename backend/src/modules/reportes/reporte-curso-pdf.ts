import PDFDocument from 'pdfkit';
import { ReportePdf } from './reporte-pdf';
import type { ReportesRepository } from './repositories/reportes.repository';

type Datos = NonNullable<
  Awaited<ReturnType<ReportesRepository['findCursoWithAll']>>
>;

export class ReporteCursoPdf extends ReportePdf<Datos> {
  constructor(
    private repo: ReportesRepository,
    private readonly cursoId: number,
  ) {
    super();
  }

  protected async buscar(): Promise<Datos | null> {
    return this.repo.findCursoWithAll(this.cursoId);
  }

  protected entidadNoEncontrada(): string {
    return 'Curso no encontrado';
  }

  protected renderizar(doc: PDFKit.PDFDocument, curso: Datos): void {
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
  }
}
