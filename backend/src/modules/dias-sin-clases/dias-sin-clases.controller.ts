import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DiasSinClasesService } from './dias-sin-clases.service';
import { CrearDiaSinClasesDto } from './dto/crear-dia-sin-clases.dto';
import { FiltrarDiasSinClasesDto } from './dto/filtrar-dias-sin-clases.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';

@Controller('dias-sin-clases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.RECTOR, ROLES.PRECEPTOR_MANANA)
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
