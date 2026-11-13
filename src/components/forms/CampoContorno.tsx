import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cx } from "../../lib/cx";

type Tamanho = "lg" | "md" | "sm" | "sm14";

const estilos: Record<Tamanho, { caixa: string; rotulo: string; entrada: string; botao: string }> = {
  // Login: caixa de 79px
  lg: {
    caixa: "h-[79px] px-[21px] pt-[15px]",
    rotulo: "text-[20px] leading-[24px]",
    entrada: "text-[15px] leading-[18px] placeholder:text-black",
    botao: "top-[39px]",
  },
  // Cadastro: caixa de 82px
  md: {
    caixa: "h-[82px] px-[21px] pt-[16px]",
    rotulo: "text-[20px] leading-[25px]",
    entrada: "mt-[4px] text-[13px] leading-[19px] placeholder:text-black/70",
    botao: "top-[41px]",
  },
  // Redefinição de senha: caixa de 60px com texto de 14px
  sm14: {
    caixa: "h-[60px] px-[15px] pt-[7px]",
    rotulo: "text-[16px] leading-[24px]",
    entrada: "text-[14px] leading-[18px] placeholder:text-black",
    botao: "top-[30px]",
  },
  // Recuperação de senha: caixa de 60px
  sm: {
    caixa: "h-[60px] px-[15px] pt-[7px]",
    rotulo: "text-[16px] leading-[24px]",
    entrada: "text-[12px] leading-[18px] placeholder:text-black",
    botao: "top-[30px]",
  },
};

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  rotulo: string;
  erro?: string;
  tamanho?: Tamanho;
  mostrarSenha?: boolean;
};

/** Campo com contorno arredondado e rótulo dentro da caixa, como no protótipo. */
export const CampoContorno = forwardRef<HTMLInputElement, Props>(function CampoContorno(
  { rotulo, erro, tamanho = "lg", className, mostrarSenha = false, type, ...input },
  ref,
) {
  const e = estilos[tamanho];
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const tipoEntrada = mostrarSenha && type === "password" && senhaVisivel ? "text" : type;

  return (
    <div className={cx("relative", className)}>
      <label
        className={cx(
          "block cursor-text rounded-[20px] border bg-white font-poppins text-black transition-colors focus-within:border-brand",
          e.caixa,
          erro ? "border-danger" : "border-black",
        )}
      >
        <span className={cx("block", e.rotulo)}>{rotulo}</span>
        <input
          ref={ref}
          aria-invalid={erro ? true : undefined}
          className={cx("block w-full bg-transparent outline-none", e.entrada, mostrarSenha && "pr-12")}
          type={tipoEntrada}
          {...input}
        />
      </label>
      {mostrarSenha && type === "password" && (
        <button
          type="button"
          aria-label={senhaVisivel ? "Ocultar senha" : "Visualizar senha"}
          aria-pressed={senhaVisivel}
          onClick={() => setSenhaVisivel((visivel) => !visivel)}
          className={cx(
            "absolute right-[18px] rounded-md p-1 text-black/70 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            e.botao,
          )}
        >
          {senhaVisivel ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      )}
      {erro && (
        <p role="alert" className="mt-[6px] pl-[8px] font-poppins text-[12px] text-danger">
          {erro}
        </p>
      )}
    </div>
  );
});
