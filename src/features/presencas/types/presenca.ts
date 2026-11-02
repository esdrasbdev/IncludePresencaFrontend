export type StatusPresenca =
  | "PRESENTE"
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
