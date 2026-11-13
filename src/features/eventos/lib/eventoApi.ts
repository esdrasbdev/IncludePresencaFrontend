import type { Evento } from "../types/evento";

const DURACAO_PADRAO_MS = 2 * 3_600_000;

/** Evento como o backend devolve (GET /api/events): JSON em camelCase, datas em UTC. */
export interface EventoApi {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isCancelled: boolean;
}

/** Corpo de POST /api/events e PUT /api/events/{id}. */
export interface CorpoEventoApi {
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
}

/** O .NET devolve 7 casas decimais nos segundos (`…06.0164229Z`); alguns navegadores só entendem até 3. */
export const isoSeguro = (iso: string) => iso.replace(/(\.\d{3})\d+(?=Z$|[+-]\d{2}:\d{2}$)/, "$1");

/**
 * O backend só aceita datas em UTC (valida `Kind == Utc`). Uma data com deslocamento, como `…-03:00`,
 * chega ao servidor como horário local e é recusada (400). Por isso toda data sai daqui no formato `…Z`.
 */
export function paraUtc(iso: string) {
  const instante = new Date(iso).getTime();
  if (Number.isNaN(instante)) throw new Error("DATA_INVALIDA");
  return new Date(instante).toISOString();
}

export function eventoDaApi(e: EventoApi): Evento {
  return {
    id: e.id,
    titulo: e.title,
    descricao: e.description,
    inicioEm: isoSeguro(e.startsAt),
    terminoEm: isoSeguro(e.endsAt),
    toleranciaMinutos: null,
    responsavelId: null,
    cancelado: e.isCancelled,
  };
}

export function corpoDoEvento(p: {
  titulo: string;
  descricao?: string | null;
  inicioEm: string;
  terminoEm?: string | null;
}): CorpoEventoApi {
  const inicio = paraUtc(p.inicioEm);
  const fim = p.terminoEm ? paraUtc(p.terminoEm) : new Date(new Date(inicio).getTime() + DURACAO_PADRAO_MS).toISOString();
  return { title: p.titulo.trim(), description: p.descricao?.trim() || null, startsAt: inicio, endsAt: fim };
}

/** Evento em andamento agora (não cancelado). Sem término informado, assume 2 h de duração. */
export function eventoEmAndamento(eventos: Evento[], agora = Date.now()): Evento | null {
  return (
    eventos.find((e) => {
      if (e.cancelado) return false;
      const inicio = new Date(e.inicioEm).getTime();
      const termino = e.terminoEm ? new Date(e.terminoEm).getTime() : inicio + DURACAO_PADRAO_MS;
      return agora >= inicio && agora <= termino;
    }) ?? null
  );
}
