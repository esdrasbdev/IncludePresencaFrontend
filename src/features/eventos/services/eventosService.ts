import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar, eventoAbertoMock } from "../../../mocks/dados";
import { eventosDiretoriaMock, resumoEventosMock } from "../../../mocks/diretoria";
import { corpoDoEvento, eventoDaApi, eventoEmAndamento, type EventoApi } from "../lib/eventoApi";
import type { CriarEventoPayload, Evento, ResumoEventos } from "../types/evento";

// Estado em memória usado apenas no modo de exemplo.
let eventosMock: Evento[] = [...eventosDiretoriaMock];

// Backend (módulo de identidade): GET|POST /api/events, GET|PUT /api/events/{id}, PATCH /api/events/{id}/cancel.
// POST/PUT/cancel exigem perfil Diretoria; datas em UTC. Veja features/eventos/lib/eventoApi.ts.
export const eventosService = {
  async listar(): Promise<Evento[]> {
    if (env.mocks.eventos) {
      await esperar();
      return eventosMock;
    }
    const { data } = await api.get<EventoApi[]>("/events");
    // Mais recentes primeiro (mesma ordem que o evento recém-criado ocupa nos dados de exemplo).
    return data.map(eventoDaApi).sort((a, b) => new Date(b.inicioEm).getTime() - new Date(a.inicioEm).getTime());
  },

  async buscarPorId(eventoId: string): Promise<Evento> {
    if (env.mocks.eventos) {
      await esperar();
      const encontrado = eventosMock.find((e) => e.id === eventoId);
      if (!encontrado) throw new Error("Evento não encontrado.");
      return encontrado;
    }
    const { data } = await api.get<EventoApi>(`/events/${eventoId}`);
    return eventoDaApi(data);
  },

  async criar(payload: CriarEventoPayload): Promise<Evento> {
    if (env.mocks.eventos) {
      await esperar(600);
      const novo: Evento = {
        id: String(Date.now()),
        titulo: payload.titulo,
        inicioEm: payload.inicioEm,
        terminoEm: payload.terminoEm,
        toleranciaMinutos: payload.toleranciaMinutos,
        responsavelId: payload.responsavelId ?? null,
        responsavelNome: "Giovanna Alencar",
        status: "AGENDADO",
        obrigatorio: payload.obrigatorio,
      };
      eventosMock = [novo, ...eventosMock];
      return novo;
    }
    const { data } = await api.post<EventoApi>("/events", corpoDoEvento(payload));
    return eventoDaApi(data);
  },

  /** O backend usa PUT (substitui o evento inteiro), então os campos não informados vêm do evento atual. */
  async atualizar(eventoId: string, payload: Partial<CriarEventoPayload>): Promise<Evento> {
    if (env.mocks.eventos) {
      await esperar(600);
      const atual = eventosMock.find((e) => e.id === eventoId);
      if (!atual) throw new Error("Evento não encontrado.");
      const atualizado: Evento = { ...atual, ...payload };
      eventosMock = eventosMock.map((e) => (e.id === eventoId ? atualizado : e));
      return atualizado;
    }
    const { data: atual } = await api.get<EventoApi>(`/events/${eventoId}`);
    const corpo = corpoDoEvento({
      titulo: payload.titulo ?? atual.title,
      descricao: payload.descricao ?? atual.description,
      inicioEm: payload.inicioEm ?? atual.startsAt,
      terminoEm: payload.terminoEm ?? atual.endsAt,
    });
    const { data } = await api.put<EventoApi>(`/events/${eventoId}`, corpo);
    return eventoDaApi(data);
  },

  /** Cancela o evento (Diretoria). */
  async cancelar(eventoId: string): Promise<void> {
    if (env.mocks.eventos) {
      await esperar(300);
      eventosMock = eventosMock.map((e) => (e.id === eventoId ? { ...e, cancelado: true } : e));
      return;
    }
    await api.patch(`/events/${eventoId}/cancel`);
  },

  /** Indicadores do topo da tela de eventos (GET /api/events/summary, somente Diretoria). */
  async obterResumo(): Promise<ResumoEventos> {
    if (env.mocks.eventos) {
      await esperar();
      return resumoEventosMock;
    }
    const { data } = await api.get<ResumoEventos>("/events/summary");
    return data;
  },

  /** Evento em andamento neste momento (derivado da listagem; ignora eventos cancelados). */
  async obterEventoAberto(): Promise<Evento | null> {
    if (env.mocks.eventos) {
      await esperar();
      return eventoAbertoMock;
    }
    return eventoEmAndamento(await eventosService.listar());
  },
};
