import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// A estratégia de autenticação (cookie, bearer token etc.) depende da decisão do backend.
// Não adicionar token ou persistência até o contrato de autenticação ser confirmado.
