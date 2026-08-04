import { Controller, Post, Delete, Body } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { AsignarMateriaDto } from './dto/asignar-materia.dto';

@Controller('docentes-materias')
export class DocenteMateriaController {
  constructor(private docentesService: DocentesService) {}

  @Post()
  asignar(@Body() dto: AsignarMateriaDto) {
    return this.docentesService.asignarMateria(dto);
  }

  @Delete()
  quitar(@Body() dto: AsignarMateriaDto) {
    return this.docentesService.quitarMateria(dto);
  }
}
