import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LicenciasService } from './licencias.service';
import { CrearLicenciaDto } from './dto/crear-licencia.dto';
import { ActualizarLicenciaDto } from './dto/actualizar-licencia.dto';
import { FiltrarLicenciasDto } from './dto/filtrar-licencias.dto';

@Controller('licencias')
export class LicenciasController {
  constructor(private licenciasService: LicenciasService) {}

  @Get('docente/:docenteId')
  findByDocente(
    @Param('docenteId', ParseIntPipe) id: number,
    @Query() query: FiltrarLicenciasDto,
  ) {
    return this.licenciasService.findByDocente(
      id,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @Post()
  create(@Body() dto: CrearLicenciaDto) {
    return this.licenciasService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarLicenciaDto,
  ) {
    return this.licenciasService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.licenciasService.delete(id);
  }
}
