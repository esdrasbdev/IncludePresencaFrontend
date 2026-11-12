import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar, usuarioMock } from "../../../mocks/dados";
import { definirPerfilMock, perfilMock } from "../../../mocks/sessao";
import { limparSessao, nomeDoEmail, salvarToken, sessaoAtual } from "../lib/sessao";
import type { AtivarContaPayload, LoginPayload, LoginResposta, Perfil, RedefinirSenhaPayload, UsuarioAtual } from "../types/auth";

const diretoriaMock: UsuarioAtual = { nome: "Giovanna Alencar", setor: "Diretoria", perfil: "DIRETORIA" };

// Contrato do backend (ASP.NET, rotas em /api):
//   POST /auth/login            { email, password }   -> { accessToken }
//   POST /auth/activate         { token, password }   -> 204
//   POST /auth/forgot-password  { email }             -> 204
//   POST /auth/reset-password   { token, password }   -> 204
// O backend não tem rota de auto-cadastro: contas são criadas pela Diretoria (POST /members).
export const authService = {
  async login({ email, senha, manterConectado = false }: LoginPayload): Promise<LoginResposta> {
    if (env.useMocks) {
      await esperar(600);
      const perfil: Perfil = email.toLowerCase().includes("diretoria") ? "DIRETORIA" : "MEMBRO";
      definirPerfilMock(perfil);
      return { perfil };
    }
    const { data } = await api.post<{ accessToken: string }>("/auth/login", { email: email.trim(), password: senha });
    salvarToken(data.accessToken, manterConectado);
    return { perfil: sessaoAtual()?.perfil };
  },

  async ativarConta({ token, senha }: AtivarContaPayload) {
    if (env.useMocks) {
      await esperar(600);
      return;
    }
    await api.post("/auth/activate", { token, password: senha });
  },

  async solicitarRedefinicaoSenha(payload: { email: string }) {
    if (env.useMocks) {
      await esperar(600);
      return;
    }
    await api.post("/auth/forgot-password", { email: payload.email.trim() });
  },

  async redefinirSenha({ token, senha }: RedefinirSenhaPayload) {
    if (env.useMocks) {
      await esperar(600);
      return;
    }
    await api.post("/auth/reset-password", { token, password: senha });
  },

  sair() {
    limparSessao();
  },

  /** Perfil/identificador da sessão real (null no modo de exemplo ou sem login). */
  sessao() {
    return env.useMocks ? null : sessaoAtual();
  },

  /**
   * `perfil` só é usado no modo de exemplo para escolher qual usuário simular.
   * O backend não tem GET /me e o JWT traz apenas e-mail e perfil, então o nome vem do e-mail.
   */
  async obterUsuarioAtual(perfil?: Perfil): Promise<UsuarioAtual> {
    if (env.useMocks) {
      await esperar();
      return (perfil ?? perfilMock()) === "DIRETORIA" ? diretoriaMock : { ...usuarioMock, perfil: "MEMBRO" };
    }
    const sessao = sessaoAtual();
    if (!sessao) throw new Error("Sessão não encontrada.");
    return {
      nome: nomeDoEmail(sessao.email),
      nomeProvisorio: true,
      setor: sessao.perfil === "DIRETORIA" ? "Diretoria" : "Membro",
      perfil: sessao.perfil,
    };
  },
};
