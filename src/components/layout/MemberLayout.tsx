import { useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CircleCheck, Clock, FileText, LayoutDashboard, LogOut, type LucideIcon } from "lucide-react";
import { Logo } from "../brand/Logo";
import { useUsuarioAtual } from "../../features/auth/hooks/useUsuarioAtual";
import { authService } from "../../features/auth/services/authService";
import { cx } from "../../lib/cx";
import { iniciais } from "../../lib/format";

const ITENS: Array<{ to: string; rotulo: string; icone: LucideIcon; end?: boolean; medio?: boolean }> = [
  { to: "/", rotulo: "Início", icone: LayoutDashboard, end: true, medio: true },
  { to: "/registrar-presenca", rotulo: "Registrar presença", icone: CircleCheck },
  { to: "/historico", rotulo: "Ver histórico", icone: Clock },
  { to: "/justificar-falta", rotulo: "Justificar falta", icone: FileText },
];

export function MemberLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: usuario } = useUsuarioAtual();
  const nome = usuario?.nome ?? "";

  const sair = () => {
    authService.sair();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-inter text-ink md:flex-row">
      {/* Barra superior (telas pequenas) */}
      <header className="flex items-center justify-between gap-3 bg-white px-4 py-3 md:hidden">
        <Logo cor="laranja" tamanho="menu" className="origin-left scale-[0.6]" />
        <nav aria-label="Menu" className="flex gap-1 overflow-x-auto">
          {ITENS.map(({ to, rotulo, icone: Icone, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={rotulo}
              className={({ isActive }) =>
                cx("grid size-10 place-items-center rounded-[6px]", isActive ? "bg-brand-active text-brand" : "text-black")
              }
            >
              <Icone size={20} strokeWidth={2} />
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Menu lateral */}
      <aside className="sticky top-0 hidden h-screen w-[287px] shrink-0 flex-col bg-white md:flex">
        <div className="pl-[55px] pt-[60px]">
          <Logo cor="laranja" tamanho="menu" />
        </div>

        <p className="mt-[13px] pl-[41px] text-[10px] leading-[18px] text-[#636363]">MENU</p>
        <nav aria-label="Menu principal" className="mb-0 ml-[41px] mr-[37px] mt-[8px] flex flex-col gap-[3px]">
          {ITENS.map(({ to, rotulo, icone: Icone, end, medio }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  "flex h-[39px] items-center gap-[12px] rounded-[6px] pl-[14px] text-[15px] leading-[18px] transition-colors",
                  medio ? "font-medium" : "font-normal",
                  isActive ? "bg-brand-active text-brand" : "text-black hover:bg-wash",
                )
              }
            >
              <Icone size={20} strokeWidth={2} aria-hidden="true" />
              {rotulo}
            </NavLink>
          ))}
        </nav>

        <div className="mb-[21px] ml-[46px] mr-[43px] mt-auto flex items-center gap-[10px] rounded-[10px] bg-wash p-[12px]">
          <span
            aria-hidden="true"
            className="grid size-[36px] shrink-0 place-items-center rounded-full bg-brand-action text-[13px] font-semibold text-white"
          >
            {iniciais(nome)}
          </span>
          <div className="min-w-0 flex-1 leading-normal">
            <p className="truncate text-[13px] font-semibold text-ink">{nome}</p>
            <p className="truncate text-[12px] text-muted">{usuario?.setor ?? ""}</p>
          </div>
          <button type="button" onClick={sair} aria-label="Sair" className="shrink-0 cursor-pointer text-muted hover:text-ink">
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-canvas">
        <Outlet />
      </main>
    </div>
  );
}
