import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar } from "../../../mocks/dados";
import { painelMock } from "../../../mocks/diretoria";
import { relatoriosService } from "../../relatorios/services/relatoriosService";
import type { PainelDiretoria } from "../types/diretoria";

export const diretoriaService = {
  /** Indicadores + tabela de presenças. Formato assumido — confirmar com o backend. */
  async obterPainel(): Promise<PainelDiretoria> {
    if (env.mocksPendentes) {
      await esperar();
      return painelMock;
    }
    const { data } = await api.get<PainelDiretoria>("/relatorios/frequencia-global");
    return data;
  },

  async exportarCsv(): Promise<Blob> {
    if (env.mocksPendentes) {
      await esperar(300);
      const linhas = [
        "membro;area;presencas;total;atrasos;faltas;frequencia",
        ...painelMock.membros.map((m) =>
          [m.nome, m.area, m.presencas, m.totalEventos, m.atrasos, m.faltas, `${m.frequencia}%`].join(";"),
        ),
      ];
      return new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    }
    return relatoriosService.exportarPresencasCsv();
  },
};
