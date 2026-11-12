import { isAxiosError } from "axios";

// O backend responde ProblemDetails com `detail` em inglês. Só as mensagens conhecidas são traduzidas.
const TRADUCOES: Array<[RegExp, string]> = [
  [/last active director/i, "Não é possível desativar nem rebaixar o último diretor ativo."],
  [/email already registered/i, "Já existe um membro com este e-mail."],
  [/member is already deactivated/i, "Este membro já está inativo."],
  [/member is not deactivated/i, "Este membro não está inativo."],
  [/event is already cancelled/i, "Este evento já foi cancelado."],
  [/cannot update a cancelled event/i, "Não é possível editar um evento cancelado."],
  [/end date must be after start date/i, "O término deve ser após o início."],
  [/(event|member) not found/i, "Registro não encontrado."],
];

/** Tradução de uma mensagem conhecida do backend, ou `null` se não houver. */
export function mensagemTraduzida(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const detalhe = (error.response?.data as { detail?: unknown } | undefined)?.detail;
  if (typeof detalhe !== "string") return null;
  return TRADUCOES.find(([padrao]) => padrao.test(detalhe))?.[1] ?? null;
}

/** Extrai uma mensagem amigável de um erro da API (sem assumir o contrato de erro do backend). */
export function mensagemDeErro(error: unknown, padrao: string) {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown; mensagem?: unknown } | undefined;
    const texto = data?.mensagem ?? data?.message;
    if (typeof texto === "string" && texto.trim()) return texto;
    const traduzida = mensagemTraduzida(error);
    if (traduzida) return traduzida;
    if (!error.response) return "Não foi possível conectar ao servidor. Tente novamente.";
    if (error.response.status === 429) return "Muitas tentativas. Aguarde um minuto e tente novamente.";
    if (error.response.status === 403) return "Você não tem permissão para realizar esta ação.";
  }
  return padrao;
}

export function statusHttp(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined;
}
