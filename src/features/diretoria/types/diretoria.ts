export interface MembroFrequencia {
  id: number;
  nome: string;
  area: string;
  presencas: number;
  totalEventos: number;
  atrasos: number;
  faltas: number;
  frequencia: number;
}

// Formato assumido para o painel da diretoria — confirmar com o backend.
export interface PainelDiretoria {
  frequenciaGlobal: number;
  membrosAtivos: number;
  abaixoDaMeta: number;
  membros: MembroFrequencia[];
}
