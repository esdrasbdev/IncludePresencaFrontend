export interface Membro {
  /** Identificador do backend (Guid em texto). */
  id: string;
  nome: string;
  numero?: string;
  email: string;
  cargo: string;
  /** Setor. Vazio quando o backend não informa (a tela mostra "—"). */
  area: string;
  /** Percentual de assiduidade; `null` para membro inativo/sem histórico. */
  assiduidade: number | null;
  ativo: boolean;
  /** Conta criada, mas ainda não ativada pelo próprio membro (só com a API real). */
  pendente?: boolean;
}

export interface CriarMembroPayload {
  nome: string;
  numero: string;
  email: string;
  setor: string;
  cargo: string;
}

export type AtualizarMembroPayload = CriarMembroPayload;
