import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Clock, Copy, Info, User } from "lucide-react";
import { StatusBadge, type VarianteBadge } from "../../../components/ui/StatusBadge";
import { mensagemDeErro, statusHttp } from "../../../lib/apiError";
import { dataCompleta, intervalo } from "../../../lib/format";
import { presencasService } from "../../presencas/services/presencasService";
import type { Evento } from "../../eventos/types/evento";
import { ModalBase } from "./CamposModal";

type Props = {
  evento: Evento;
  status: { variante: VarianteBadge; rotulo: string };
  /** Presença só pode ser confirmada com o evento aberto (mesma regra do membro). */
  aberto: boolean;
  onFechar: () => void;
};

// Eventos em que o diretor já confirmou nesta sessão (o backend ainda não informa isso).
const confirmadosNaSessao = new Set<string>();

function Linha({ icone, rotulo, children }: { icone: React.ReactNode; rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[12px]">
      <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#f4f4f5] text-black">{icone}</span>
      <div className="min-w-0 leading-[1.25]">
        <p className="text-[13px] text-muted">{rotulo}</p>
        <p className="text-[15px] font-semibold text-black">{children}</p>
      </div>
    </div>
  );
}

/** Detalhes do evento (diretoria): informações, como funciona o registro e a senha de presença. */
export function DetalhesEventoModal({ evento, status, aberto, onFechar }: Props) {
  const queryClient = useQueryClient();
  const [copiado, setCopiado] = useState(false);
  const [confirmado, setConfirmado] = useState(() => confirmadosNaSessao.has(evento.id));
  const [erro, setErro] = useState<string | null>(null);
  const { data: codigo, isLoading, isError } = useQuery({
    queryKey: ["eventos", evento.id, "codigo-presenca"],
    queryFn: () => presencasService.obterCodigo(evento.id),
    retry: false,
  });

  // O diretor confirma a própria presença com a senha que já está na tela, sem precisar digitar.
  const checkin = useMutation({
    mutationFn: () => presencasService.confirmarCheckin(evento.id, { codigo: codigo! }),
    onSuccess: () => {
      confirmadosNaSessao.add(evento.id);
      setConfirmado(true);
      setErro(null);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      const status = statusHttp(error);
      if (status === 409) {
        confirmadosNaSessao.add(evento.id);
        setConfirmado(true);
        return;
      }
      const senhaRuim =
        (error instanceof Error && error.message === "CODIGO_INVALIDO") || status === 400 || status === 404 || status === 422;
      setErro(
        senhaRuim
          ? "A senha deste evento não foi aceita. Feche e abra os detalhes para carregá-la de novo."
          : mensagemDeErro(error, "Não foi possível confirmar sua presença. Tente novamente."),
      );
    },
  });

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onFechar]);

  async function copiar() {
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sem permissão de área de transferência: o código continua visível para copiar à mão */
    }
  }

  return (
    <ModalBase titulo="Detalhes do evento" tituloId="titulo-detalhes-evento" onFechar={onFechar}>
      <div className="mt-[14px] flex flex-col gap-[16px]">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 text-[20px] font-bold leading-[1.2] text-black">{evento.titulo}</p>
          <StatusBadge variante={status.variante}>{status.rotulo}</StatusBadge>
        </div>

        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          <Linha icone={<Calendar size={18} strokeWidth={2.2} aria-hidden="true" />} rotulo="Data">{dataCompleta(evento.inicioEm)}</Linha>
          <Linha icone={<Clock size={18} strokeWidth={2.2} aria-hidden="true" />} rotulo="Horário">{intervalo(evento.inicioEm, evento.terminoEm)}</Linha>
          <Linha icone={<Clock size={18} strokeWidth={2.2} aria-hidden="true" />} rotulo="Tolerância">{evento.toleranciaMinutos != null ? `${evento.toleranciaMinutos} min` : "—"}</Linha>
          <Linha icone={<User size={18} strokeWidth={2.2} aria-hidden="true" />} rotulo="Responsável">{evento.responsavelNome ?? "—"}</Linha>
        </div>

        {evento.obrigatorio !== undefined && (
          <div className="rounded-[10px] bg-[#f4f4f5] px-[16px] py-[10px] leading-[1.25]">
            <p className="text-[15px] font-bold text-black">{evento.obrigatorio ? "Evento obrigatório" : "Evento opcional"}</p>
            <p className="text-[13px] text-muted">
              {evento.obrigatorio ? "Entra no cálculo de assiduidade." : "Gera apenas bônus de assiduidade."}
            </p>
          </div>
        )}

        <div>
          <p className="mb-[6px] text-[16px] font-medium leading-normal text-black">Senha de presença</p>
          <div className="flex items-center justify-between gap-[12px] rounded-[15px] border border-[#d4d4d8] bg-white px-[20px] py-[12px]">
            <p
              aria-live="polite"
              aria-label={codigo ? `Senha de presença: ${codigo.split("").join(" ")}` : undefined}
              className="min-w-0 truncate font-mono text-[30px] font-bold leading-normal tracking-[0.3em] text-black"
            >
              {codigo ?? (isLoading ? "······" : "—")}
            </p>
            <button
              type="button"
              onClick={copiar}
              disabled={!codigo}
              className="flex h-[40px] shrink-0 cursor-pointer items-center gap-[6px] rounded-[10px] border border-[#d4d4d8] bg-white px-[14px] text-[14px] font-semibold text-black hover:bg-wash disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copiado ? <Check size={16} strokeWidth={2.5} aria-hidden="true" /> : <Copy size={16} strokeWidth={2.2} aria-hidden="true" />}
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          {isError && (
            <p role="alert" className="mt-[4px] pl-[8px] text-[12px] text-[#b91c1c]">
              Não foi possível carregar a senha deste evento. Tente novamente.
            </p>
          )}
        </div>

        <div className="flex items-start gap-[10px] rounded-[10px] bg-[#ffeeee] px-[16px] py-[12px] text-[#e43636]">
          <Info size={18} strokeWidth={2.5} className="mt-[1px] shrink-0" aria-hidden="true" />
          <p className="text-[13px] leading-[1.35]">
            Informe esta senha aos membros durante o evento. Cada membro abre <strong>Registrar presença</strong>, digita os 6 caracteres e confirma.
            {evento.toleranciaMinutos != null && ` Registros até ${evento.toleranciaMinutos} minutos após o início constam como “Presente”.`}
          </p>
        </div>
      </div>

      {erro && (
        <p role="alert" className="mt-[12px] pl-[8px] text-[12px] text-[#b91c1c]">
          {erro}
        </p>
      )}
      {confirmado && (
        <p role="status" className="mt-[12px] pl-[8px] text-[13px] font-medium text-success">
          Sua presença neste evento está confirmada.
        </p>
      )}
      {!aberto && !confirmado && (
        <p className="mt-[12px] pl-[8px] text-[12px] text-subtle">Você poderá confirmar sua presença quando o evento estiver aberto.</p>
      )}

      <div className="mt-[22px] flex flex-wrap items-center justify-end gap-[12px]">
        <button type="button" onClick={onFechar} className="h-[43px] w-[142px] cursor-pointer rounded-[15px] border border-[#d4d4d8] bg-white text-[16px] font-bold text-black hover:bg-wash">
          Fechar
        </button>
        <button
          type="button"
          onClick={() => {
            setErro(null);
            checkin.mutate();
          }}
          disabled={!aberto || !codigo || confirmado || checkin.isPending}
          className="flex h-[43px] min-w-[142px] cursor-pointer items-center justify-center gap-[8px] rounded-[15px] bg-brand-action px-[22px] text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {confirmado && <Check size={18} strokeWidth={2.5} aria-hidden="true" />}
          {confirmado ? "Presença confirmada" : checkin.isPending ? "Confirmando..." : "Confirmar minha presença"}
        </button>
      </div>
    </ModalBase>
  );
}
