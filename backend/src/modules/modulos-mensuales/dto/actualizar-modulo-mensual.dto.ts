import { PartialType } from '@nestjs/mapped-types';
import { CrearModuloMensualDto } from './crear-modulo-mensual.dto';

export class ActualizarModuloMensualDto extends PartialType(
  CrearModuloMensualDto,
) {}
