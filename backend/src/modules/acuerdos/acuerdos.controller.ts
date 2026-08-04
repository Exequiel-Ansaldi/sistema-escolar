import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { AcuerdosService } from './acuerdos.service';
import { CrearAcuerdoDto } from './dto/crear-acuerdo.dto';
import { ActualizarAcuerdoDto } from './dto/actualizar-acuerdo.dto';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';

@Controller('acuerdos')
export class AcuerdosController {
  constructor(private service: AcuerdosService) {}

  @Get('alumno/:alumnoId')
  findByAlumno(
    @Param('alumnoId', ParseIntPipe) id: number,
    @Query() query: PaginacionQueryDto,
  ) {
    return this.service.findByAlumno(id, query.page ?? 1, query.limit ?? 10);
  }

  @Post()
  create(@Body() dto: CrearAcuerdoDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarAcuerdoDto,
  ) {
    return this.service.update(id, dto);
  }
}
