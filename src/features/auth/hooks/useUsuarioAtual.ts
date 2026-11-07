import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";

export function useUsuarioAtual() {
  return useQuery({ queryKey: ["me"], queryFn: authService.obterUsuarioAtual, retry: false });
}
