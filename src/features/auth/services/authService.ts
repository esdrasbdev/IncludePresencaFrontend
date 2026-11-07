import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar, usuarioMock } from "../../../mocks/dados";
import type { CadastroPayload, LoginPayload, UsuarioAtual } from "../types/auth";

// POST /auth/login e GET /me já estavam definidos no repositório.
// /auth/cadastro e /auth/esqueci-senha são suposições para as telas novas — confirmar com o backend.
export const authService = {
  async login(payload: LoginPayload) {
    if (env.useMocks) {
      await esperar(600);
      return { ok: true };
    }
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  async cadastrar(payload: CadastroPayload) {
    if (env.useMocks) {
      await esperar(600);
      return { ok: true };
    }
    const { data } = await api.post("/auth/cadastro", payload);
    return data;
  },

  async solicitarRedefinicaoSenha(payload: { email: string }) {
    if (env.useMocks) {
      await esperar(600);
      return { ok: true };
    }
    const { data } = await api.post("/auth/esqueci-senha", payload);
    return data;
  },

  async obterUsuarioAtual(): Promise<UsuarioAtual> {
    if (env.useMocks) {
      await esperar();
      return usuarioMock;
    }
    const { data } = await api.get<UsuarioAtual>("/me");
    return data;
  },
};
