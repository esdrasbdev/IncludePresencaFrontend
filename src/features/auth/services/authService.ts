import { api } from "../../../services/api";

// Payload e resposta ainda precisam ser definidos pelo backend.
export const authService = {
  async login(payload: { [key: string]: unknown }) {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  async obterUsuarioAtual() {
    const { data } = await api.get("/me");
    return data;
  },
};
