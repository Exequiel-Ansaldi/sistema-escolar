import { PartialType } from '@nestjs/mapped-types';
import { CrearAcuerdoDto } from './crear-acuerdo.dto';

export class ActualizarAcuerdoDto extends PartialType(CrearAcuerdoDto) {}
