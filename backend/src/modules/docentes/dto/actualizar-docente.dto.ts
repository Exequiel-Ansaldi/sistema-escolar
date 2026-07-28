import { PartialType } from '@nestjs/mapped-types';
import { CrearDocenteDto } from './crear-docente.dto';

export class ActualizarDocenteDto extends PartialType(CrearDocenteDto) {}