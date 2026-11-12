import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar } from "../../../mocks/dados";
import { painelMock } from "../../../mocks/diretoria";
import { relatoriosService } from "../../relatorios/services/relatoriosService";
import type { PainelDiretoria } from "../types/diretoria";

/** Aplica valores seguros a campos ausentes ou nulos (o formato real do painel ainda não foi confirmado). */
function normalizarPainel(d: Partial<PainelDiretoria>): PainelDiretoria {
  return {
    frequenciaGlobal: typeof d.frequenciaGlobal === "number" ? d.frequenciaGlobal : null,
    membrosAtivos: d.membrosAtivos ?? 0,
    abaixoDaMeta: d.abaixoDaMeta ?? 0,
    membros: (d.membros ?? []).map((m) => ({
      ...m,
      id: String(m.id),
      area: m.area ?? "",
      presencas: m.presencas ?? 0,
      totalEventos: m.totalEventos ?? 0,
      atrasos: m.atrasos ?? 0,
      faltas: m.faltas ?? 0,
      frequencia: typeof m.frequencia === "number" ? m.frequencia : null,
    })),
  };
}

export const diretoriaService = {
  /** Indicadores + tabela de presenças. Formato assumido — o módulo de relatórios ainda não existe no backend. */
  async obterPainel(): Promise<PainelDiretoria> {
    if (env.mocks.relatorios) {
      await esperar();
      return painelMock;
    }
    const { data } = await api.get<Partial<PainelDiretoria>>("/relatorios/frequencia-global");
    return normalizarPainel(data);
  },

  async exportarCsv(): Promise<Blob> {
    if (env.mocks.relatorios) {
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
