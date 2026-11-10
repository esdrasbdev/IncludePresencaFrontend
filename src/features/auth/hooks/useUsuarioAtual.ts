import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import type { Perfil } from "../types/auth";

export function useUsuarioAtual(perfil?: Perfil) {
  return useQuery({
    // A chave inclui o id da sessão para não reaproveitar o usuário anterior após sair/entrar de novo.
    queryKey: ["me", perfil ?? "auto", authService.sessao()?.id ?? "anon"],
    queryFn: () => authService.obterUsuarioAtual(perfil),
    retry: false,
  });
}
