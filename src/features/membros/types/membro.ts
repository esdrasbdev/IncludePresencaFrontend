export interface Membro {
  id: number;
  nome: string;
  numero?: string;
  email: string;
  cargo: string;
  area: string;
  /** Percentual de assiduidade; `null` para membro inativo/sem histórico. */
  assiduidade: number | null;
  ativo: boolean;
}

export interface CriarMembroPayload {
  nome: string;
  numero: string;
  email: string;
  setor: string;
  cargo: string;
}

export type AtualizarMembroPayload = CriarMembroPayload;
