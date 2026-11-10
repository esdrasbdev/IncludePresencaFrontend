import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cx } from "../../../lib/cx";

export const TAMANHO_CODIGO = 6;

const limpar = (texto: string) => texto.toUpperCase().replace(/[^A-Z0-9]/g, "");

type Props = {
  valor: string;
  onChange: (valor: string) => void;
  desabilitado?: boolean;
  comErro?: boolean;
};

/** Seis caixas de um caractere (código de presença), com foco automático, colar e backspace. */
export function CodigoPresenca({ valor, onChange, desabilitado, comErro }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const foco = (i: number) => refs.current[Math.max(0, Math.min(i, TAMANHO_CODIGO - 1))]?.focus();

  function aoDigitar(i: number, texto: string) {
    const c = limpar(texto).slice(-1);
    if (!c) return;
    onChange((valor.slice(0, i) + c + valor.slice(i + 1)).slice(0, TAMANHO_CODIGO));
    foco(i + 1);
  }

  function aoTeclar(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (valor[i]) {
        onChange(valor.slice(0, i) + valor.slice(i + 1));
      } else if (i > 0) {
        onChange(valor.slice(0, i - 1) + valor.slice(i));
        foco(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      foco(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      foco(i + 1);
    }
  }

  function aoColar(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const texto = limpar(e.clipboardData.getData("text")).slice(0, TAMANHO_CODIGO);
    if (!texto) return;
    onChange(texto);
    foco(texto.length);
  }

  return (
    <div role="group" aria-label="Código de presença" className="flex gap-[10px]">
      {Array.from({ length: TAMANHO_CODIGO }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={valor[i] ?? ""}
          disabled={desabilitado}
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={2}
          aria-label={`Caractere ${i + 1} de ${TAMANHO_CODIGO}`}
          onFocus={() => {
            if (i > valor.length) foco(valor.length);
          }}
          onChange={(e) => aoDigitar(i, e.target.value)}
          onKeyDown={(e) => aoTeclar(i, e)}
          onPaste={aoColar}
          className={cx(
            "h-[68px] w-[60px] min-w-0 rounded-[10px] border bg-white text-center text-[28px] font-bold leading-normal text-ink caret-brand-action outline-none transition-colors focus:border-brand-action disabled:opacity-60",
            comErro ? "border-danger" : valor[i] ? "border-brand-action" : "border-line",
          )}
        />
      ))}
    </div>
  );
}
