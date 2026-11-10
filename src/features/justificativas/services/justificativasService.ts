import { api } from "../../../services/api";
import { env } from "../../../config/env";
import { esperar } from "../../../mocks/dados";
import { faltasPendentesMock, filaJustificativasMock, minhasJustificativasMock } from "../../../mocks/diretoria";
import type {
  DecisaoJustificativa,
  EnviarJustificativaPayload,
  FaltaPendente,
  JustificativaFila,
  MinhaJustificativa,
} from "../types/justificativa";

// Estado em memória usado apenas no modo de exemplo.
let faltas: FaltaPendente[] = [...faltasPendentesMock];
let minhas: MinhaJustificativa[] = [...minhasJustificativasMock];
let fila: JustificativaFila[] = filaJustificativasMock.map((j) => ({ ...j }));

// Endpoints assumidos — confirmar com o backend:
//   GET  /me/faltas?semJustificativa=true   GET /me/justificativas   POST /me/justificativas (multipart)
//   GET  /justificativas                    PATCH /justificativas/:id { status }
export const justificativasService = {
  async listarFaltasSemJustificativa(): Promise<FaltaPendente[]> {
    if (env.mocksPendentes) {
      await esperar();
      return faltas;
    }
    const { data } = await api.get<FaltaPendente[]>("/me/faltas", { params: { semJustificativa: true } });
    return data;
  },

  async listarMinhas(): Promise<MinhaJustificativa[]> {
    if (env.mocksPendentes) {
      await esperar();
      return minhas;
    }
    const { data } = await api.get<MinhaJustificativa[]>("/me/justificativas");
    return data;
  },

  async enviar({ faltaId, motivo, descricao, anexo }: EnviarJustificativaPayload): Promise<void> {
    if (env.mocksPendentes) {
      await esperar(700);
      const falta = faltas.find((f) => f.id === faltaId);
      if (falta) {
        faltas = faltas.filter((f) => f.id !== faltaId);
        minhas = [
          { id: Date.now(), titulo: falta.titulo, dataFalta: falta.inicioEm, enviadaEm: new Date().toISOString(), status: "EM_ANALISE" },
          ...minhas,
        ];
      }
      return;
    }
    const form = new FormData();
    form.append("faltaId", String(faltaId));
    form.append("motivo", motivo);
    form.append("descricao", descricao);
    if (anexo) form.append("anexo", anexo);
    await api.post("/me/justificativas", form, { headers: { "Content-Type": "multipart/form-data" } });
  },

  async listarFila(): Promise<JustificativaFila[]> {
    if (env.mocksPendentes) {
      await esperar();
      return fila;
    }
    const { data } = await api.get<JustificativaFila[]>("/justificativas");
    return data;
  },

  async decidir(justificativaId: number, decisao: DecisaoJustificativa): Promise<void> {
    if (env.mocksPendentes) {
      await esperar(500);
      fila = fila.map((j) =>
        j.id === justificativaId ? { ...j, status: decisao === "APROVAR" ? "APROVADA" : "REJEITADA" } : j,
      );
      return;
    }
    await api.patch(`/justificativas/${justificativaId}`, { status: decisao === "APROVAR" ? "APROVADA" : "REJEITADA" });
  },
};
