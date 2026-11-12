import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar } from "../../../mocks/dados";
import { membrosMock } from "../../../mocks/diretoria";
import { corpoDoMembro, membroDaApi, type MembroApi } from "../lib/membroApi";
import type { AtualizarMembroPayload, CriarMembroPayload, Membro } from "../types/membro";

let membros: Membro[] = membrosMock.map((m) => ({ ...m }));

// Backend (módulo de identidade, só Diretoria): GET|POST /api/members, GET|PUT /api/members/{id},
// POST /api/members/{id}/resend-activation e PATCH /api/members/{id}/deactivate|reactivate.
// Número e setor não existem no backend e não são enviados. Veja features/membros/lib/membroApi.ts.
export const membrosService = {
  async listar(): Promise<Membro[]> {
    if (env.mocks.membros) {
      await esperar();
      return membros;
    }
    const { data } = await api.get<MembroApi[]>("/members");
    return data.map(membroDaApi);
  },

  /** Consulta um membro (GET /api/members/{id}, só Diretoria). Ainda sem tela que use; o serviço já está pronto. */
  async buscarPorId(membroId: string): Promise<Membro> {
    if (env.mocks.membros) {
      await esperar();
      const encontrado = membros.find((m) => m.id === membroId);
      if (!encontrado) throw new Error("Membro não encontrado.");
      return encontrado;
    }
    const { data } = await api.get<MembroApi>(`/members/${membroId}`);
    return membroDaApi(data);
  },

  /** Cria a conta pendente e o backend envia o e-mail de ativação. */
  async criar(payload: CriarMembroPayload): Promise<{ id: string | number }> {
    if (env.mocks.membros) {
      await esperar(600);
      const novo: Membro = {
        id: String(Date.now()),
        nome: payload.nome,
        numero: payload.numero,
        email: payload.email,
        cargo: payload.cargo,
        area: payload.setor,
        assiduidade: 100,
        ativo: true,
      };
      membros = [...membros, novo];
      return { id: novo.id };
    }
    const { data } = await api.post<{ id: string }>("/members", corpoDoMembro(payload));
    return data;
  },

  async reenviarConvite(membroId: string): Promise<void> {
    if (env.mocks.membros) {
      await esperar(300);
      return;
    }
    await api.post(`/members/${membroId}/resend-activation`);
  },

  async atualizar(membroId: string, payload: AtualizarMembroPayload): Promise<Membro> {
    if (env.mocks.membros) {
      await esperar(600);
      const atual = membros.find((m) => m.id === membroId);
      if (!atual) throw new Error("Membro não encontrado.");
      const atualizado: Membro = { ...atual, ...payload, area: payload.setor, numero: payload.numero };
      membros = membros.map((m) => (m.id === membroId ? atualizado : m));
      return atualizado;
    }
    const { data } = await api.put<MembroApi>(`/members/${membroId}`, corpoDoMembro(payload));
    return membroDaApi(data);
  },

  async alterarStatus(membroId: string, ativo: boolean): Promise<void> {
    if (env.mocks.membros) {
      await esperar(300);
      membros = membros.map((m) => (m.id === membroId ? { ...m, ativo, assiduidade: ativo ? (m.assiduidade ?? 0) : m.assiduidade } : m));
      return;
    }
    await api.patch(`/members/${membroId}/${ativo ? "reactivate" : "deactivate"}`);
  },
};
