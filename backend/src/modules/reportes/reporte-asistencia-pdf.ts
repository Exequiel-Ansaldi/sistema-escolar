import PDFDocument from 'pdfkit';
import { ReportePdf } from './reporte-pdf';
import type { ReportesRepository } from './repositories/reportes.repository';
import { Prisma } from '@prisma/client';

type Alumno = NonNullable<
  Awaited<ReturnType<ReportesRepository['findAlumnoWithInscripciones']>>
>;
type Asistencia = Awaited<
  ReturnType<ReportesRepository['findAsistencias']>
>[number];

type Datos = { alumno: Alumno; asistencias: Asistencia[] };

export class ReporteAsistenciaPdf extends ReportePdf<Datos> {
  constructor(
    private repo: ReportesRepository,
    private readonly alumnoId: number,
    private readonly fechaDesde?: string,
    private readonly fechaHasta?: string,
  ) {
    super();
  }

  protected async buscar(): Promise<Datos | null> {
    const alumno = await this.repo.findAlumnoWithInscripciones(this.alumnoId);
    if (!alumno) return null;

    const where: Prisma.AsistenciaWhereInput = {};
    if (this.fechaDesde || this.fechaHasta) {
      where.fecha = {
        ...(this.fechaDesde ? { gte: new Date(this.fechaDesde) } : {}),
        ...(this.fechaHasta ? { lte: new Date(this.fechaHasta) } : {}),
      };
    }

    const asistencias = await this.repo.findAsistencias(this.alumnoId, where);
    return { alumno, asistencias };
  }

  protected entidadNoEncontrada(): string {
    return 'Alumno no encontrado';
  }

  protected renderizar(
    doc: PDFKit.PDFDocument,
    { alumno, asistencias }: Datos,
  ): void {
    const pageW = doc.page.width - 100;
    const col1 = 50;
    const colW1 = 100;
    const colW2 = 80;
    const col2 = col1 + colW1;
    const col3 = col2 + colW2;
    const colW3 = pageW - colW1 - colW2;

    doc.rect(50, 50, pageW, 90).fill('#1e3a5f');
    doc
      .fill('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Reporte de Asistencia', 50, 65, {
        align: 'center',
        width: pageW,
      });
    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`Alumno: ${alumno.apellido}, ${alumno.nombre}`, 50, 100, {
        width: pageW,
      });
    doc
      .fontSize(9)
      .fill('#cbd5e1')
      .text(
        `DNI: ${alumno.dni}  |  Curso: ${alumno.inscripciones[0] ? `${alumno.inscripciones[0].curso.anio}°${alumno.inscripciones[0].curso.division} - ${alumno.inscripciones[0].curso.turno}` : 'Sin curso'}`,
        50,
        118,
        { width: pageW },
      );

    const headerY = 170;
    doc.rect(col1, headerY, pageW, 22).fill('#f1f5f9');
    doc.fill('#475569').fontSize(9).font('Helvetica-Bold');
    doc.text('Fecha', col1 + 8, headerY + 6, { width: colW1 });
    doc.text('Estado', col2, headerY + 6, { width: colW2, align: 'center' });
    doc.text('Observación', col3, headerY + 6, { width: colW3 });

    const estadoLabel = (e: string) =>
      e === 'presente'
        ? 'Presente'
        : e === 'ausente'
          ? 'Ausente'
          : e === 'justificado'
            ? 'Justificado'
            : e;

    let y = headerY + 22;
    let row = 0;
    for (const a of asistencias) {
      if (row % 2 === 1) doc.rect(col1, y, pageW, 20).fill('#f8fafc');
      doc.fill('#1e293b').font('Helvetica').fontSize(9);
      doc.text(a.fecha.toISOString().split('T')[0], col1 + 8, y + 5, {
        width: colW1,
      });
      doc.text(estadoLabel(a.estado), col2, y + 5, {
        width: colW2,
        align: 'center',
      });
      doc.text(a.observacion || a.justificacion || '-', col3, y + 5, {
        width: colW3,
      });
      y += 20;
      row++;
    }

    const presentes = asistencias.filter(
      (a) => a.estado === 'presente',
    ).length;
    const ausentes = asistencias.filter((a) => a.estado === 'ausente').length;

    doc
      .moveTo(col1, y)
      .lineTo(col1 + pageW, y)
      .stroke('#e2e8f0');
    y += 15;
    doc.rect(col1, y, pageW, 30).fill('#1e3a5f');
    doc
      .fill('#ffffff')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(
        `Total: ${asistencias.length}  |  Presentes: ${presentes}  |  Ausentes: ${ausentes}`,
        col1,
        y + 9,
        { align: 'center', width: pageW },
      );
  }
}
