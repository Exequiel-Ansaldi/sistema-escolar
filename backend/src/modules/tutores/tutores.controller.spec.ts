import { Test } from '@nestjs/testing';
import { TutoresController } from './tutores.controller';
import { TutoresService } from './tutores.service';
import { CrearTutorDto } from './dto/crear-tutor.dto';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { TutorResponse } from './dto/tutor-response';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. No se testean guards ni pipes (van por integración).
const mockService = {
  findByAlumno: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

const tutor: TutorResponse = {
  id: 12,
  alumnoId: 7,
  nombre: 'Roberto',
  apellido: 'Acosta',
  dni: '32123456',
};

const paginado = (data: TutorResponse[]): PaginatedResult<TutorResponse> => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('TutoresController', () => {
  let controller: TutoresController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [TutoresController],
      providers: [TutoresService],
    })
      .overrideProvider(TutoresService)
      .useValue(mockService)
      .compile();
    controller = module.get(TutoresController);
    service = module.get(TutoresService);
  });

  it('findByAlumno usa los valores por defecto de paginación', async () => {
    service.findByAlumno.mockResolvedValue(paginado([tutor]));
    const result = await controller.findByAlumno(7, {} as PaginacionQueryDto);
    expect(service.findByAlumno).toHaveBeenCalledWith(7, 1, 10);
    expect(result).toEqual(paginado([tutor]));
  });

  it('findByAlumno pasa page/limit de la query al servicio', async () => {
    service.findByAlumno.mockResolvedValue(paginado([]));
    const query = { page: 2, limit: 5 } as PaginacionQueryDto;
    await controller.findByAlumno(7, query);
    expect(service.findByAlumno).toHaveBeenCalledWith(7, 2, 5);
  });

  it('create delega el DTO completo', async () => {
    const dto = {
      alumnoId: 7,
      nombre: 'Roberto',
      apellido: 'Acosta',
      dni: '32123456',
    } as CrearTutorDto;
    service.create.mockResolvedValue(tutor);
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(tutor);
  });

  it('delete delega el id al servicio', async () => {
    service.delete.mockResolvedValue(undefined);
    await controller.delete(12);
    expect(service.delete).toHaveBeenCalledWith(12);
  });
});
