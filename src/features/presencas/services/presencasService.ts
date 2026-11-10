import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar } from "../../../mocks/dados";
import type { AtualizarPresencaPayload, CheckinPayload, Presenca } from "../types/presenca";

const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código fixo por evento, só para o modo de exemplo (nunca devolve o A7K2XX, que simula código inválido). */
function codigoDeExemplo(eventoId: number) {
  let h = Math.imul(eventoId | 0, 2654435761) ^ 0x9e3779b9;
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    codigo += ALFABETO_CODIGO[(h >>> 0) % ALFABETO_CODIGO.length];
  }
  return codigo === "A7K2XX" ? "B7K2XX" : codigo;
}

export const presencasService = {
  async listarPorEvento(eventoId: number): Promise<Presenca[]> {
    const { data } = await api.get<Presenca[]>(`/eventos/${eventoId}/presencas`);
    return data;
  },

  async gerarCodigo(eventoId: number) {
    const { data } = await api.post(`/eventos/${eventoId}/codigos-checkin`);
    return data;
  },

  /** Senha que o membro digita em "Registrar presença". Resposta assumida do backend: `{ codigo: string }`. */
  async obterCodigo(eventoId: number): Promise<string> {
    if (env.mocksPendentes) {
      await esperar();
      return codigoDeExemplo(eventoId);
    }
    const data = (await presencasService.gerarCodigo(eventoId)) as { codigo?: string } | undefined;
    if (!data?.codigo) throw new Error("CODIGO_INDISPONIVEL");
    return data.codigo;
  },

  async confirmarCheckin(eventoId: number, payload: CheckinPayload) {
    if (env.mocksPendentes) {
      await esperar(600);
      // No modo de exemplo, o código A7K2XX simula um código inválido.
      if (payload.codigo.toUpperCase() === "A7K2XX") {
        throw new Error("CODIGO_INVALIDO");
      }
      return { ok: true };
    }
    const { data } = await api.post(`/eventos/${eventoId}/checkin`, payload);
    return data;
  },

  async atualizarStatus(eventoId: number, membroId: number, payload: AtualizarPresencaPayload) {
    const { data } = await api.patch(
      `/eventos/${eventoId}/presencas/${membroId}`,
      payload,
    );
    return data;
  },
};
