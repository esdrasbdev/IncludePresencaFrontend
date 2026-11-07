import { isAxiosError } from "axios";

/** Extrai uma mensagem amigável de um erro da API (sem assumir o contrato de erro do backend). */
export function mensagemDeErro(error: unknown, padrao: string) {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown; mensagem?: unknown } | undefined;
    const texto = data?.mensagem ?? data?.message;
    if (typeof texto === "string" && texto.trim()) return texto;
    if (!error.response) return "Não foi possível conectar ao servidor. Tente novamente.";
  }
  return padrao;
}

export function statusHttp(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined;
}
