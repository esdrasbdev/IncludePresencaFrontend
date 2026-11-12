import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { mensagemDeErro, statusHttp } from "../../../lib/apiError";
import { hora, intervalo, rotuloDia, dataCurta, somarMinutos } from "../../../lib/format";
import { CodigoPresenca, TAMANHO_CODIGO } from "../components/CodigoPresenca";
import { useEventoAberto } from "../hooks/useEventoAberto";
import { presencasService } from "../services/presencasService";

const CODIGO_RUIM = "Código inválido ou expirado. Confira com o responsável pelo evento.";

export function AttendancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: evento, isLoading } = useEventoAberto();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const checkin = useMutation({
    mutationFn: () => presencasService.confirmarCheckin(evento!.id, { codigo }),
    onSuccess: () => {
      setConfirmado(true);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      const status = statusHttp(error);
      const codigoRuim =
        (error instanceof Error && error.message === "CODIGO_INVALIDO") ||
        status === 400 ||
        status === 404 ||
        status === 409 ||
        status === 422;
      setErro(codigoRuim ? CODIGO_RUIM : mensagemDeErro(error, "Não foi possível confirmar sua presença. Tente novamente."));
    },
  });

  useEffect(() => {
    if (!confirmado) return;
    const t = setTimeout(() => navigate("/historico"), 1600);
    return () => clearTimeout(t);
  }, [confirmado, navigate]);

  function confirmar() {
    if (!evento) return;
    if (codigo.length < TAMANHO_CODIGO) {
      setErro(`Digite os ${TAMANHO_CODIGO} caracteres do código.`);
      return;
    }
    setErro(null);
    checkin.mutate();
  }

  const limite = evento && evento.toleranciaMinutos != null ? hora(somarMinutos(evento.inicioEm, evento.toleranciaMinutos)) : null;
  const bloqueado = !evento || checkin.isPending || confirmado;

  return (
    <div className="px-[clamp(20px,3vw,38px)] pb-[60px] pt-[clamp(32px,6vw,72px)]">
      <header className="flex flex-col gap-[4px]">
        <h1 className="text-[36px] font-bold leading-normal text-ink">Confirmar presença</h1>
        <p className="text-[18px] leading-normal text-muted">Insira o código informado pelo responsável do evento.</p>
      </header>

      <div className="mt-[58px] flex flex-wrap items-start gap-[42px]">
        <section
          aria-label="Código de presença"
          className="flex min-h-[480px] w-full max-w-[701px] flex-1 flex-col gap-[18px] rounded-[12px] border border-line bg-white p-[32px] lg:w-[701px] lg:flex-none"
        >
          <div className="flex items-center justify-between gap-4">
            {evento ? (
              <>
                <div className="flex flex-col gap-[2px] leading-normal">
                  <h2 className="text-[20px] font-bold text-ink">{evento.titulo}</h2>
                  <p className="whitespace-pre text-[13px] text-muted">
                    {`${rotuloDia(evento.inicioEm)}, ${dataCurta(evento.inicioEm)}  ·  ${intervalo(evento.inicioEm, evento.terminoEm)}`}
                  </p>
                </div>
                <StatusBadge variante="presente">● Aberto</StatusBadge>
              </>
            ) : (
              <p className="text-[16px] leading-normal text-muted">
                {isLoading ? "Carregando evento..." : "Nenhum evento aberto no momento."}
              </p>
            )}
          </div>

          <p id="rotulo-codigo" className="text-[13px] font-medium leading-normal text-ink">
            Código de presença
          </p>
          <CodigoPresenca
            valor={codigo}
            onChange={(v) => {
              setCodigo(v);
              if (erro) setErro(null);
            }}
            desabilitado={bloqueado}
            comErro={Boolean(erro)}
          />

          <button
            type="button"
            onClick={confirmar}
            disabled={bloqueado}
            className="flex w-full cursor-pointer items-center justify-center rounded-[8px] bg-brand-action px-[18px] py-[14px] text-[14px] font-semibold leading-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkin.isPending ? "Confirmando..." : "Confirmar presença"}
          </button>

          {erro && (
            <p role="alert" className="text-[12px] leading-normal text-[#b91c1c]">
              {erro}
            </p>
          )}
          {confirmado && (
            <p role="status" className="text-[12px] font-medium leading-normal text-success">
              Presença confirmada! Levando você ao histórico...
            </p>
          )}

          <p className="text-[12px] leading-normal text-subtle">
            Cada código vale para um evento e expira ao fim da tolerância.
          </p>
        </section>

        <aside
          aria-label="Como funciona"
          className="flex w-full max-w-[400px] flex-col gap-[16px] rounded-[12px] border border-line bg-white p-[24px]"
        >
          <h2 className="text-[16px] font-semibold leading-normal text-ink">Como funciona</h2>

          {[
            { n: 1, titulo: "Peça o código", texto: "O responsável do evento exibe o código de 6 caracteres." },
            { n: 2, titulo: "Digite e confirme", texto: "Insira o código ao lado e toque em confirmar." },
            {
              n: 3,
              titulo: "Veja seu status",
              texto: limite
                ? `Até ${limite} você consta como Presente; depois, Atraso.`
                : "Até o fim da tolerância você consta como Presente; depois, Atraso.",
            },
          ].map((passo) => (
            <div key={passo.n} className="flex items-start gap-[12px]">
              <span className="grid size-[28px] shrink-0 place-items-center rounded-full bg-brand-soft text-[13px] font-bold leading-normal text-brand-ink">
                {passo.n}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-[2px] leading-normal">
                <p className="text-[14px] font-semibold text-ink">{passo.titulo}</p>
                <p className="text-[13px] text-muted">{passo.texto}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-[10px] rounded-[10px] bg-brand-soft p-[12px]">
            <Info size={18} strokeWidth={2} className="shrink-0 text-brand-action" aria-hidden="true" />
            <p className="text-[12px] leading-normal text-brand-ink">
              Tolerância de {evento?.toleranciaMinutos ?? 15} minutos após o início do evento.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
