export type StatusEvento = "ABERTO" | "AGENDADO" | "ENCERRADO" | "CANCELADO";

export interface Evento {
  /** Identificador do backend (Guid em texto). */
  id: string;
  titulo: string;
  descricao?: string | null;
  inicioEm: string;
  /** Opcional até o contrato confirmar o campo de término. */
  terminoEm?: string | null;
  /** O backend de identidade não guarda tolerância: `null` = não informada (a tela mostra "—"). */
  toleranciaMinutos: number | null;
  /** Não existe no backend de identidade: `null` = não informado. */
  responsavelId: string | null;
  /** Campos opcionais usados na tela de gestão de eventos (diretoria) — o backend de identidade não os guarda. */
  responsavelNome?: string;
  /** Presente só nos dados de exemplo; com a API real o status é calculado pelos horários (e por `cancelado`). */
  status?: StatusEvento;
  obrigatorio?: boolean;
  /** Percentual médio de presença do evento (apenas encerrados). */
  presencaMedia?: number;
  cancelado?: boolean;
}

export interface CriarEventoPayload {
  titulo: string;
  descricao?: string;
  inicioEm: string;
  terminoEm?: string;
  /** Enviado só nos dados de exemplo: o backend de identidade ainda não tem este campo. */
  toleranciaMinutos: number;
  responsavelId?: string;
  /** Enviado só nos dados de exemplo: o backend de identidade ainda não tem este campo. */
  obrigatorio?: boolean;
}

export interface ResumoEventos {
  proximoEvento: { titulo: string; inicioEm: string } | null;
  eventosNoMes: number;
  /** `null` = sem dados (o backend ainda não calcula presença média). */
  presencaMedia: number | null;
}
