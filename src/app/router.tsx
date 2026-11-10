import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DiretoriaLayout } from "../components/layout/DiretoriaLayout";
import { MemberLayout } from "../components/layout/MemberLayout";
import { RotaProtegida } from "../components/layout/RotaProtegida";
import { EsqueciSenhaPage } from "../features/auth/pages/EsqueciSenhaPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RedefinirSenhaPage } from "../features/auth/pages/RedefinirSenhaPage";
import { DiretoriaEventosPage } from "../features/diretoria/pages/DiretoriaEventosPage";
import { DiretoriaGerenciamentoPage } from "../features/diretoria/pages/DiretoriaGerenciamentoPage";
import { DiretoriaJustificativasPage } from "../features/diretoria/pages/DiretoriaJustificativasPage";
import { DiretoriaPainelPage } from "../features/diretoria/pages/DiretoriaPainelPage";
import { JustificarFaltaPage } from "../features/justificativas/pages/JustificarFaltaPage";
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
  { path: "/esqueci-senha", element: <EsqueciSenhaPage /> },
  // Links enviados por e-mail pelo backend (Frontend:BaseUrl + /activate e /reset-password).
  { path: "/activate", element: <RedefinirSenhaPage modo="ativar" /> },
  { path: "/reset-password", element: <RedefinirSenhaPage /> },
  { path: "/redefinir-senha", element: <RedefinirSenhaPage /> },

  // Áreas logadas: exigem JWT. A área da Diretoria exige o perfil Diretoria.
  {
    element: <RotaProtegida />,
    children: [
      // Área do membro (telas do protótipo)
      {
        path: "/",
        element: <MemberLayout />,
        children: [
          { index: true, element: <MemberDashboardPage /> },
          { path: "registrar-presenca", element: <AttendancePage /> },
          { path: "historico", element: <HistoryPage /> },
          { path: "justificar-falta", element: <JustificarFaltaPage /> },
        ],
      },

      // Páginas de gestão ainda não redesenhadas — mantidas como estavam.
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { path: "eventos", element: <EventsPage /> },
          { path: "eventos/:eventoId", element: <EventDetailsPage /> },
          { path: "relatorios", element: <ReportsPage /> },
        ],
      },
    ],
  },

  // Área da diretoria (telas do protótipo)
  {
    element: <RotaProtegida perfilExigido="DIRETORIA" />,
    children: [
      {
        path: "/diretoria",
        element: <DiretoriaLayout />,
        children: [
          { index: true, element: <DiretoriaPainelPage /> },
          { path: "eventos", element: <DiretoriaEventosPage /> },
          { path: "gerenciamento", element: <DiretoriaGerenciamentoPage /> },
          { path: "justificativas", element: <DiretoriaJustificativasPage /> },
        ],
      },
    ],
  },

  { path: "/inicio", element: <Navigate to="/" replace /> },
  { path: "/presencas", element: <Navigate to="/registrar-presenca" replace /> },
  { path: "*", element: <NotFoundPage /> },
]);
