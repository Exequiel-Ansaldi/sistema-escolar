import { Test } from '@nestjs/testing';
import { MateriasController } from './materias.controller';
import { MateriasService } from './materias.service';
import { CrearMateriaDto } from './dto/crear-materia.dto';
import { ActualizarMateriaDto } from './dto/actualizar-materia.dto';
import { FiltrarMateriasDto } from './dto/filtrar-materias.dto';
import { MateriaResponse } from './dto/materia-response';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. No se testean guards ni pipes (van por integración).
const mockService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const materia: MateriaResponse = { id: 5, nombre: 'Matemática' };

const paginado = (data: MateriaResponse[]): PaginatedResult<MateriaResponse> => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: 1,
});

describe('MateriasController', () => {
  let controller: MateriasController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [MateriasController],
      providers: [MateriasService],
    })
      .overrideProvider(MateriasService)
      .useValue(mockService)
      .compile();
    controller = module.get(MateriasController);
    service = module.get(MateriasService);
  });

  it('findAll pasa page/limit/search al servicio (search indefinido si la query no lo trae)', async () => {
    service.findAll.mockResolvedValue(paginado([materia]));
    const result = await controller.findAll({} as FiltrarMateriasDto);
    expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined);
    expect(result).toEqual(paginado([materia]));
  });

  it('findAll con query completa delega page/limit/search', async () => {
    service.findAll.mockResolvedValue(paginado([]));
    await controller.findAll({ page: 2, limit: 5, search: 'mate' } as FiltrarMateriasDto);
    expect(service.findAll).toHaveBeenCalledWith(2, 5, 'mate');
  });

  it('findById delega el id (ParseIntPipe resuelto por Nest)', async () => {
    service.findById.mockResolvedValue(materia);
    const result = await controller.findById(5);
    expect(service.findById).toHaveBeenCalledWith(5);
    expect(result).toEqual(materia);
  });

  it('create delega el DTO completo', async () => {
    const dto = { nombre: 'Historia' } as CrearMateriaDto;
    service.create.mockResolvedValue({ id: 8, nombre: 'Historia' });
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 8, nombre: 'Historia' });
  });

  it('update delega el id y el DTO', async () => {
    const dto = { nombre: 'Matemática I' } as ActualizarMateriaDto;
    service.update.mockResolvedValue({ id: 5, nombre: 'Matemática I' });
    const result = await controller.update(5, dto);
    expect(service.update).toHaveBeenCalledWith(5, dto);
    expect(result).toMatchObject({ nombre: 'Matemática I' });
  });

  it('delete delega el id al servicio', async () => {
    service.delete.mockResolvedValue(undefined);
    await controller.delete(5);
    expect(service.delete).toHaveBeenCalledWith(5);
  });
});
