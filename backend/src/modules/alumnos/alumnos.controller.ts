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
  UseGuards,
} from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import { CrearAlumnoDto } from './dto/crear-alumno.dto';
import { ActualizarAlumnoDto } from './dto/actualizar-alumno.dto';
import { FiltrarAlumnosDto } from './dto/filtrar-alumnos.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('alumnos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.SECRETARIA_ALUMNADO)
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
