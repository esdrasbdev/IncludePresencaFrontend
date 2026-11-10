const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || "/api",
  /** Tudo com dados de exemplo do protótipo (sem backend). */
  useMocks,
  /**
   * Módulos que o backend ainda não implementa (eventos, presenças, justificativas, relatórios,
   * listagem/edição de membros): continuam com dados de exemplo enquanto a flag estiver ativa.
   * Login, ativação de conta, recuperação de senha e criação de membro sempre usam `useMocks`.
   */
  mocksPendentes: useMocks || import.meta.env.VITE_MOCK_MODULOS_PENDENTES !== "false",
};
