export interface LicenciaResponse {
  id: number;
  docenteId: number;
  fechaInicio: string;
  fechaFin: string;
  codigo: string;
  motivo: string;
  estado: string;
  observacion?: string | null;
}
