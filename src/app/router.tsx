import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { MemberLayout } from "../components/layout/MemberLayout";
import { CadastroPage } from "../features/auth/pages/CadastroPage";
import { EsqueciSenhaPage } from "../features/auth/pages/EsqueciSenhaPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { MemberDashboardPage } from "../features/dashboard/pages/MemberDashboardPage";
import { EventsPage } from "../features/eventos/pages/EventsPage";
import { EventDetailsPage } from "../features/eventos/pages/EventDetailsPage";
import { AttendancePage } from "../features/presencas/pages/AttendancePage";
import { HistoryPage } from "../features/presencas/pages/HistoryPage";
import { ReportsPage } from "../features/relatorios/pages/ReportsPage";
import { NotFoundPage } from "../components/layout/NotFoundPage";

export const router = createBrowserRouter([
  // Acesso
  { path: "/login", element: <LoginPage /> },
  { path: "/cadastro", element: <CadastroPage /> },
  { path: "/esqueci-senha", element: <EsqueciSenhaPage /> },

  // Área do membro (telas do protótipo)
  {
    path: "/",
    element: <MemberLayout />,
    children: [
      { index: true, element: <MemberDashboardPage /> },
      { path: "registrar-presenca", element: <AttendancePage /> },
      { path: "historico", element: <HistoryPage /> },
    ],
  },

  // Páginas de gestão ainda não redesenhadas (diretoria) — mantidas como estavam.
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "eventos", element: <EventsPage /> },
      { path: "eventos/:eventoId", element: <EventDetailsPage /> },
      { path: "relatorios", element: <ReportsPage /> },
    ],
  },

  { path: "/inicio", element: <Navigate to="/" replace /> },
  { path: "/presencas", element: <Navigate to="/registrar-presenca" replace /> },
  { path: "*", element: <NotFoundPage /> },
]);
