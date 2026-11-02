import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { MemberDashboardPage } from "../features/dashboard/pages/MemberDashboardPage";
import { EventsPage } from "../features/eventos/pages/EventsPage";
import { EventDetailsPage } from "../features/eventos/pages/EventDetailsPage";
import { AttendancePage } from "../features/presencas/pages/AttendancePage";
import { ReportsPage } from "../features/relatorios/pages/ReportsPage";
import { NotFoundPage } from "../components/layout/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <MemberDashboardPage /> },
      { path: "eventos", element: <EventsPage /> },
      { path: "eventos/:eventoId", element: <EventDetailsPage /> },
      { path: "presencas", element: <AttendancePage /> },
      { path: "relatorios", element: <ReportsPage /> },
    ],
  },
  { path: "/inicio", element: <Navigate to="/" replace /> },
  { path: "*", element: <NotFoundPage /> },
]);
