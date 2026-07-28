import { Controller, Get, Post, Patch, Delete, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { CursoMateriaService } from './curso-materia.service';
import { AsignarMateriaCursoDto } from './dto/asignar-materia-curso.dto';

@Controller('cursos-materias')
export class CursoMateriaController {
  constructor(private service: CursoMateriaService) {}

  @Get()
  findAll(@Query('anio') anio?: string, @Query('division') division?: string, @Query('turno') turno?: string) {
    return this.service.findAll(anio, division, turno);
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
    @Body() body: { cargaHoraria?: number; modulosPorSemana?: number },
  ) {
    return this.service.actualizarCarga(cursoId, materiaId, body);
  }

  @Delete(':cursoId/:materiaId')
  quitar(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Param('materiaId', ParseIntPipe) materiaId: number,
  ) {
    return this.service.quitar(cursoId, materiaId);
  }
}
