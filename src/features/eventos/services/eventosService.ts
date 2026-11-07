import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar, eventoAbertoMock } from "../../../mocks/dados";
import type { CriarEventoPayload, Evento } from "../types/evento";

const DURACAO_PADRAO_MINUTOS = 120;

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

  /**
   * Evento em andamento neste momento (derivado de GET /eventos).
   * Sem campo de término no contrato, assume duração padrão de 2h.
   */
  async obterEventoAberto(): Promise<Evento | null> {
    if (env.useMocks) {
      await esperar();
      return eventoAbertoMock;
    }
    const eventos = await eventosService.listar();
    const agora = Date.now();
    return (
      eventos.find((evento) => {
        const inicio = new Date(evento.inicioEm).getTime();
        const termino = evento.terminoEm
          ? new Date(evento.terminoEm).getTime()
          : inicio + DURACAO_PADRAO_MINUTOS * 60_000;
        return agora >= inicio && agora <= termino;
      }) ?? null
    );
  },
};
