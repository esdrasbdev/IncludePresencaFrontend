import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar, eventoAbertoMock } from "../../../mocks/dados";
import { eventosDiretoriaMock, resumoEventosMock } from "../../../mocks/diretoria";
import type { CriarEventoPayload, Evento, ResumoEventos } from "../types/evento";

const DURACAO_PADRAO_MINUTOS = 120;

// Estado em memória usado apenas no modo de exemplo.
let eventosMock: Evento[] = [...eventosDiretoriaMock];

export const eventosService = {
  async listar(): Promise<Evento[]> {
    if (env.mocksPendentes) {
      await esperar();
      return eventosMock;
    }
    const { data } = await api.get<Evento[]>("/eventos");
    return data;
  },

  async buscarPorId(eventoId: number): Promise<Evento> {
    const { data } = await api.get<Evento>(`/eventos/${eventoId}`);
    return data;
  },

  async criar(payload: CriarEventoPayload): Promise<Evento> {
    if (env.mocksPendentes) {
      await esperar(600);
      const novo: Evento = {
        id: Date.now(),
        titulo: payload.titulo,
        inicioEm: payload.inicioEm,
        terminoEm: payload.terminoEm,
        toleranciaMinutos: payload.toleranciaMinutos,
        responsavelId: payload.responsavelId ?? 0,
        responsavelNome: "Giovanna Alencar",
        status: "AGENDADO",
        obrigatorio: payload.obrigatorio,
      };
      eventosMock = [novo, ...eventosMock];
      return novo;
    }
    const { data } = await api.post<Evento>("/eventos", payload);
    return data;
  },

  async atualizar(eventoId: number, payload: Partial<CriarEventoPayload>): Promise<Evento> {
    const { data } = await api.patch<Evento>(`/eventos/${eventoId}`, payload);
    return data;
  },

  /** Indicadores do topo da tela de eventos (endpoint assumido — confirmar com o backend). */
  async obterResumo(): Promise<ResumoEventos> {
    if (env.mocksPendentes) {
      await esperar();
      return resumoEventosMock;
    }
    const { data } = await api.get<ResumoEventos>("/eventos/resumo");
    return data;
  },

  /**
   * Evento em andamento neste momento (derivado de GET /eventos).
   * Sem campo de término no contrato, assume duração padrão de 2h.
   */
  async obterEventoAberto(): Promise<Evento | null> {
    if (env.mocksPendentes) {
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
