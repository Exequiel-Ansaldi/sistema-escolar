import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { FiltrarReporteAsistenciaDto } from './dto/filtrar-reporte-asistencia.dto';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Los reportes son PDFs: el mock del service devuelve un
// Buffer fake y el controller debe pasarlo tal cual al Response.
const mockService = {
  reporteCalificaciones: jest.fn(),
  reporteAsistencia: jest.fn(),
  reporteCurso: jest.fn(),
};

const pdfFake = Buffer.from('%PDF-fake');

function crearRes(): Response {
  return {
    set: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;
}

describe('ReportesController', () => {
  let controller: ReportesController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [ReportesService],
    })
      .overrideProvider(ReportesService)
      .useValue(mockService)
      .compile();
    controller = module.get(ReportesController);
    service = module.get(ReportesService);
  });

  it('reporteCalificaciones delega el alumnoId y envía el mismo Buffer con headers PDF', async () => {
    service.reporteCalificaciones.mockResolvedValue(pdfFake);
    const res = crearRes();

    await controller.reporteCalificaciones(res, 3);

    expect(service.reporteCalificaciones).toHaveBeenCalledWith(3);
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=calificaciones_3.pdf',
    });
    expect(res.send).toHaveBeenCalledWith(pdfFake);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it('reporteAsistencia delega alumnoId y el rango desde/hasta del query', async () => {
    service.reporteAsistencia.mockResolvedValue(pdfFake);
    const res = crearRes();
    const query: FiltrarReporteAsistenciaDto = {
      desde: '2026-03-01',
      hasta: '2026-03-31',
    };

    await controller.reporteAsistencia(res, 3, query);

    expect(service.reporteAsistencia).toHaveBeenCalledWith(
      3,
      '2026-03-01',
      '2026-03-31',
    );
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=asistencia_3.pdf',
    });
    expect(res.send).toHaveBeenCalledWith(pdfFake);
  });

  it('reporteAsistencia sin query delega undefined en el rango', async () => {
    service.reporteAsistencia.mockResolvedValue(pdfFake);
    const res = crearRes();

    await controller.reporteAsistencia(res, 3, {});

    expect(service.reporteAsistencia).toHaveBeenCalledWith(3, undefined, undefined);
  });

  it('reporteCurso delega el cursoId y envía el mismo Buffer con headers PDF', async () => {
    service.reporteCurso.mockResolvedValue(pdfFake);
    const res = crearRes();

    await controller.reporteCurso(res, 5);

    expect(service.reporteCurso).toHaveBeenCalledWith(5);
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=curso_5.pdf',
    });
    expect(res.send).toHaveBeenCalledWith(pdfFake);
  });
});
