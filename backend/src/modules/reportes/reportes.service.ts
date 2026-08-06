import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportesRepository } from './repositories/reportes.repository';
import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';

function generarPdf(
  escribir: (doc: PDFKit.PDFDocument) => void,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    escribir(doc);
    doc.end();
  });
}

@Injectable()
export class ReportesService {
  constructor(private repo: ReportesRepository) {}

  async reporteCalificaciones(alumnoId: number): Promise<Buffer> {
    const alumno = await this.repo.findAlumnoWithCalificaciones(alumnoId);
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    return generarPdf((doc) => {
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
    });
  }

  async reporteAsistencia(
    alumnoId: number,
    fechaDesde?: string,
    fechaHasta?: string,
  ): Promise<Buffer> {
    const alumno = await this.repo.findAlumnoWithInscripciones(alumnoId);
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const where: Prisma.AsistenciaWhereInput = {};
    if (fechaDesde || fechaHasta) {
      where.fecha = {
        ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
        ...(fechaHasta ? { lte: new Date(fechaHasta) } : {}),
      };
    }

    const asistencias = await this.repo.findAsistencias(alumnoId, where);

    return generarPdf((doc) => {
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
    });
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
