import { api } from "../../../services/api";

export const relatoriosService = {
  async obterFrequenciaGlobal() {
    const { data } = await api.get("/relatorios/frequencia-global");
    return data;
  },

  async listarPresencas(params?: Record<string, string | number | boolean>) {
    const { data } = await api.get("/relatorios/presencas", { params });
    return data;
  },

  async exportarPresencasCsv(params?: Record<string, string | number | boolean>) {
    const response = await api.get("/relatorios/presencas.csv", {
      params,
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
