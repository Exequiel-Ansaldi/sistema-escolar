import { NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export function generarPdf(
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

/**
 * Template Method de los reportes PDF: el esqueleto de `emitir()` es final
 * (buscar → validar 404 → renderizar) y cada reporte aporta los huecos.
 */
export abstract class ReportePdf<TDatos> {
  async emitir(): Promise<Buffer> {
    const datos = await this.buscar();
    if (!datos) throw new NotFoundException(this.entidadNoEncontrada());
    return generarPdf((doc) => this.renderizar(doc, datos));
  }

  protected abstract buscar(): Promise<TDatos | null>;

  protected abstract entidadNoEncontrada(): string;

  protected abstract renderizar(doc: PDFKit.PDFDocument, datos: TDatos): void;
}
