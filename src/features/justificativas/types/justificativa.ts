export type MotivoFalta = "SAUDE" | "TRABALHO_ESTUDOS" | "PROBLEMAS_TECNICOS" | "OUTRO";

export const MOTIVOS: Array<{ valor: MotivoFalta; rotulo: string }> = [
  { valor: "SAUDE", rotulo: "Saúde" },
  { valor: "TRABALHO_ESTUDOS", rotulo: "Trabalho ou estudos" },
  { valor: "PROBLEMAS_TECNICOS", rotulo: "Problemas técnicos" },
  { valor: "OUTRO", rotulo: "Outro" },
];

export type StatusJustificativa = "EM_ANALISE" | "APROVADA" | "REJEITADA";

// Contratos assumidos para justificativas — o módulo ainda não existe no backend; confirmar antes de integrar.
export interface FaltaPendente {
  id: string;
  titulo: string;
  inicioEm: string;
  prazoEm: string;
}

export interface MinhaJustificativa {
  id: string;
  titulo: string;
  dataFalta: string;
  enviadaEm: string;
  status: StatusJustificativa;
  anexoNome?: string;
}

export interface EnviarJustificativaPayload {
  faltaId: string;
  motivo: MotivoFalta;
  descricao: string;
  anexo?: File | null;
}

export interface JustificativaFila {
  id: string;
  membroNome: string;
  membroArea: string;
  membroCargo: string;
  titulo: string;
  eventoInicioEm: string;
  eventoTerminoEm: string | null;
  eventoObrigatorio: boolean;
  enviadaEm: string;
  status: StatusJustificativa;
  motivo: string;
  descricao: string;
  anexoNome?: string;
  dentroDoPrazo: boolean;
  membroFrequencia: number;
  faltasJustificadas: number;
  faltasPendentes: number;
}

export type DecisaoJustificativa = "APROVAR" | "REJEITAR";
