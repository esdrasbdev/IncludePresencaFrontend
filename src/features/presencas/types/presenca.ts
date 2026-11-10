export type StatusPresenca =
  | "PRESENTE"
  | "ATRASO"
  | "FALTA_JUSTIFICADA"
  | "FALTA_NAO_JUSTIFICADA";

export interface Presenca {
  membroId: number;
  status: StatusPresenca;
}

export interface CheckinPayload {
  codigo: string;
}

export interface AtualizarPresencaPayload {
  status: StatusPresenca;
}

/** "AGUARDANDO" é um estado de exibição: evento aberto em que o membro ainda não registrou presença. */
export type StatusHistorico = StatusPresenca | "AGUARDANDO";

// Formato assumido para GET /me/presencas — confirmar com o backend.
export interface RegistroHistorico {
  id: number;
  eventoId: number;
  titulo: string;
  inicioEm: string;
  terminoEm: string | null;
  registradoEm: string | null;
  status: StatusHistorico;
  observacao: string | null;
}
