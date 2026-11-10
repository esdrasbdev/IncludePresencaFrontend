import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar } from "../../../mocks/dados";
import { membrosMock } from "../../../mocks/diretoria";
import type { AtualizarMembroPayload, CriarMembroPayload, Membro } from "../types/membro";

let membros: Membro[] = membrosMock.map((m) => ({ ...m }));

/** Perfil do backend (enum Role: Membro = 1, Diretoria = 2). Diretor(a) e Admin viram Diretoria. */
const roleDoCargo = (cargo: string) => (cargo === "Membro" ? 1 : 2);

// Backend: POST /api/members { name, email, role } (só Diretoria) e POST /api/members/{id}/resend-activation.
// Ainda NÃO existem no backend: listar, editar e inativar membros — essas chamadas seguem com dados de exemplo
// (VITE_MOCK_MODULOS_PENDENTES) e usam rotas assumidas quando a flag é desativada.
export const membrosService = {
  async listar(): Promise<Membro[]> {
    if (env.mocksPendentes) {
      await esperar();
      return membros;
    }
    const { data } = await api.get<Membro[]>("/membros");
    return data;
  },

  /** Cria a conta pendente e o backend envia o e-mail de ativação. `numero` e `setor` ainda não existem no backend. */
  async criar(payload: CriarMembroPayload): Promise<{ id: string | number }> {
    if (env.useMocks) {
      await esperar(600);
      const novo: Membro = {
        id: Date.now(),
        nome: payload.nome,
        numero: payload.numero,
        email: payload.email,
        cargo: payload.cargo,
        area: payload.setor,
        assiduidade: 100,
        ativo: true,
      };
      membros = [...membros, novo];
      return { id: String(novo.id) };
    }
    const { data } = await api.post<{ id: string }>("/members", {
      name: payload.nome,
      email: payload.email,
      role: roleDoCargo(payload.cargo),
    });
    return data;
  },

  async reenviarConvite(membroId: string): Promise<void> {
    if (env.useMocks) {
      await esperar(300);
      return;
    }
    await api.post(`/members/${membroId}/resend-activation`);
  },

  async atualizar(membroId: number, payload: AtualizarMembroPayload): Promise<Membro> {
    if (env.mocksPendentes) {
      await esperar(600);
      const atual = membros.find((m) => m.id === membroId);
      if (!atual) throw new Error("Membro não encontrado.");
      const atualizado: Membro = { ...atual, ...payload, area: payload.setor, numero: payload.numero };
      membros = membros.map((m) => (m.id === membroId ? atualizado : m));
      return atualizado;
    }
    const { data } = await api.patch<Membro>(`/membros/${membroId}`, payload);
    return data;
  },

  async alterarStatus(membroId: number, ativo: boolean): Promise<void> {
    if (env.mocksPendentes) {
      await esperar(300);
      membros = membros.map((m) => (m.id === membroId ? { ...m, ativo, assiduidade: ativo ? (m.assiduidade ?? 0) : m.assiduidade } : m));
      return;
    }
    await api.patch(`/membros/${membroId}/status`, { ativo });
  },
};
