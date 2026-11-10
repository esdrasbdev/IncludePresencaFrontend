import { cx } from "../../lib/cx";
import { Logo } from "./Logo";

type Props = {
  /** O protótipo usa Poppins no login e Inter na recuperação de senha. */
  fonte?: "poppins" | "inter";
  className?: string;
};

/** Painel laranja com degradê exibido à esquerda do login e da recuperação de senha. */
export function BrandPanel({ fonte = "poppins", className }: Props) {
  const familia = fonte === "poppins" ? "font-poppins" : "font-inter";
  return (
    <aside
      className={cx(
        "bg-brand-gradient hidden w-1/2 shrink-0 flex-col justify-center pb-[42px] pl-[clamp(32px,4.4vw,68px)] pr-[clamp(24px,2vw,32px)] text-white lg:flex",
        className,
      )}
    >
      <Logo cor="branco" tamanho="grande" />
      <h2
        className={cx(
          "mt-[41px] max-w-[706px] text-[clamp(34px,3.1vw,48px)] font-bold leading-[1.146] tracking-[0.03em]",
          familia,
        )}
      >
        Controle de presenças simples, rápido e transparente.
      </h2>
      <p className={cx("ml-[8px] mt-[48px] max-w-[648px] text-[20px] font-bold leading-[30px] tracking-[0.03em]", familia)}>
        Controle de presença nas reuniões gerais, capacitações e eventos da Include Jr.
      </p>
    </aside>
  );
}
