import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { SeguimientoService } from './seguimiento.service';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';

@Controller('seguimientos')
export class SeguimientoController {
  constructor(private service: SeguimientoService) {}

  @Get('alumno/:alumnoId')
  findByAlumno(
    @Param('alumnoId', ParseIntPipe) id: number,
    @Query() query: PaginacionQueryDto,
  ) {
    return this.service.findByAlumno(id, query.page ?? 1, query.limit ?? 10);
  }

  @Post()
  create(@Body() dto: CrearSeguimientoDto) {
    return this.service.create(dto);
  }
}
