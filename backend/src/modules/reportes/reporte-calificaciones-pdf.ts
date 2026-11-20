import PDFDocument from 'pdfkit';
import { ReportePdf } from './reporte-pdf';
import type { ReportesRepository } from './repositories/reportes.repository';

type Datos = NonNullable<
  Awaited<ReturnType<ReportesRepository['findAlumnoWithCalificaciones']>>
>;

export class ReporteCalificacionesPdf extends ReportePdf<Datos> {
  constructor(
    private repo: ReportesRepository,
    private readonly alumnoId: number,
  ) {
    super();
  }

  protected async buscar(): Promise<Datos | null> {
    return this.repo.findAlumnoWithCalificaciones(this.alumnoId);
  }

  protected entidadNoEncontrada(): string {
    return 'Alumno no encontrado';
  }

  protected renderizar(doc: PDFKit.PDFDocument, alumno: Datos): void {
    const pageW = doc.page.width - 100;
    const col1 = 50;
    const colW = pageW * 0.4;
    const col2 = col1 + colW + 10;
    const col3 = col2 + 50;
    const col4 = col3 + 50;
    const col5 = col4 + 50;
    const col5Right = col5 + 70;

    doc.rect(50, 50, pageW, 90).fill('#1e3a5f');
    doc
      .fill('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Reporte de Calificaciones', 50, 65, {
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

    const materias = new Map<string, { notas: number[]; promedio: number }>();
    for (const cal of alumno.calificaciones) {
      if (!materias.has(cal.materia.nombre)) {
        materias.set(cal.materia.nombre, { notas: [], promedio: 0 });
      }
      materias.get(cal.materia.nombre)!.notas[cal.trimestre - 1] = cal.nota;
    }

    for (const [, v] of materias) {
      const vals = v.notas.filter((n) => n !== undefined);
      v.promedio = vals.length
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) /
          100
        : 0;
    }

    const headerY = 170;
    doc.rect(col1, headerY, pageW, 22).fill('#f1f5f9');
    doc.fill('#475569').fontSize(9).font('Helvetica-Bold');
    doc.text('Materia', col1 + 8, headerY + 6, { width: colW });
    doc.text('T1', col2, headerY + 6, { width: 45, align: 'center' });
    doc.text('T2', col3, headerY + 6, { width: 45, align: 'center' });
    doc.text('T3', col4, headerY + 6, { width: 45, align: 'center' });
    doc.text('Promedio', col5, headerY + 6, { width: 70, align: 'center' });

    let y = headerY + 22;
    let row = 0;
    for (const [nombre, data] of materias) {
      if (row % 2 === 1) doc.rect(col1, y, pageW, 20).fill('#f8fafc');
      doc.fill('#1e293b').font('Helvetica').fontSize(9);
      doc.text(nombre, col1 + 8, y + 5, { width: colW });
      doc.text((data.notas[0] ?? '-').toString(), col2, y + 5, {
        width: 45,
        align: 'center',
      });
      doc.text((data.notas[1] ?? '-').toString(), col3, y + 5, {
        width: 45,
        align: 'center',
      });
      doc.text((data.notas[2] ?? '-').toString(), col4, y + 5, {
        width: 45,
        align: 'center',
      });
      doc.text(data.promedio.toString(), col5, y + 5, {
        width: 70,
        align: 'center',
      });
      y += 20;
      row++;
    }

    doc.moveTo(col1, y).lineTo(col5Right, y).stroke('#e2e8f0');

    const todosPromedios = Array.from(materias.values()).map(
      (v) => v.promedio,
    );
    const promedioGeneral = todosPromedios.length
      ? Math.round(
          (todosPromedios.reduce((a, b) => a + b, 0) /
            todosPromedios.length) *
            100,
        ) / 100
      : 0;

    y += 15;
    doc.rect(col1, y, pageW, 30).fill('#1e3a5f');
    doc
      .fill('#ffffff')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`Promedio General: ${promedioGeneral}`, col1, y + 9, {
        align: 'center',
        width: pageW,
      });
  }
}
