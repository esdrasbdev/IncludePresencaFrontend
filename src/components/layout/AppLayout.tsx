import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, ChartNoAxesCombined, ClipboardCheck, LayoutDashboard, Users } from "lucide-react";

const links = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/presencas", label: "Presenças", icon: ClipboardCheck },
  { to: "/relatorios", label: "Relatórios", icon: ChartNoAxesCombined },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <aside className="w-full border-b border-slate-200 bg-white p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">IP</div>
          <div>
            <p className="font-semibold tracking-tight">IncludePresença</p>
            <p className="text-xs text-slate-500">Gestão de frequência</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 hidden rounded-xl bg-slate-50 p-3 text-xs text-slate-500 md:block">
          Ambiente inicial do MVP. O acesso por perfil será conectado à autenticação da API.
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-sm font-medium text-slate-600">Painel de gestão</span>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={16} />
            <span>Usuário</span>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
