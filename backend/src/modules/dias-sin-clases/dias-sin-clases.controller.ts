import { Controller, Get, Post, Delete, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { DiasSinClasesService } from './dias-sin-clases.service';
import { CrearDiaSinClasesDto } from './dto/crear-dia-sin-clases.dto';

@Controller('dias-sin-clases')
export class DiasSinClasesController {
  constructor(private service: DiasSinClasesService) {}

  @Get()
  listar(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('cursoId') cursoId?: string,
  ) {
    return this.service.listar(desde, hasta, cursoId);
  }

  @Post()
  crear(@Body() dto: CrearDiaSinClasesDto) {
    return this.service.crear(dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
