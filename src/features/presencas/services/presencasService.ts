import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar } from "../../../mocks/dados";
import { authService } from "../../auth/services/authService";
import { extrairCodigo, sementeDoId, statusPresencaDaApi } from "../lib/statusPresenca";
import type { AtualizarPresencaPayload, CheckinPayload, CorrigirPresencaPayload, Presenca } from "../types/presenca";

const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código fixo por evento, só para o modo de exemplo (nunca devolve o A7K2XX, que simula código inválido). */
function codigoDeExemplo(eventoId: string) {
  let h = Math.imul(sementeDoId(eventoId) | 0, 2654435761) ^ 0x9e3779b9;
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    codigo += ALFABETO_CODIGO[(h >>> 0) % ALFABETO_CODIGO.length];
  }
  return codigo === "A7K2XX" ? "B7K2XX" : codigo;
}

// O módulo de check-in é de outro desenvolvedor: as rotas abaixo são ASSUMIDAS até o contrato ser confirmado.
export const presencasService = {
  async listarPorEvento(eventoId: string): Promise<Presenca[]> {
    const { data } = await api.get<Array<{ membroId: string; status: unknown }>>(`/eventos/${eventoId}/presencas`);
    return data.map((p) => ({ membroId: String(p.membroId), status: statusPresencaDaApi(p.status) }));
  },

  /** Gera a senha do evento. Exclusivo da Diretoria: o membro só digita a senha (confirmarCheckin). */
  async gerarCodigo(eventoId: string) {
    const { data } = await api.post(`/eventos/${eventoId}/codigos-checkin`);
    return data;
  },

  /** Senha que o diretor vê no modal de detalhes e o membro digita em "Registrar presença". */
  async obterCodigo(eventoId: string): Promise<string> {
    if (env.mocks.presencas) {
      await esperar();
      return codigoDeExemplo(eventoId);
    }
    if (authService.sessao()?.perfil !== "DIRETORIA") throw new Error("SEM_PERMISSAO");
    const codigo = extrairCodigo(await presencasService.gerarCodigo(eventoId));
    if (!codigo) throw new Error("CODIGO_INDISPONIVEL");
    return codigo;
  },

  async confirmarCheckin(eventoId: string, payload: CheckinPayload) {
    if (env.mocks.presencas) {
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

  async atualizarStatus(eventoId: string, membroId: string, payload: AtualizarPresencaPayload) {
    const { data } = await api.patch(`/eventos/${eventoId}/presencas/${membroId}`, {
      status: payload.status === "FALTA_JUSTIFICADA" ? "JustifiedAbsence" : payload.status,
      justification: payload.justificativa,
    });
    return data;
  },

  /** Correção administrativa para uma participação já finalizada. */
  async corrigirStatus(eventoId: string, membroId: string, payload: CorrigirPresencaPayload) {
    const { data } = await api.patch(`/eventos/${eventoId}/presencas/${membroId}/correcao`, {
      status: payload.status === "FALTA_JUSTIFICADA" ? "JustifiedAbsence" : payload.status,
      administrativeReason: payload.motivoAdministrativo,
      checkedInAtUtc: payload.registradaEmUtc,
      absenceJustification: payload.justificativa,
      justifiedAtUtc: payload.justificadaEmUtc,
    });
    return data;
  },
};
