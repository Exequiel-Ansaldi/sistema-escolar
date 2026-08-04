import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosRepository } from './repositories/usuarios.repository';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private usuariosRepository: UsuariosRepository) {}

  async findAll(page = 1, limit = 10) {
    return this.usuariosRepository.findAll(page, limit);
  }

  async findById(id: number) {
    const usuario = await this.usuariosRepository.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async create(dto: CrearUsuarioDto) {
    const hashedPassword = await bcrypt.hash(dto.contrasena, 10);
    return this.usuariosRepository.create({
      ...dto,
      contrasena: hashedPassword,
    });
  }

  async update(id: number, dto: ActualizarUsuarioDto) {
    await this.findById(id);
    const data = { ...dto };
    if (dto.contrasena) {
      data.contrasena = await bcrypt.hash(dto.contrasena, 10);
    }
    return this.usuariosRepository.update(id, data);
  }

  async disable(id: number) {
    await this.findById(id);
    return this.usuariosRepository.disable(id);
  }
}
