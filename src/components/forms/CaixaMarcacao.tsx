import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cx } from "../../lib/cx";

type Props = {
  marcado: boolean;
  onChange: (marcado: boolean) => void;
  children: ReactNode;
  /** Lado da caixa em px (25 em "Manter conectado", 14 na política de privacidade). */
  lado?: number;
  className?: string;
};

export function CaixaMarcacao({ marcado, onChange, children, lado = 14, className }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={marcado}
      onClick={() => onChange(!marcado)}
      className={cx("flex cursor-pointer items-center text-left outline-none focus-visible:[&>span:first-child]:border-brand", className)}
    >
      <span
        style={{ width: lado, height: lado }}
        className="grid shrink-0 place-items-center rounded-[4px] border border-black bg-white"
      >
        {marcado && <Check size={Math.round(lado * 0.72)} strokeWidth={3} className="text-black" />}
      </span>
      {children}
    </button>
  );
}
