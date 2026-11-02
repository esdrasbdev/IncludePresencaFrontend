import { api } from "../../../services/api";

export interface FrequenciaIndividual {
  totalEventos: number;
  presencas: number;
  faltasJustificadas: number;
  faltasNaoJustificadas: number;
  percentual: number;
}

// Os campos seguem o exemplo ilustrativo do contrato preliminar.
// Confirmar o formato definitivo com o backend.
export const frequenciaService = {
  async obterMinhaFrequencia(): Promise<FrequenciaIndividual> {
    const { data } = await api.get<FrequenciaIndividual>("/me/frequencia");
    return data;
  },

  async obterMeuHistorico() {
    const { data } = await api.get("/me/presencas");
    return data;
  },
};
