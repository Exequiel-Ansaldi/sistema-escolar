export interface RolResponse {
  id: number;
  nombreRol: string;
}

export interface UsuarioResponse {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  rolId: number;
  rol?: RolResponse;
}
