export type StatusPresenca =
  | "PRESENTE"
  | "ATRASO"
  | "FALTA_JUSTIFICADA"
  | "FALTA_NAO_JUSTIFICADA";

/** "AGUARDANDO" é um estado de exibição: evento aberto em que o membro ainda não registrou presença. */
export type StatusHistorico = StatusPresenca | "AGUARDANDO";

export interface Presenca {
  membroId: string;
  status: StatusHistorico;
}

export interface CheckinPayload {
  codigo: string;
}

export interface AtualizarPresencaPayload {
  status: StatusPresenca;
  /** Texto da justificativa, quando a correção for para falta justificada. */
  justificativa?: string;
}

export interface CorrigirPresencaPayload {
  status: Exclude<StatusPresenca, "ATRASO">;
  motivoAdministrativo: string;
  registradaEmUtc?: string;
  justificativa?: string;
  justificadaEmUtc?: string;
}

// Formato assumido para GET /me/presencas — confirmar com o módulo de check-in.
export interface RegistroHistorico {
  id: string;
  eventoId: string;
  titulo: string;
  inicioEm: string;
  terminoEm: string | null;
  registradoEm: string | null;
  status: StatusHistorico;
  observacao: string | null;
}
