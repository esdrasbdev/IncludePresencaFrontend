import type { Evento, ResumoEventos } from "../features/eventos/types/evento";
import type { MembroFrequencia, PainelDiretoria } from "../features/diretoria/types/diretoria";
import type { Membro } from "../features/membros/types/membro";
import type { JustificativaFila, FaltaPendente, MinhaJustificativa } from "../features/justificativas/types/justificativa";

const iso = (data: string, hora: string) => `${data}T${hora}:00-03:00`;
const hojeAs19 = () => `${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date())}T19:00:00-03:00`;
const agoraMenos = (horas: number) => new Date(Date.now() - horas * 3_600_000).toISOString();

const m = (id: number, nome: string, area: string, p: number, at: number, f: number, freq: number): MembroFrequencia => ({
  id, nome, area, presencas: p, totalEventos: 28, atrasos: at, faltas: f, frequencia: freq,
});

export const painelMock: PainelDiretoria = {
  frequenciaGlobal: 82,
  membrosAtivos: 24,
  abaixoDaMeta: 2,
  membros: [
    m(1, "Lucas Andrade", "Desenvolvimento", 23, 3, 2, 82),
    m(2, "Beatriz Moura", "Marketing", 19, 4, 5, 68),
    m(3, "Rafael Lima", "Projetos", 20, 3, 5, 71),
    m(4, "Mariana Costa", "VPGG", 27, 1, 0, 96),
    m(5, "Pedro Alves", "Recursos Humanos", 26, 2, 0, 93),
    m(6, "Camila Souza", "Desenvolvimento", 25, 2, 1, 89),
  ],
};

export const eventosDiretoriaMock: Evento[] = [
  { id: 1, titulo: "Reunião geral", inicioEm: iso("2026-11-04", "12:30"), terminoEm: iso("2026-11-04", "13:30"), toleranciaMinutos: 15, responsavelId: 4, responsavelNome: "Mariana Costa", status: "ABERTO", obrigatorio: true, presencaMedia: 82 },
  { id: 2, titulo: "Reunião Geral", inicioEm: iso("2026-11-13", "12:30"), terminoEm: iso("2026-11-13", "13:30"), toleranciaMinutos: 15, responsavelId: 5, responsavelNome: "Pedro Alves", status: "AGENDADO", obrigatorio: true },
  { id: 3, titulo: "Reunião Geral", inicioEm: iso("2026-11-11", "12:30"), terminoEm: iso("2026-11-11", "13:30"), toleranciaMinutos: 15, responsavelId: 6, responsavelNome: "Camila Souza", status: "AGENDADO", obrigatorio: true },
  { id: 4, titulo: "Sexta Pato", inicioEm: iso("2026-11-06", "14:00"), terminoEm: iso("2026-11-06", "18:00"), toleranciaMinutos: 15, responsavelId: 6, responsavelNome: "Camila Souza", status: "ENCERRADO", obrigatorio: false, presencaMedia: 70 },
  { id: 5, titulo: "Reunião geral", inicioEm: iso("2026-11-04", "19:00"), terminoEm: iso("2026-11-04", "20:30"), toleranciaMinutos: 15, responsavelId: 4, responsavelNome: "Mariana Costa", status: "ENCERRADO", obrigatorio: true, presencaMedia: 88 },
];

export const resumoEventosMock: ResumoEventos = {
  proximoEvento: { titulo: "Reunião geral - Online (Meet)", inicioEm: hojeAs19() },
  eventosNoMes: 6,
  presencaMedia: 78,
};

const membro = (id: number, nome: string, email: string, cargo: string, area: string, assiduidade: number | null, ativo: boolean): Membro => ({
  id, nome, email, cargo, area, assiduidade, ativo,
});

export const membrosMock: Membro[] = [
  membro(1, "Lucas Andrade", "lucas@includejr.com.br", "Membro", "Desenvolvimento", 68, true),
  membro(2, "Beatriz Moura", "beatriz@includejr.com.br", "Membro", "Marketing", 72, true),
  membro(3, "Rafael Lima", "rafael@includejr.com.br", "Membro", "Projetos", 74, true),
  membro(4, "Mariana Costa", "mariana@includejr.com.br", "Diretora", "Presidência", 96, true),
  membro(5, "Pedro Alves", "pedro@includejr.com.br", "Admin", "Recursos Humanos", 91, true),
  membro(6, "Camila Souza", "camila@includejr.com.br", "Membro", "Desenvolvimento", 88, true),
  membro(7, "João Pereira", "joao@includejr.com.br", "Membro", "Comercial", null, false),
];

const DESC =
  "Tive uma consulta médica agendada com antecedência que coincidiu com o horário do dia de trabalho. Anexei o comprovante de comparecimento.";

const fila = (
  id: number, nome: string, area: string, titulo: string, inicio: string, fim: string, dataFalta: string,
  enviadaHoras: number, status: JustificativaFila["status"], motivo: string, freq: number, just: number, pend: number,
): JustificativaFila => ({
  id, membroNome: nome, membroArea: area, membroCargo: "Membro", titulo,
  eventoInicioEm: iso(dataFalta, inicio), eventoTerminoEm: iso(dataFalta, fim), eventoObrigatorio: true,
  enviadaEm: agoraMenos(enviadaHoras), status, motivo, descricao: DESC, anexoNome: "comprovante.pdf",
  dentroDoPrazo: true, membroFrequencia: freq, faltasJustificadas: just, faltasPendentes: pend,
});

export const filaJustificativasMock: JustificativaFila[] = [
  fila(1, "Lucas Andrade", "Desenvolvimento", "Dia de trabalho", "12:30", "13:30", "2026-11-04", 2, "EM_ANALISE", "Compromisso médico", 92, 0, 1),
  fila(2, "Beatriz Moura", "Marketing", "Reunião geral", "19:00", "20:30", "2026-10-29", 24 * 5, "EM_ANALISE", "Problemas técnicos", 68, 1, 2),
  fila(3, "Rafael Lima", "Projetos", "Reunião geral", "19:00", "20:30", "2026-10-29", 24 * 4, "EM_ANALISE", "Trabalho ou estudos", 71, 0, 2),
  fila(4, "Camila Souza", "Desenvolvimento", "Reunião geral", "19:00", "20:30", "2026-10-22", 24 * 12, "APROVADA", "Saúde", 89, 1, 0),
  fila(5, "Pedro Alves", "Recursos Humanos", "Workshop de Git", "18:30", "20:00", "2026-10-22", 24 * 13, "REJEITADA", "Outro", 93, 0, 1),
];

const falta = (id: number, titulo: string, data: string, hora: string, prazo: string): FaltaPendente => ({
  id, titulo, inicioEm: iso(data, hora), prazoEm: iso(prazo, "23:59"),
});

export const faltasPendentesMock: FaltaPendente[] = [
  falta(1, "Reunião geral", "2026-11-03", "12:30", "2026-11-10"),
  falta(2, "Reunião de projeto", "2026-11-02", "12:30", "2026-11-09"),
  falta(3, "Reunião geral", "2026-10-15", "19:00", "2026-11-10"),
];

export const minhasJustificativasMock: MinhaJustificativa[] = [
  { id: 11, titulo: "Reunião geral", dataFalta: iso("2026-10-30", "12:30"), enviadaEm: iso("2026-10-31", "09:00"), status: "EM_ANALISE" },
  { id: 12, titulo: "Reunião geral", dataFalta: iso("2026-10-23", "12:30"), enviadaEm: iso("2026-10-24", "09:00"), status: "APROVADA" },
];
