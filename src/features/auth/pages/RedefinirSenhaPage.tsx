import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "../../../components/brand/Logo";
import { CampoContorno } from "../../../components/forms/CampoContorno";
import { env } from "../../../config/env";
import { mensagemDeErro, statusHttp } from "../../../lib/apiError";
import { CriteriosSenha } from "../components/CriteriosSenha";
import { senhaValida } from "../lib/senha";
import { authService } from "../services/authService";

const schema = z
  .object({
    senha: z.string().refine(senhaValida, "A senha não atende a todos os critérios."),
    confirmarSenha: z.string().min(1, "Confirme sua senha."),
  })
  .refine((d) => d.senha === d.confirmarSenha, { path: ["confirmarSenha"], message: "As senhas não coincidem." });

type FormRedefinir = z.infer<typeof schema>;

const TEXTOS = {
  redefinir: {
    titulo: "Redefinição de Senha",
    descricao: "Crie uma nova senha para acessar sua conta.",
    acao: "Redefinir senha",
    acaoEmAndamento: "Redefinindo...",
    linkInvalido: "Link de redefinição inválido. Solicite um novo link.",
    expirado: "Este link expirou ou já foi usado. Solicite um novo link.",
    falha: "Não foi possível redefinir a senha. Tente novamente.",
  },
  ativar: {
    titulo: "Ative sua conta",
    descricao: "Crie uma senha para acessar o IncludePresença.",
    acao: "Ativar conta",
    acaoEmAndamento: "Ativando...",
    linkInvalido: "Link de ativação inválido. Peça um novo convite à Diretoria.",
    expirado: "Este convite expirou ou já foi usado. Peça um novo convite à Diretoria.",
    falha: "Não foi possível ativar a conta. Tente novamente.",
  },
} as const;

/** Define a senha a partir do token do e-mail: `redefinir` (/reset-password) ou `ativar` (/activate). */
export function RedefinirSenhaPage({ modo = "redefinir" }: { modo?: keyof typeof TEXTOS }) {
  const textos = TEXTOS[modo];
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [erroApi, setErroApi] = useState<string | null>(null);
  const linkInvalido = !token && !env.useMocks;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormRedefinir>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { senha: "", confirmarSenha: "" },
  });

  const senha = watch("senha");

  async function onSubmit({ senha }: FormRedefinir) {
    setErroApi(null);
    try {
      if (modo === "ativar") {
        await authService.ativarConta({ token: token ?? "", senha });
        navigate("/login", { replace: true, state: { contaAtivada: true } });
      } else {
        await authService.redefinirSenha({ token: token ?? "", senha });
        navigate("/login", { replace: true, state: { senhaRedefinida: true } });
      }
    } catch (error) {
      setErroApi(
        [400, 409, 410].includes(statusHttp(error) ?? 0)
          ? textos.expirado
          : mensagemDeErro(error, textos.falha),
      );
    }
  }

  return (
    <main className="flex min-h-screen bg-white font-poppins text-black">
      <aside aria-hidden="true" className="bg-brand-gradient hidden w-1/2 shrink-0 lg:block" />
      <section className="relative flex flex-1 items-center justify-center px-6 py-10">
        <Logo cor="laranja" tamanho="grande" className="absolute left-1/2 top-[46px] -translate-x-1/2 max-lg:static max-lg:mb-8 max-lg:translate-x-0" />

        <div className="w-full max-w-[400px]">
          <h1 className="text-[30px] font-bold leading-normal text-ink">{textos.titulo}</h1>
          <p className="mt-[12px] text-[16px] leading-normal">{textos.descricao}</p>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-[25px]">
            <div className="flex flex-col gap-[17px]">
              <CampoContorno
                tamanho="sm14"
                rotulo="Senha:"
                type="password"
                autoComplete="new-password"
                placeholder="*******"
                erro={errors.senha?.message}
                {...register("senha")}
              />
              <CampoContorno
                tamanho="sm14"
                rotulo="Confirmar senha:"
                type="password"
                autoComplete="new-password"
                placeholder="*******"
                erro={errors.confirmarSenha?.message}
                {...register("confirmarSenha")}
              />
            </div>

            <div className="mt-[17px]">
              <CriteriosSenha senha={senha} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || linkInvalido}
              className="mt-[25px] flex h-[41px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-brand text-[16px] font-normal leading-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? textos.acaoEmAndamento : textos.acao}
            </button>

            {(erroApi || linkInvalido) && (
              <p role="alert" className="mt-[14px] text-[14px] leading-[20px] text-danger">
                {linkInvalido ? textos.linkInvalido : erroApi}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
