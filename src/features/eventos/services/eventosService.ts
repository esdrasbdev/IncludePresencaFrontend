import { api } from "../../../services/api";
import type { CriarEventoPayload, Evento } from "../types/evento";

export const eventosService = {
  async listar(): Promise<Evento[]> {
    const { data } = await api.get<Evento[]>("/eventos");
    return data;
  },

  async buscarPorId(eventoId: number): Promise<Evento> {
    const { data } = await api.get<Evento>(`/eventos/${eventoId}`);
    return data;
  },

  async criar(payload: CriarEventoPayload): Promise<Evento> {
    const { data } = await api.post<Evento>("/eventos", payload);
    return data;
  },

  async atualizar(eventoId: number, payload: Partial<CriarEventoPayload>): Promise<Evento> {
    const { data } = await api.patch<Evento>(`/eventos/${eventoId}`, payload);
    return data;
  },
};
