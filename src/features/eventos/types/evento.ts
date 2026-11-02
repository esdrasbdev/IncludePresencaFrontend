export interface Evento {
  id: number;
  titulo: string;
  inicioEm: string;
  toleranciaMinutos: number;
  responsavelId: number;
}

export interface CriarEventoPayload {
  titulo: string;
  inicioEm: string;
  toleranciaMinutos: number;
  responsavelId: number;
}
