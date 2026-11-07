export const env = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  /** Enquanto o backend/banco não estiver disponível, as telas usam os dados de exemplo do protótipo. */
  useMocks: import.meta.env.VITE_USE_MOCKS === "true",
};
