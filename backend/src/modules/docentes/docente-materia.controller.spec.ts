import { Test } from '@nestjs/testing';
import { DocenteMateriaController } from './docente-materia.controller';
import { DocentesService } from './docentes.service';
import { AsignarMateriaDto } from './dto/asignar-materia.dto';
import { DocenteMateriaResponse } from './dto/docente-materia-response';

// Patrón de la cátedra (§6.3-6.4): controlador real + servicio mock con
// overrideProvider; se verifica el resultado Y los argumentos con los que
// llamó al servicio. No se testean guards ni pipes (van por integración).
// Este controller solo usa asignarMateria/quitarMateria del DocentesService.
const mockService = {
  asignarMateria: jest.fn(),
  quitarMateria: jest.fn(),
};

const dto: AsignarMateriaDto = { docenteId: 4, materiaId: 5 };

const asignacion: DocenteMateriaResponse = { docenteId: 4, materiaId: 5 };

describe('DocenteMateriaController', () => {
  let controller: DocenteMateriaController;
  let service: typeof mockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [DocenteMateriaController],
      providers: [DocentesService],
    })
      .overrideProvider(DocentesService)
      .useValue(mockService)
      .compile();
    controller = module.get(DocenteMateriaController);
    service = module.get(DocentesService);
  });

  it('asignar delega el DTO (docenteId, materiaId) al servicio', async () => {
    service.asignarMateria.mockResolvedValue(asignacion);
    const result = await controller.asignar(dto);
    expect(service.asignarMateria).toHaveBeenCalledWith(dto);
    expect(result).toEqual(asignacion);
  });

  it('quitar delega el DTO (docenteId, materiaId) al servicio', async () => {
    service.quitarMateria.mockResolvedValue(undefined);
    await controller.quitar(dto);
    expect(service.quitarMateria).toHaveBeenCalledWith(dto);
  });
});
