import { Navigate, Outlet } from "react-router-dom";
import { env } from "../../config/env";
import { authService } from "../../features/auth/services/authService";
import type { Perfil } from "../../features/auth/types/auth";

/**
 * Exige login (JWT válido). Com `perfilExigido`, restringe a um perfil (ex.: área da Diretoria).
 * No modo de exemplo (`VITE_USE_MOCKS=true`) não há sessão real, então a navegação fica livre como antes.
 */
export function RotaProtegida({ perfilExigido }: { perfilExigido?: Perfil }) {
  if (env.useMocks) return <Outlet />;

  const sessao = authService.sessao();
  if (!sessao) return <Navigate to="/login" replace />;
  if (perfilExigido && sessao.perfil !== perfilExigido) {
    return <Navigate to={sessao.perfil === "DIRETORIA" ? "/diretoria" : "/"} replace />;
  }
  return <Outlet />;
}
