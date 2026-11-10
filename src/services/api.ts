import axios from "axios";
import { lerToken, limparSessao } from "../features/auth/lib/sessao";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Autenticação: JWT (Bearer) devolvido por POST /api/auth/login.
api.interceptors.request.use((config) => {
  const token = lerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expirado/inválido (JWT dura 1 hora): encerra a sessão e volta ao login.
// Rotas públicas (login, ativação, recuperação de senha) respondem 401/400 por outros motivos e não entram aqui.
const ROTAS_PUBLICAS = ["/auth/"];
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const status = axios.isAxiosError(erro) ? erro.response?.status : undefined;
    const url = axios.isAxiosError(erro) ? (erro.config?.url ?? "") : "";
    const publica = ROTAS_PUBLICAS.some((p) => url.startsWith(p));
    if (status === 401 && !publica && lerToken()) {
      limparSessao();
      window.location.assign("/login");
    }
    return Promise.reject(erro);
  },
);
