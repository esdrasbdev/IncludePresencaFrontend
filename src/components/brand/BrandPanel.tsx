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
        "bg-brand-gradient relative hidden w-1/2 shrink-0 animate-fade-in flex-col justify-center overflow-hidden pb-[42px] pl-[clamp(32px,4.4vw,68px)] pr-[clamp(24px,2vw,32px)] text-white lg:flex",
        className,
      )}
    >
      {/* Círculos de luz que flutuam devagar no fundo (só decoração) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[120px] -top-[120px] size-[380px] animate-float rounded-full bg-white/10 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[140px] -left-[100px] size-[340px] animate-float rounded-full bg-white/10 blur-2xl"
        style={{ animationDelay: "-3.5s" }}
      />

      <Logo cor="branco" tamanho="grande" className="relative z-10 animate-slide-up" />
      <h2
        className={cx(
          "relative z-10 mt-[41px] max-w-[706px] animate-slide-up text-[clamp(34px,3.1vw,48px)] font-bold leading-[1.146] tracking-[0.03em]",
          familia,
        )}
        style={{ animationDelay: "150ms" }}
      >
        Controle de presenças simples, rápido e transparente.
      </h2>
      <p
        className={cx(
          "relative z-10 ml-[8px] mt-[48px] max-w-[648px] animate-slide-up text-[20px] font-bold leading-[30px] tracking-[0.03em]",
          familia,
        )}
        style={{ animationDelay: "300ms" }}
      >
        Controle de presença nas reuniões gerais, capacitações e eventos da Include Jr.
      </p>
    </aside>
  );
}