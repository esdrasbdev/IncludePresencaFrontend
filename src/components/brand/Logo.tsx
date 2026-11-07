import { cx } from "../../lib/cx";

type Props = {
  cor?: "branco" | "laranja";
  tamanho?: "grande" | "menu";
  className?: string;
};

/** Logo "<> Include" do protótipo. `grande` = telas de acesso; `menu` = barra lateral. */
export function Logo({ cor = "branco", tamanho = "grande", className }: Props) {
  const grande = tamanho === "grande";
  return (
    <div
      role="img"
      aria-label="Include"
      className={cx("flex select-none items-center", cor === "branco" ? "text-white" : "text-brand", className)}
    >
      <span
        aria-hidden="true"
        className={cx("font-akshar font-bold leading-none", grande ? "text-[96px]" : "text-[70px]")}
      >
        {"<>"}
      </span>
      <span
        aria-hidden="true"
        className={cx("font-poppins font-normal leading-none", grande ? "ml-[7px] text-[48px]" : "ml-[5px] text-[36px]")}
      >
        Include
      </span>
    </div>
  );
}
