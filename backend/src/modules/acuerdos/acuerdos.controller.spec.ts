import { Test } from '@nestjs/testing';
import { AcuerdosController } from './acuerdos.controller';
import { AcuerdosService } from './acuerdos.service';
import { CrearAcuerdoDto } from './dto/crear-acuerdo.dto';
import { ActualizarAcuerdoDto } from './dto/actualizar-acuerdo.dto';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import type { AcuerdoResponse } from './dto/acuerdo-response';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. Las fechas van como strings ISO (contrato del frontend).
const mockService = {
  findByAlumno: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const acuerdo: AcuerdoResponse = {
  id: 4,
  alumnoId: 3,
  fecha: '2026-04-01',
  tipo: 'compromiso',
  descripcion: 'El alumno se compromete a recuperar asistencias.',
  estado: 'vigente',
};

describe('AcuerdosController', () => {
  let controller: AcuerdosController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AcuerdosController],
      providers: [AcuerdosService],
    })
      .overrideProvider(AcuerdosService)
      .useValue(mockService)
      .compile();
    controller = module.get(AcuerdosController);
    service = module.get(AcuerdosService);
  });

  it('findByAlumno delega alumnoId con la paginación del query', async () => {
    const esperado: PaginatedResult<AcuerdoResponse> = {
      data: [acuerdo],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    };
    service.findByAlumno.mockResolvedValue(esperado);
    const query: PaginacionQueryDto = { page: 2, limit: 5 };

    const result = await controller.findByAlumno(3, query);

    expect(service.findByAlumno).toHaveBeenCalledWith(3, 2, 5);
    expect(result).toEqual(esperado);
  });

  it('findByAlumno sin query usa page=1 y limit=10 por defecto', async () => {
    service.findByAlumno.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await controller.findByAlumno(3, {});

    expect(service.findByAlumno).toHaveBeenCalledWith(3, 1, 10);
  });

  it('create delega el DTO completo', async () => {
    const dto: CrearAcuerdoDto = {
      alumnoId: 3,
      tipo: 'compromiso',
      descripcion: 'El alumno se compromete a recuperar asistencias.',
    };
    service.create.mockResolvedValue({ id: 4, ...dto });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject({ id: 4, tipo: 'compromiso' });
  });

  it('update delega id y el DTO parcial', async () => {
    const dto: ActualizarAcuerdoDto = { estado: 'cumplido' };
    service.update.mockResolvedValue({ ...acuerdo, estado: 'cumplido' });

    const result = await controller.update(4, dto);

    expect(service.update).toHaveBeenCalledWith(4, dto);
    expect(result).toMatchObject({ id: 4, estado: 'cumplido' });
  });
});
