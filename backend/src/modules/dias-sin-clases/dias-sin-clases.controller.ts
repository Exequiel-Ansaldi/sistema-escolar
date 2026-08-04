import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { DiasSinClasesService } from './dias-sin-clases.service';
import { CrearDiaSinClasesDto } from './dto/crear-dia-sin-clases.dto';
import { FiltrarDiasSinClasesDto } from './dto/filtrar-dias-sin-clases.dto';

@Controller('dias-sin-clases')
export class DiasSinClasesController {
  constructor(private service: DiasSinClasesService) {}

  @Get()
  listar(@Query() query: FiltrarDiasSinClasesDto) {
    return this.service.listar(
      query.desde,
      query.hasta,
      query.cursoId,
      query.page ?? 1,
      query.limit ?? 10,
    );
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
