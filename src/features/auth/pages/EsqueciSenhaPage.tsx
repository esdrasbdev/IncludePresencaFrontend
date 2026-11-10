import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock, Key } from "lucide-react";
import { z } from "zod";
import { BrandPanel } from "../../../components/brand/BrandPanel";
import { CampoContorno } from "../../../components/forms/CampoContorno";
import { mensagemDeErro } from "../../../lib/apiError";
import { authService } from "../services/authService";

const schema = z.object({ email: z.email("Informe um e-mail válido.") });
type FormEsqueci = z.infer<typeof schema>;

export function EsqueciSenhaPage() {
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);
  const [erroApi, setErroApi] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormEsqueci>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit({ email }: FormEsqueci) {
    setErroApi(null);
    setEnviadoPara(null);
    try {
      await authService.solicitarRedefinicaoSenha({ email });
      setEnviadoPara(email);
    } catch (error) {
      setErroApi(mensagemDeErro(error, "Não foi possível enviar o link. Tente novamente."));
    }
  }

  return (
    <main className="flex min-h-screen bg-white font-poppins text-ink">
      <BrandPanel fonte="inter" />
      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[400px]">
          <Link
            to="/login"
            className="mb-[14px] ml-[10px] inline-flex items-center gap-[7px] text-[16px] font-medium leading-[18px] text-muted hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
            Voltar ao login
          </Link>

          <div className="flex items-center gap-[15px]">
            <span className="grid size-[56px] shrink-0 place-items-center rounded-[14px] bg-brand-soft">
              <Key size={26} strokeWidth={2} className="text-brand-action" aria-hidden="true" />
            </span>
            <h1 className="text-[30px] font-bold leading-normal">Esqueceu a senha?</h1>
          </div>

          <p className="mt-[19px] text-[16px] leading-[21px] text-muted">
            Sem problema. Informe o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
          </p>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-[24px]">
            <p className="mb-[9px] ml-[3px] text-[14px] font-medium leading-[21px]">E-mail cadastrado</p>
            <CampoContorno
              tamanho="sm"
              rotulo="Email:"
              type="email"
              autoComplete="email"
              aria-label="E-mail cadastrado"
              placeholder="nome@email.com"
              erro={errors.email?.message}
              {...register("email")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-[19px] flex w-full cursor-pointer items-center justify-center rounded-[8px] bg-brand-action px-[18px] py-[11px] font-inter text-[16px] font-semibold leading-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
            </button>

            {enviadoPara && (
              <p role="status" className="mt-[14px] text-[14px] leading-[20px] text-success">
                Enviamos o link de redefinição para {enviadoPara}.
              </p>
            )}
            {erroApi && (
              <p role="alert" className="mt-[14px] text-[14px] leading-[20px] text-danger">
                {erroApi}
              </p>
            )}
          </form>

          <div className="mt-[26px] flex items-center gap-[10px] rounded-[10px] bg-wash p-[12px]">
            <Clock size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
            <p className="font-inter text-[16px] leading-normal text-muted">
              O link é válido por 30 minutos. Confira também a caixa de spam.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
