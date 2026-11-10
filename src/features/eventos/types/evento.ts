export type StatusEvento = "ABERTO" | "AGENDADO" | "ENCERRADO";

export interface Evento {
  id: number;
  titulo: string;
  inicioEm: string;
  /** Opcional até o contrato confirmar o campo de término. */
  terminoEm?: string | null;
  toleranciaMinutos: number;
  responsavelId: number;
  /** Campos opcionais usados na tela de gestão de eventos (diretoria) — confirmar com o backend. */
  responsavelNome?: string;
  status?: StatusEvento;
  obrigatorio?: boolean;
  /** Percentual médio de presença do evento (apenas encerrados). */
  presencaMedia?: number;
}

export interface CriarEventoPayload {
  titulo: string;
  inicioEm: string;
  terminoEm?: string;
  toleranciaMinutos: number;
  responsavelId?: number;
  obrigatorio?: boolean;
}

export interface ResumoEventos {
  proximoEvento: { titulo: string; inicioEm: string } | null;
  eventosNoMes: number;
  presencaMedia: number;
}
