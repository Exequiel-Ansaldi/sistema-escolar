import { Test } from '@nestjs/testing';
import { LicenciasController } from './licencias.controller';
import { LicenciasService } from './licencias.service';
import { CrearLicenciaDto } from './dto/crear-licencia.dto';
import { ActualizarLicenciaDto } from './dto/actualizar-licencia.dto';
import { FiltrarLicenciasDto } from './dto/filtrar-licencias.dto';
import type { LicenciaResponse } from './dto/licencia-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Las fechas van como strings ISO (contrato del frontend).
const mockService = {
  findByDocente: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const licencia: LicenciaResponse = {
  id: 8,
  docenteId: 2,
  fechaInicio: '2026-05-01',
  fechaFin: '2026-05-10',
  codigo: 'LIC-2026-008',
  motivo: 'Licencia por enfermedad',
  estado: 'activa',
  observacion: null,
};

describe('LicenciasController', () => {
  let controller: LicenciasController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [LicenciasController],
      providers: [LicenciasService],
    })
      .overrideProvider(LicenciasService)
      .useValue(mockService)
      .compile();
    controller = module.get(LicenciasController);
    service = module.get(LicenciasService);
  });

  it('findByDocente delega docenteId con la paginación del query', async () => {
    const esperado: PaginatedResult<LicenciaResponse> = {
      data: [licencia],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    };
    service.findByDocente.mockResolvedValue(esperado);
    const query: FiltrarLicenciasDto = { page: 2, limit: 5 };

    const result = await controller.findByDocente(2, query);

    expect(service.findByDocente).toHaveBeenCalledWith(2, 2, 5);
    expect(result).toEqual(esperado);
  });

  it('findByDocente sin query usa page=1 y limit=10 por defecto', async () => {
    service.findByDocente.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await controller.findByDocente(2, {});

    expect(service.findByDocente).toHaveBeenCalledWith(2, 1, 10);
  });

  it('create delega el DTO completo', async () => {
    const dto: CrearLicenciaDto = {
      docenteId: 2,
      fechaInicio: '2026-05-01',
      fechaFin: '2026-05-10',
      motivo: 'Licencia por enfermedad',
    };
    service.create.mockResolvedValue({ id: 8, ...dto, estado: 'activa' });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ id: 8, docenteId: 2 });
  });

  it('update delega id y el DTO parcial', async () => {
    const dto: ActualizarLicenciaDto = { estado: 'finalizada' };
    service.update.mockResolvedValue({ ...licencia, estado: 'finalizada' });

    const result = await controller.update(8, dto);

    expect(service.update).toHaveBeenCalledWith(8, dto);
    expect(result).toMatchObject({ id: 8, estado: 'finalizada' });
  });

  it('delete delega el id del DELETE', async () => {
    service.delete.mockResolvedValue({ id: 8 });

    const result = await controller.delete(8);

    expect(service.delete).toHaveBeenCalledWith(8);
    expect(result).toEqual({ id: 8 });
  });
});
