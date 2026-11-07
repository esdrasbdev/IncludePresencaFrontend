export interface Evento {
  id: number;
  titulo: string;
  inicioEm: string;
  /** Opcional até o contrato confirmar o campo de término. */
  terminoEm?: string | null;
  toleranciaMinutos: number;
  responsavelId: number;
}

export interface CriarEventoPayload {
  titulo: string;
  inicioEm: string;
  toleranciaMinutos: number;
  responsavelId: number;
}
