import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ActasService } from './actas.service';
import { CrearActaDto } from './dto/crear-acta.dto';
import { FiltrarActasDto } from './dto/filtrar-actas.dto';

@Controller('actas')
export class ActasController {
  constructor(private service: ActasService) {}

  @Get('alumno/:alumnoId')
  findByAlumno(
    @Param('alumnoId', ParseIntPipe) id: number,
    @Query() query: FiltrarActasDto,
  ) {
    return this.service.findByAlumno(id, query.page ?? 1, query.limit ?? 10);
  }

  @Post()
  create(@Body() dto: CrearActaDto) {
    return this.service.create(dto);
  }
}
