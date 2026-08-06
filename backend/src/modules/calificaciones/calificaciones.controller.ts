import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';
import { ActualizarCalificacionDto } from './dto/actualizar-calificacion.dto';
import { FiltrarCalificacionesDto } from './dto/filtrar-calificaciones.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('calificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.PRECEPTOR_MANANA)
export class CalificacionesController {
  constructor(private calificacionesService: CalificacionesService) {}

  @Get('alumno/:alumnoId')
  findByAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Query() query: FiltrarCalificacionesDto,
  ) {
    return this.calificacionesService.findByAlumno(
      alumnoId,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Get('alumno/:alumnoId/promedio')
  promedio(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.calificacionesService.promedio(alumnoId);
  }

  @Get('alumno/:alumnoId/promedio-trimestre')
  promedioPorTrimestre(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.calificacionesService.promedioPorTrimestre(alumnoId);
  }

  @Get('alumno/:alumnoId/promedio-materia')
  promedioPorMateria(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.calificacionesService.promedioPorMateria(alumnoId);
  }

  @Get('alumno/:alumnoId/materia/:materiaId')
  findByAlumnoYMateria(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('materiaId', ParseIntPipe) materiaId: number,
  ) {
    return this.calificacionesService.findByAlumnoYMateria(alumnoId, materiaId);
  }

  @Post()
  create(@Body() dto: CrearCalificacionDto) {
    return this.calificacionesService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCalificacionDto,
  ) {
    return this.calificacionesService.update(id, dto);
  }
}
