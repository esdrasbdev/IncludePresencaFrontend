import type { Perfil } from "../../../mocks/sessao";

export type { Perfil };

export interface LoginPayload {
  email: string;
  senha: string;
  manterConectado?: boolean;
}

export interface LoginResposta {
  perfil?: Perfil;
}

/** Define a senha a partir de um token enviado por e-mail (ativação de conta ou redefinição). */
export interface DefinirSenhaPayload {
  token: string;
  senha: string;
}

export type RedefinirSenhaPayload = DefinirSenhaPayload;
export type AtivarContaPayload = DefinirSenhaPayload;

export interface UsuarioAtual {
  nome: string;
  setor?: string;
  perfil?: Perfil;
}
