export interface MembroFrequencia {
  id: string;
  nome: string;
  area: string;
  presencas: number;
  totalEventos: number;
  atrasos: number;
  faltas: number;
  /** `null` = membro sem eventos ainda. */
  frequencia: number | null;
}

// Formato assumido para o painel da diretoria — confirmar com o backend.
export interface PainelDiretoria {
  /** `null` = sem dados. */
  frequenciaGlobal: number | null;
  membrosAtivos: number;
  abaixoDaMeta: number;
  membros: MembroFrequencia[];
}
