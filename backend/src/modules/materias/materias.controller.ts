import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MateriasService } from './materias.service';
import { CrearMateriaDto } from './dto/crear-materia.dto';
import { ActualizarMateriaDto } from './dto/actualizar-materia.dto';
import { FiltrarMateriasDto } from './dto/filtrar-materias.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('materias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.VICERRECTOR)
export class MateriasController {
  constructor(private materiasService: MateriasService) {}

  @Get() findAll(@Query() query: FiltrarMateriasDto) {
    return this.materiasService.findAll(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
    );
  }
  @Get(':id') findById(@Param('id', ParseIntPipe) id: number) {
    return this.materiasService.findById(id);
  }
  @Post() create(@Body() dto: CrearMateriaDto) {
    return this.materiasService.create(dto);
  }
  @Put(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarMateriaDto,
  ) {
    return this.materiasService.update(id, dto);
  }
  @Delete(':id') delete(@Param('id', ParseIntPipe) id: number) {
    return this.materiasService.delete(id);
  }
}
