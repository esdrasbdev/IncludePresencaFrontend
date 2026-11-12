import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar, frequenciaMock, historicoMock } from "../../../mocks/dados";
import { statusPresencaDaApi } from "../../presencas/lib/statusPresenca";
import type { RegistroHistorico } from "../../presencas/types/presenca";

export interface FrequenciaIndividual {
  totalEventos: number;
  presencas: number;
  faltasJustificadas: number;
  faltasNaoJustificadas: number;
  /** Opcional até o contrato confirmar o campo. */
  atrasos?: number;
  /** `null` = sem dados (membro sem eventos ainda). A tela mostra "—", nunca 0%. */
  percentual: number | null;
}

// Os campos seguem o exemplo ilustrativo do contrato preliminar.
// Confirmar o formato definitivo com o módulo de check-in.
export const frequenciaService = {
  async obterMinhaFrequencia(): Promise<FrequenciaIndividual> {
    if (env.mocks.frequencia) {
      await esperar();
      return frequenciaMock;
    }
    const { data } = await api.get<Partial<FrequenciaIndividual>>("/me/frequencia");
    return {
      totalEventos: data.totalEventos ?? 0,
      presencas: data.presencas ?? 0,
      faltasJustificadas: data.faltasJustificadas ?? 0,
      faltasNaoJustificadas: data.faltasNaoJustificadas ?? 0,
      atrasos: data.atrasos,
      percentual: typeof data.percentual === "number" ? data.percentual : null,
    };
  },

  async obterMeuHistorico(params?: { dias?: number }): Promise<RegistroHistorico[]> {
    if (env.mocks.frequencia) {
      await esperar();
      return historicoMock;
    }
    const { data } = await api.get<RegistroHistorico[]>("/me/presencas", { params });
    return data.map((r) => ({
      ...r,
      id: String(r.id),
      eventoId: String(r.eventoId),
      terminoEm: r.terminoEm ?? null,
      registradoEm: r.registradoEm ?? null,
      observacao: r.observacao ?? null,
      status: statusPresencaDaApi(r.status),
    }));
  },
};
