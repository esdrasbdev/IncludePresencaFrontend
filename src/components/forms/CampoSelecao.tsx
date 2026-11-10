import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "../../lib/cx";

type Props = {
  rotulo: string;
  valor: string;
  opcoes: readonly string[];
  onChange: (valor: string) => void;
  erro?: string;
  className?: string;
};

/** Lista suspensa no estilo do campo "Setor" do protótipo. */
export function CampoSelecao({ rotulo, valor, opcoes, onChange, erro, className }: Props) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const listaId = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (evento: MouseEvent) => {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false);
    };
    const esc = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={raiz} className={cx("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={listaId}
        onClick={() => setAberto((a) => !a)}
        className={cx(
          "flex h-[84px] w-full items-center justify-between rounded-[20px] border bg-white px-[24px] font-poppins text-[20px] text-black outline-none transition-colors focus-visible:border-brand",
          erro ? "border-danger" : "border-black",
        )}
      >
        <span>{valor || rotulo}</span>
        <ChevronDown size={30} strokeWidth={1.5} className={cx("text-subtle transition-transform", aberto && "rotate-180")} />
      </button>
      {aberto && (
        <ul
          id={listaId}
          role="listbox"
          aria-label={rotulo}
          className="absolute left-0 right-0 z-20 mt-[8px] max-h-[264px] overflow-y-auto rounded-[15px] border border-black bg-white py-[8px] shadow-lg"
        >
          {opcoes.map((opcao) => (
            <li key={opcao} role="option" aria-selected={opcao === valor}>
              <button
                type="button"
                onClick={() => {
                  onChange(opcao);
                  setAberto(false);
                }}
                className={cx(
                  "block w-full px-[24px] py-[6px] text-left font-poppins text-[20px] text-black hover:bg-brand-soft focus-visible:bg-brand-soft focus-visible:outline-none",
                  opcao === valor && "bg-brand-soft",
                )}
              >
                {opcao}
              </button>
            </li>
          ))}
        </ul>
      )}
      {erro && (
        <p role="alert" className="mt-[6px] pl-[8px] font-poppins text-[12px] text-danger">
          {erro}
        </p>
      )}
    </div>
  );
}
