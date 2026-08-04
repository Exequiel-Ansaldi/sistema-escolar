import { PartialType } from '@nestjs/mapped-types';
import { CrearLicenciaDto } from './crear-licencia.dto';

export class ActualizarLicenciaDto extends PartialType(CrearLicenciaDto) {}
