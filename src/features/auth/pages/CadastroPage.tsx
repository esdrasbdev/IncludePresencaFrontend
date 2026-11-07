import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { CampoContorno } from "../../../components/forms/CampoContorno";
import { CampoSelecao } from "../../../components/forms/CampoSelecao";
import { CaixaMarcacao } from "../../../components/forms/CaixaMarcacao";
import { mensagemDeErro, statusHttp } from "../../../lib/apiError";
import { cx } from "../../../lib/cx";
import { CriteriosSenha } from "../components/CriteriosSenha";
import { senhaValida } from "../lib/senha";
import { SETORES } from "../lib/setores";
import { authService } from "../services/authService";

function mascararTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const schema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo."),
    numero: z.string().regex(/^\(\d{2}\) 9\d{4}-\d{4}$/, "Use o formato (00) 90000-0000."),
    setor: z.string().min(1, "Selecione um setor."),
    email: z.email("Informe um e-mail válido."),
    senha: z.string().refine(senhaValida, "A senha não atende a todos os critérios."),
    confirmarSenha: z.string().min(1, "Confirme sua senha."),
    aceito: z.boolean().refine((v) => v, "Aceite a Política de Privacidade e os Termos de Serviços."),
  })
  .refine((d) => d.senha === d.confirmarSenha, { path: ["confirmarSenha"], message: "As senhas não coincidem." });

type FormCadastro = z.infer<typeof schema>;

export function CadastroPage() {
  const navigate = useNavigate();
  const [erroApi, setErroApi] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormCadastro>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { nome: "", numero: "", setor: "", email: "", senha: "", confirmarSenha: "", aceito: false },
  });

  const senha = watch("senha");

  async function onSubmit({ nome, numero, setor, email, senha }: FormCadastro) {
    setErroApi(null);
    try {
      await authService.cadastrar({ nome, numero, setor, email, senha });
      navigate("/login", { replace: true, state: { cadastroConcluido: true } });
    } catch (error) {
      setErroApi(
        statusHttp(error) === 409
          ? "Este e-mail já está cadastrado."
          : mensagemDeErro(error, "Não foi possível concluir o cadastro. Tente novamente."),
      );
    }
  }

  return (
    <main className="flex min-h-screen bg-white font-poppins text-black">
      <section className="flex-1 px-6 pb-[60px] pt-[36px] lg:pl-[clamp(32px,6.2vw,90px)] lg:pr-[clamp(32px,4vw,64px)]">
        <div className="mx-auto w-full max-w-[626px] lg:mx-0">
          <Link
            to="/login"
            className="inline-flex items-center gap-[7px] text-[16px] font-medium leading-[18px] text-muted hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={2} aria-hidden="true" />
            Voltar
          </Link>
          <h1 className="mt-[6px] text-[35px] font-bold leading-normal">Cadastrar membro</h1>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-[21px]">
            <div className="grid grid-cols-1 gap-x-[29px] gap-y-[26px] sm:grid-cols-2">
              <CampoContorno
                tamanho="md"
                rotulo="Nome:"
                autoComplete="name"
                placeholder="Ex.: Maria Isabel"
                erro={errors.nome?.message}
                className="sm:col-span-2"
                {...register("nome")}
              />
              <Controller
                control={control}
                name="numero"
                render={({ field }) => (
                  <CampoContorno
                    tamanho="md"
                    rotulo="Número:"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="(00) 90000-0000"
                    erro={errors.numero?.message}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value}
                    onChange={(e) => field.onChange(mascararTelefone(e.target.value))}
                  />
                )}
              />
              <Controller
                control={control}
                name="setor"
                render={({ field }) => (
                  <CampoSelecao
                    rotulo="Setor"
                    opcoes={SETORES}
                    valor={field.value}
                    onChange={field.onChange}
                    erro={errors.setor?.message}
                  />
                )}
              />
              <CampoContorno
                tamanho="md"
                rotulo="Email:"
                type="email"
                autoComplete="email"
                placeholder="nome@gmail.com"
                erro={errors.email?.message}
                className="sm:col-span-2"
                {...register("email")}
              />
              <CampoContorno
                tamanho="md"
                rotulo="Senha:"
                type="password"
                autoComplete="new-password"
                placeholder="*********"
                erro={errors.senha?.message}
                {...register("senha")}
              />
              <CampoContorno
                tamanho="md"
                rotulo="Confirmar senha:"
                type="password"
                autoComplete="new-password"
                placeholder="*********"
                erro={errors.confirmarSenha?.message}
                {...register("confirmarSenha")}
              />
            </div>

            <div className="mt-[23px]">
              <CriteriosSenha senha={senha} />
            </div>

            <div className="mt-[27px] flex flex-col items-center">
              <Controller
                control={control}
                name="aceito"
                render={({ field }) => (
                  <CaixaMarcacao marcado={field.value} onChange={field.onChange} lado={14} className="gap-[6px] font-inter text-[13px] leading-[16px]">
                    <span>
                      Eu aceito a <strong className="font-bold">Política de Privacidade</strong> e os{" "}
                      <strong className="font-bold">Termos de Serviços</strong>
                    </span>
                  </CaixaMarcacao>
                )}
              />
              {errors.aceito && (
                <p role="alert" className="mt-[6px] text-[12px] text-danger">
                  {errors.aceito.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cx(
                  "mt-[23px] h-[45px] w-[170px] cursor-pointer rounded-[15px] font-inter text-[13px] font-bold leading-normal text-white transition-colors",
                  isSubmitting ? "cursor-not-allowed bg-brand-disabled" : "bg-brand hover:bg-brand-disabled",
                )}
              >
                {isSubmitting ? "ENVIANDO..." : "CADASTRAR"}
              </button>

              {erroApi && (
                <p role="alert" className="mt-[12px] text-center text-[13px] text-danger">
                  {erroApi}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
      <aside aria-hidden="true" className="bg-brand-gradient hidden w-[43.4%] shrink-0 lg:block" />
    </main>
  );
}
