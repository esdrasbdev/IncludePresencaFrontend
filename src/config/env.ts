const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

/** Grupo de módulos cujo contrato com o backend ainda não foi confirmado (check-in, justificativas, relatórios). */
const pendentes = useMocks || import.meta.env.VITE_MOCK_MODULOS_PENDENTES !== "false";

/** `VITE_MOCK_<MÓDULO>=true|false` vence; sem valor, usa o padrão do módulo. `VITE_USE_MOCKS=true` liga todos. */
function mockDoModulo(variavel: string, padrao: boolean) {
  if (useMocks) return true;
  const valor = (import.meta.env as Record<string, string | undefined>)[variavel];
  if (valor === "true") return true;
  if (valor === "false") return false;
  return padrao;
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || "/api",
  /** Tudo com dados de exemplo do protótipo (sem backend). */
  useMocks,
  /**
   * Mock por módulo. Eventos e membros já existem no backend (módulo de identidade) e usam a API real por padrão.
   * Os demais seguem com dados de exemplo até o contrato ser confirmado (ver VITE_MOCK_MODULOS_PENDENTES).
   */
  mocks: {
    eventos: mockDoModulo("VITE_MOCK_EVENTOS", false),
    membros: mockDoModulo("VITE_MOCK_MEMBROS", false),
    presencas: mockDoModulo("VITE_MOCK_PRESENCAS", pendentes),
    justificativas: mockDoModulo("VITE_MOCK_JUSTIFICATIVAS", pendentes),
    frequencia: mockDoModulo("VITE_MOCK_FREQUENCIA", pendentes),
    relatorios: mockDoModulo("VITE_MOCK_RELATORIOS", pendentes),
  },
};
