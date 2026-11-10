import type { ReactNode } from "react";
import { cx } from "../../../lib/cx";

/** Cartão laranja de indicador usado nas telas da diretoria. */
export function Indicador({ className, children }: { className?: string; children: ReactNode }) {
  return <article className={cx("relative overflow-hidden rounded-[12px] border border-line bg-brand text-white", className)}>{children}</article>;
}

/** Barra de progresso branca com marcador da meta (75%). */
export function BarraMeta({ percentual, meta = 75, className }: { percentual: number; meta?: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percentual}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx("relative h-[8px] w-[192px] rounded-[4px] bg-[rgba(192,192,207,0.65)]", className)}
    >
      <div className="h-full rounded-[4px] bg-white" style={{ width: `${Math.min(percentual, 100)}%` }} />
      <div aria-hidden="true" className="absolute -top-[3px] h-[14px] w-[2px] bg-ink" style={{ left: `${meta}%` }} />
    </div>
  );
}

/** Barra de frequência da tabela (verde ≥ meta, vermelha abaixo). */
export function BarraFrequencia({ percentual, largura = 150, meta = 75 }: { percentual: number; largura?: number; meta?: number }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="h-[8px] shrink-0 overflow-hidden rounded-[4px] bg-[#f4f4f5]" style={{ width: largura }}>
        <div
          className={cx("h-full rounded-[4px]", percentual >= meta ? "bg-[#15803d]" : "bg-[#b91c1c]")}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>
      <span className="text-[13px] font-semibold leading-normal text-ink">{percentual}%</span>
    </div>
  );
}

export function Avatar({ iniciais, tamanho = 34 }: { iniciais: string; tamanho?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: tamanho, height: tamanho }}
      className="grid shrink-0 place-items-center rounded-full bg-[#ffd9c4] text-[12px] font-semibold text-brand-ink"
    >
      {iniciais}
    </span>
  );
}

export function Chip({ ativo, children, onClick }: { ativo: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cx(
        "shrink-0 cursor-pointer rounded-full px-[14px] py-[8px] text-[13px] font-medium leading-normal",
        ativo ? "bg-ink text-white" : "border border-line bg-white text-muted hover:bg-wash",
      )}
    >
      {children}
    </button>
  );
}

export function CampoBusca({ valor, onChange, placeholder }: { valor: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-[40px] w-[300px] max-w-full shrink-0 items-center gap-[8px] rounded-[8px] border border-line bg-white px-[12px] focus-within:border-brand">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-[14px] leading-normal text-ink outline-none placeholder:text-subtle"
      />
    </label>
  );
}
