import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cx } from "../../lib/cx";

export const PERIODOS = [30, 60, 90] as const;

export function SeletorPeriodo({ dias, onChange }: { dias: number; onChange: (d: number) => void }) {
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
