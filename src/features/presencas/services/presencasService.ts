import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar } from "../../../mocks/dados";
import type { AtualizarPresencaPayload, CheckinPayload, Presenca } from "../types/presenca";

export const presencasService = {
  async listarPorEvento(eventoId: number): Promise<Presenca[]> {
    const { data } = await api.get<Presenca[]>(`/eventos/${eventoId}/presencas`);
    return data;
  },

  async gerarCodigo(eventoId: number) {
    const { data } = await api.post(`/eventos/${eventoId}/codigos-checkin`);
    return data;
  },

  async confirmarCheckin(eventoId: number, payload: CheckinPayload) {
    if (env.useMocks) {
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
