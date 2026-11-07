import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import type { StatusHistorico } from "../../features/presencas/types/presenca";

export type VarianteBadge = "presente" | "atraso" | "falta" | "justificada" | "aguardando" | "obrigatorio";

const cores: Record<VarianteBadge, string> = {
  presente: "bg-[#dcfce7] text-[#15803d]",
  atraso: "bg-[#fef3c7] text-[#a16207]",
  falta: "bg-[#fee2e2] text-[#b91c1c]",
  justificada: "bg-[#dbeafe] text-[#1d4ed8]",
  aguardando: "bg-brand-soft text-brand-ink",
  obrigatorio: "bg-brand-soft text-brand-ink",
};

type Props = { variante: VarianteBadge; tamanho?: "sm" | "md"; children: ReactNode };

export function StatusBadge({ variante, tamanho = "sm", children }: Props) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full px-[10px] py-[4px] font-inter font-medium leading-normal",
        tamanho === "sm" ? "text-[12px]" : "text-[14px]",
        cores[variante],
      )}
    >
      {children}
    </span>
  );
}

const porStatus: Record<StatusHistorico, { variante: VarianteBadge; rotulo: string }> = {
  PRESENTE: { variante: "presente", rotulo: "Presente" },
  ATRASO: { variante: "atraso", rotulo: "Atraso" },
  FALTA_NAO_JUSTIFICADA: { variante: "falta", rotulo: "Falta" },
  FALTA_JUSTIFICADA: { variante: "justificada", rotulo: "Justificada" },
  AGUARDANDO: { variante: "aguardando", rotulo: "Aguardando" },
};

export function BadgeDoStatus({ status }: { status: StatusHistorico }) {
  const { variante, rotulo } = porStatus[status];
  return <StatusBadge variante={variante}>{rotulo}</StatusBadge>;
}
