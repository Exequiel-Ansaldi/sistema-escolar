import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CursoMateriaService } from './curso-materia.service';
import { AsignarMateriaCursoDto } from './dto/asignar-materia-curso.dto';
import { ActualizarCargaHorariaDto } from './dto/actualizar-carga-horaria.dto';
import { FiltrarCursoMateriaDto } from './dto/filtrar-curso-materia.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('cursos-materias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.VICERRECTOR)
export class CursoMateriaController {
  constructor(private service: CursoMateriaService) {}

  @Get()
  findAll(@Query() query: FiltrarCursoMateriaDto) {
    return this.service.findAll(
      query.anio,
      query.division,
      query.turno,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get('grupos')
  findGrupos(@Query() query: FiltrarCursoMateriaDto) {
    return this.service.findGrupos(
      query.anio,
      query.division,
      query.turno,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get('curso/:cursoId')
  findByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.service.findByCurso(cursoId);
  }

  @Post()
  asignar(@Body() dto: AsignarMateriaCursoDto) {
    return this.service.asignar(dto);
  }

  @Patch(':cursoId/:materiaId')
  actualizarCarga(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Param('materiaId', ParseIntPipe) materiaId: number,
    @Body() dto: ActualizarCargaHorariaDto,
  ) {
    return this.service.actualizarCarga(cursoId, materiaId, dto);
  }

  @Delete(':cursoId/:materiaId')
  quitar(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Param('materiaId', ParseIntPipe) materiaId: number,
  ) {
    return this.service.quitar(cursoId, materiaId);
  }
}
