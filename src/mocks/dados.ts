import type { Evento } from "../features/eventos/types/evento";
import type { RegistroHistorico } from "../features/presencas/types/presenca";
import type { UsuarioAtual } from "../features/auth/types/auth";
import type { FrequenciaIndividual } from "../features/dashboard/services/frequenciaService";

// Dados de exemplo extraídos do protótipo. Usados apenas com VITE_USE_MOCKS=true.

export const esperar = (ms = 350) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Monta um ISO de hoje (fuso de Brasília) no horário informado. */
function hojeAs(hora: number, minuto: number) {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const hh = String(hora).padStart(2, "0");
  const mm = String(minuto).padStart(2, "0");
  return `${partes}T${hh}:${mm}:00-03:00`;
}

export const usuarioMock: UsuarioAtual = { nome: "Mariana Costa", setor: "VPGG" };

export const frequenciaMock: FrequenciaIndividual = {
  totalEventos: 28,
  presencas: 23,
  faltasJustificadas: 1,
  faltasNaoJustificadas: 1,
  atrasos: 3,
  percentual: 82,
};

export const eventoAbertoMock: Evento = {
  id: 999,
  titulo: "Reunião geral",
  inicioEm: hojeAs(19, 0),
  terminoEm: hojeAs(20, 30),
  toleranciaMinutos: 15,
  responsavelId: 1,
};

const linha = (
  id: number,
  data: string,
  titulo: string,
  inicio: string,
  fim: string,
  registro: string | null,
  status: RegistroHistorico["status"],
  observacao: string | null,
): RegistroHistorico => ({
  id,
  eventoId: 100 + id,
  titulo,
  inicioEm: `${data}T${inicio}:00-03:00`,
  terminoEm: `${data}T${fim}:00-03:00`,
  registradoEm: registro ? `${data}T${registro}:00-03:00` : null,
  status,
  observacao,
});

export const historicoMock: RegistroHistorico[] = [
  linha(1, "2026-11-05", "Reunião geral", "19:00", "20:30", "19:04", "PRESENTE", "No horário"),
  linha(2, "2026-10-29", "Reunião geral", "19:00", "20:30", "19:22", "ATRASO", "Problemas"),
  linha(3, "2026-10-22", "Workshop de Git", "18:30", "20:00", "18:31", "PRESENTE", "No horário"),
  linha(4, "2026-10-15", "Reunião geral", "19:00", "20:30", "19:02", "PRESENTE", "No horário"),
  linha(5, "2026-10-08", "Dia de trabalho", "14:00", "18:00", null, "FALTA_NAO_JUSTIFICADA", "Sem registro"),
  linha(6, "2026-10-01", "Reunião geral", "19:00", "20:30", "19:05", "PRESENTE", "No horário"),
  linha(7, "2026-09-24", "Workshop de React", "18:30", "20:00", "18:33", "PRESENTE", "No horário"),
  linha(8, "2026-09-17", "Reunião geral", "19:00", "20:30", "19:14", "PRESENTE", "No horário"),
];
