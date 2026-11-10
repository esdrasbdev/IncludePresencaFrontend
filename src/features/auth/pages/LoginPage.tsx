import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BrandPanel } from "../../../components/brand/BrandPanel";
import { CampoContorno } from "../../../components/forms/CampoContorno";
import { CaixaMarcacao } from "../../../components/forms/CaixaMarcacao";
import { mensagemDeErro, statusHttp } from "../../../lib/apiError";
import { authService } from "../services/authService";

const schema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
  manterConectado: z.boolean(),
});
type FormLogin = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const estado = location.state as { contaAtivada?: boolean; senhaRedefinida?: boolean } | null;
  const contaAtivada = estado?.contaAtivada;
  const senhaRedefinida = estado?.senhaRedefinida;
  const [erroApi, setErroApi] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormLogin>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "", manterConectado: false },
  });

  async function onSubmit({ email, senha, manterConectado }: FormLogin) {
    setErroApi(null);
    try {
      // "Manter conectado": guarda o token no localStorage; desmarcado, vale só até fechar a aba.
      const { perfil } = await authService.login({ email, senha, manterConectado });
      navigate(perfil === "DIRETORIA" ? "/diretoria" : "/", { replace: true });
    } catch (error) {
      setErroApi(
        statusHttp(error) === 401
          ? "E-mail ou senha incorretos."
          : mensagemDeErro(error, "Não foi possível entrar. Tente novamente."),
      );
    }
  }

  return (
    <main className="flex min-h-screen bg-white font-poppins text-black">
      <BrandPanel fonte="poppins" />
      <section className="flex flex-1 items-center justify-center px-6 py-10 lg:px-[clamp(24px,5.5vw,86px)]">
        <div className="w-full max-w-[602px]">
          <h1 className="mb-[42px] text-center text-[30px] font-semibold leading-normal">Fazer login</h1>

          {contaAtivada && (
            <p role="status" className="mb-[20px] text-center text-[16px] text-success">
              Conta ativada! Faça login para continuar.
            </p>
          )}

          {senhaRedefinida && (
            <p role="status" className="mb-[20px] text-center text-[16px] text-success">
              Senha redefinida! Entre com a nova senha.
            </p>
          )}

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[26px]">
            <CampoContorno
              tamanho="lg"
              rotulo="Email:"
              type="email"
              autoComplete="email"
              placeholder="nome@email.com"
              erro={errors.email?.message}
              {...register("email")}
            />
            <CampoContorno
              tamanho="lg"
              rotulo="Senha:"
              type="password"
              autoComplete="current-password"
              placeholder="**********"
              erro={errors.senha?.message}
              {...register("senha")}
            />

            <div className="flex items-center justify-between gap-4 text-[20px] leading-[30px]">
              <Controller
                control={control}
                name="manterConectado"
                render={({ field }) => (
                  <CaixaMarcacao marcado={field.value} onChange={field.onChange} lado={25} className="ml-[12px] gap-[14px]">
                    <span>Manter conectado</span>
                  </CaixaMarcacao>
                )}
              />
              <Link to="/esqueci-senha" className="text-brand underline underline-offset-[3px]">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-[10px] h-[40px] w-full cursor-pointer rounded-[15px] border border-white bg-brand text-[20px] font-normal leading-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>

            {erroApi && (
              <p role="alert" className="-mt-[8px] text-center text-[14px] text-danger">
                {erroApi}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
