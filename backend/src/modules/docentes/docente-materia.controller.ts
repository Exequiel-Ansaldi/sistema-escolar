import { Controller, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { AsignarMateriaDto } from './dto/asignar-materia.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('docentes-materias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.SECRETARIA_PERSONAL)
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
