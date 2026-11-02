import { api } from "../../../services/api";
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
