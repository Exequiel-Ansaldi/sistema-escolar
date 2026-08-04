export interface LoginUsuarioResponse {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export interface LoginResponse {
  accessToken: string;
  usuario: LoginUsuarioResponse;
}
