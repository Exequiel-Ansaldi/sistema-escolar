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
  UseGuards,
} from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CrearCursoDto } from './dto/crear-curso.dto';
import { ActualizarCursoDto } from './dto/actualizar-curso.dto';
import { FiltrarCursosDto } from './dto/filtrar-cursos.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('cursos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.VICERRECTOR, ROLES.PRECEPTOR_MANANA)
export class CursosController {
  constructor(private cursosService: CursosService) {}

  @Get()
  findAll(@Query() query: FiltrarCursosDto) {
    return this.cursosService.findAll(query.page ?? 1, query.limit ?? 10, {
      anio: query.anio,
      division: query.division,
      turno: query.turno,
    });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findById(id);
  }

  @Post()
  create(@Body() dto: CrearCursoDto) {
    return this.cursosService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCursoDto,
  ) {
    return this.cursosService.update(id, dto);
  }

  @Delete(':id')
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.disable(id);
  }
}
