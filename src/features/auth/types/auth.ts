// Contratos assumidos para as telas de acesso — confirmar com o backend.
export interface LoginPayload {
  email: string;
  senha: string;
}

export interface CadastroPayload {
  nome: string;
  numero: string;
  setor: string;
  email: string;
  senha: string;
}

export interface UsuarioAtual {
  nome: string;
  setor?: string;
}
