import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { CrearDocenteDto } from './dto/crear-docente.dto';
import { ActualizarDocenteDto } from './dto/actualizar-docente.dto';
import { FiltrarDocentesDto } from './dto/filtrar-docentes.dto';

@Controller('docentes')
export class DocentesController {
  constructor(private docentesService: DocentesService) {}

  @Get()
  findAll(@Query() query: FiltrarDocentesDto) {
    return this.docentesService.findAll(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
    );
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.docentesService.findById(id);
  }

  @Post()
  create(@Body() dto: CrearDocenteDto) {
    return this.docentesService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarDocenteDto,
  ) {
    return this.docentesService.update(id, dto);
  }

  @Delete(':id')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.docentesService.disable(id);
  }
}
