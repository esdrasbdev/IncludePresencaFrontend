import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, Search } from "lucide-react";
import { BadgeDoStatus } from "../../../components/ui/StatusBadge";
import { cx } from "../../../lib/cx";
import { dataCompleta, hora, intervalo } from "../../../lib/format";
import { useMinhaFrequencia } from "../../dashboard/hooks/useMinhaFrequencia";
import { useMeuHistorico } from "../hooks/useMeuHistorico";
import type { RegistroHistorico } from "../types/presenca";

const PERIODOS = [30, 60, 90] as const;

type Filtro = "TODOS" | "PRESENTE" | "ATRASO" | "FALTA";
const FILTROS: Array<{ id: Filtro; rotulo: string }> = [
  { id: "TODOS", rotulo: "Todos" },
  { id: "PRESENTE", rotulo: "Presente" },
  { id: "ATRASO", rotulo: "Atraso" },
  { id: "FALTA", rotulo: "Falta" },
];

function combina(registro: RegistroHistorico, filtro: Filtro) {
  if (filtro === "TODOS") return true;
  if (filtro === "FALTA") return registro.status === "FALTA_JUSTIFICADA" || registro.status === "FALTA_NAO_JUSTIFICADA";
  return registro.status === filtro;
}

const normalizar = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function SeletorPeriodo({ dias, onChange }: { dias: number; onChange: (d: number) => void }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  return (
    <div ref={raiz} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
        className="flex h-[40px] cursor-pointer items-center gap-[8px] rounded-[8px] border border-line bg-white px-[12px]"
      >
        <Calendar size={16} strokeWidth={2} aria-hidden="true" />
        <span className="text-[14px] font-medium leading-normal text-ink">Últimos {dias} dias</span>
        <ChevronDown size={16} strokeWidth={2} className="text-muted" aria-hidden="true" />
      </button>
      {aberto && (
        <ul role="listbox" className="absolute right-0 z-20 mt-[6px] w-full min-w-[178px] overflow-hidden rounded-[8px] border border-line bg-white py-[4px] shadow-lg">
          {PERIODOS.map((p) => (
            <li key={p} role="option" aria-selected={p === dias}>
              <button
                type="button"
                onClick={() => {
                  onChange(p);
                  setAberto(false);
                }}
                className={cx(
                  "block w-full cursor-pointer px-[12px] py-[8px] text-left text-[14px] font-medium text-ink hover:bg-wash",
                  p === dias && "bg-wash",
                )}
              >
                Últimos {p} dias
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HistoryPage() {
  const [dias, setDias] = useState<number>(60);
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [busca, setBusca] = useState("");
  const { data: historico, isLoading, isError } = useMeuHistorico(dias);
  const { data: frequencia } = useMinhaFrequencia();

  const atrasos = frequencia?.atrasos ?? (historico ?? []).filter((r) => r.status === "ATRASO").length;
  const faltas = frequencia ? frequencia.faltasJustificadas + frequencia.faltasNaoJustificadas : undefined;

  const linhas = useMemo(() => {
    const termo = normalizar(busca.trim());
    return (historico ?? []).filter((r) => combina(r, filtro) && (!termo || normalizar(r.titulo).includes(termo)));
  }, [historico, filtro, busca]);

  const estatisticas: Array<{ rotulo: string; valor: string; cor: string }> = [
    { rotulo: "Frequência", valor: frequencia ? `${frequencia.percentual}%` : "—", cor: "text-brand-action" },
    { rotulo: "Presenças", valor: frequencia ? String(frequencia.presencas) : "—", cor: "text-[#15803d]" },
    { rotulo: "Atrasos", valor: frequencia || historico ? String(atrasos) : "—", cor: "text-[#a16207]" },
    { rotulo: "Faltas", valor: faltas !== undefined ? String(faltas) : "—", cor: "text-[#b91c1c]" },
  ];

  return (
    <div className="pb-[48px] pl-[clamp(16px,2vw,26px)] pr-[clamp(16px,2.8vw,36px)] pt-[58px]">
      <header className="flex min-h-[108px] flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-[4px] leading-normal">
          <h1 className="text-[36px] font-bold text-ink">Histórico de reuniões</h1>
          <p className="text-[18px] text-muted">Todas as reuniões, eventos e atividades em que você participou.</p>
        </div>
        <SeletorPeriodo dias={dias} onChange={setDias} />
      </header>

      <section aria-label="Resumo" className="mt-[19px] grid grid-cols-2 gap-[clamp(12px,4vw,50px)] lg:grid-cols-4">
        {estatisticas.map((e) => (
          <article key={e.rotulo} className="flex items-center justify-between gap-2 rounded-[12px] border border-line bg-white p-[16px] leading-normal">
            <h2 className="text-[13px] font-medium text-muted">{e.rotulo}</h2>
            <p className={cx("text-[22px] font-bold", e.cor)}>{e.valor}</p>
          </article>
        ))}
      </section>

      <div className="mt-[clamp(32px,10vh,91px)] flex flex-wrap items-center gap-[12px]">
        <label className="flex h-[40px] w-full max-w-[300px] items-center gap-[8px] rounded-[8px] border border-line bg-white px-[12px] focus-within:border-brand">
          <Search size={18} strokeWidth={2} className="shrink-0 text-subtle" aria-hidden="true" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar reunião"
            aria-label="Buscar reunião"
            className="w-full bg-transparent text-[14px] leading-normal text-ink outline-none placeholder:text-subtle"
          />
        </label>
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={cx(
              "cursor-pointer rounded-full px-[14px] py-[8px] text-[13px] font-medium leading-normal",
              filtro === f.id ? "bg-ink text-white" : "border border-line bg-white text-muted hover:bg-wash",
            )}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      <section aria-label="Tabela de histórico" className="mt-[19px] overflow-hidden rounded-[12px] border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1170px] table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[192px]" />
              <col className="w-[340px]" />
              <col className="w-[200px]" />
              <col className="w-[180px]" />
              <col className="w-[180px]" />
              <col />
            </colgroup>
            <thead>
              <tr className="bg-[#fafafa]">
                {["DATA", "REUNIÃO", "HORÁRIO", "REGISTRO", "STATUS", "OBSERVAÇÃO"].map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={cx("py-[10px] text-[11px] font-semibold leading-normal text-subtle", i === 0 ? "pl-[16px]" : "pl-0")}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((r) => (
                <tr key={r.id} className="border-b border-line text-[14px] leading-normal text-ink">
                  <td className="py-[12px] pl-[16px]">{dataCompleta(r.inicioEm)}</td>
                  <td className="py-[12px]">{r.titulo}</td>
                  <td className="py-[12px]">{intervalo(r.inicioEm, r.terminoEm)}</td>
                  <td className="py-[12px]">{r.registradoEm ? hora(r.registradoEm) : "—"}</td>
                  <td className="py-[12px]">
                    <BadgeDoStatus status={r.status} />
                  </td>
                  <td className="py-[12px] pr-[16px]">{r.observacao ?? "—"}</td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-[16px] py-[24px] text-[14px] text-muted">
                    {isLoading
                      ? "Carregando histórico..."
                      : isError
                        ? "Não foi possível carregar o histórico. Tente novamente."
                        : "Nenhum registro encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
