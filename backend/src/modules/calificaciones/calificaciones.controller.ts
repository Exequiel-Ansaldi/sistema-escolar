import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';

@Controller('calificaciones')
export class CalificacionesController {
  constructor(private calificacionesService: CalificacionesService) {}

  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.calificacionesService.findByAlumno(alumnoId);
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
}