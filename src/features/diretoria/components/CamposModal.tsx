import type { ReactNode } from "react";
import { cx } from "../../../lib/cx";

export const entradaModal =
  "w-full min-w-0 bg-transparent text-[15px] leading-normal text-black outline-none placeholder:text-black/60";

/** Campo com rótulo acima e caixa branca com contorno, usado nos modais da diretoria. */
export function CampoModal({
  rotulo,
  erro,
  icone,
  children,
  className,
}: {
  rotulo: string;
  erro?: string;
  icone?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-[6px] block text-[16px] font-medium leading-normal text-black">{rotulo}</span>
      <span
        className={cx(
          "flex h-[52px] items-center gap-[8px] rounded-[15px] border bg-white px-[20px] text-[15px] text-black transition-colors focus-within:border-brand-action focus-within:ring-1 focus-within:ring-brand-action",
          erro ? "border-danger" : "border-[#d4d4d8]",
        )}
      >
        {icone}
        {children}
      </span>
      {erro && (
        <span role="alert" className="mt-[4px] block pl-[8px] text-[12px] text-[#b91c1c]">
          {erro}
        </span>
      )}
    </label>
  );
}

/** Estrutura comum dos modais: fundo escurecido, cartão branco, fecha com Esc ou clique fora. */
export function ModalBase({
  titulo,
  tituloId,
  onFechar,
  children,
  largura = "max-w-[597px]",
}: {
  titulo: string;
  tituloId: string;
  onFechar: () => void;
  children: ReactNode;
  largura?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 md:py-[8vh]"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className={cx("w-full rounded-[18px] bg-white p-[29px] font-inter shadow-2xl", largura)}
      >
        <div className="flex items-start justify-between">
          <h2 id={tituloId} className="text-[28px] font-bold leading-[33px] text-black">
            {titulo}
          </h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="cursor-pointer text-black hover:text-brand">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
