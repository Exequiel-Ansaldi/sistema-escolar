import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AcuerdosService } from './acuerdos.service';
import { CrearAcuerdoDto } from './dto/crear-acuerdo.dto';
import { ActualizarAcuerdoDto } from './dto/actualizar-acuerdo.dto';
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('acuerdos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.ASESORIA_PEDAGOGICA)
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
