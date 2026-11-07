import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar, frequenciaMock, historicoMock } from "../../../mocks/dados";
import type { RegistroHistorico } from "../../presencas/types/presenca";

export interface FrequenciaIndividual {
  totalEventos: number;
  presencas: number;
  faltasJustificadas: number;
  faltasNaoJustificadas: number;
  /** Opcional até o contrato confirmar o campo. */
  atrasos?: number;
  percentual: number;
}

// Os campos seguem o exemplo ilustrativo do contrato preliminar.
// Confirmar o formato definitivo com o backend.
export const frequenciaService = {
  async obterMinhaFrequencia(): Promise<FrequenciaIndividual> {
    if (env.useMocks) {
      await esperar();
      return frequenciaMock;
    }
    const { data } = await api.get<FrequenciaIndividual>("/me/frequencia");
    return data;
  },

  async obterMeuHistorico(params?: { dias?: number }): Promise<RegistroHistorico[]> {
    if (env.useMocks) {
      await esperar();
      return historicoMock;
    }
    const { data } = await api.get<RegistroHistorico[]>("/me/presencas", { params });
    return data;
  },
};
