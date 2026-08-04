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
import { AlumnosService } from './alumnos.service';
import { CrearAlumnoDto } from './dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from './dto/actualizar-alumno.dto';
import { FiltrarAlumnosDto } from './dto/filtrar-alumnos.dto';

@Controller('alumnos')
export class AlumnosController {
  constructor(private alumnosService: AlumnosService) {}

  @Get()
  findAll(@Query() query: FiltrarAlumnosDto) {
    return this.alumnosService.findAll(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
    );
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.findById(id);
  }

  @Post()
  create(@Body() dto: CrearAlumnoDto) {
    return this.alumnosService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarAlumnoDto,
  ) {
    return this.alumnosService.update(id, dto);
  }

  @Delete(':id')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.disable(id);
  }
}
