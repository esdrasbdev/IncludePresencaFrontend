import { Check, X } from "lucide-react";
import { cx } from "../../../lib/cx";
import { CRITERIOS_SENHA } from "../lib/senha";

/** Legenda dos critérios de senha: vermelho (X) enquanto não atendido, verde (✓) ao atender. */
export function CriteriosSenha({ senha }: { senha: string }) {
  return (
    <ul aria-label="Critérios da senha" className="flex flex-col gap-[8px] pl-[24px] font-poppins text-[13px]">
      {CRITERIOS_SENHA.map((criterio) => {
        const ok = criterio.atende(senha);
        return (
          <li key={criterio.id} className={cx("flex items-center gap-[8px] leading-[20px]", ok ? "text-success" : "text-danger")}>
            <span className="grid w-[22px] shrink-0 place-items-center">
              {ok ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
            </span>
            <span>{criterio.rotulo}</span>
            <span className="sr-only">{ok ? "atendido" : "não atendido"}</span>
          </li>
        );
      })}
    </ul>
  );
}
