import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Info } from "lucide-react";
import { mensagemDeErro } from "../../../lib/apiError";
import { cx } from "../../../lib/cx";
import { eventosService } from "../../eventos/services/eventosService";
import { CampoModal, ModalBase, entradaModal } from "./CamposModal";

const TOLERANCIA_PADRAO_MINUTOS = 15;

export function NovoEventoModal({ onFechar }: { onFechar: () => void }) {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [inicio, setInicio] = useState("");
  const [termino, setTermino] = useState("");
  const [obrigatorio, setObrigatorio] = useState(true);
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onFechar]);

  const criar = useMutation({
    mutationFn: () =>
      eventosService.criar({
        titulo: titulo.trim(),
        inicioEm: `${data}T${inicio}:00-03:00`,
        terminoEm: `${data}T${termino}:00-03:00`,
        toleranciaMinutos: TOLERANCIA_PADRAO_MINUTOS,
        obrigatorio,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["eventos"] });
      onFechar();
    },
  });

  const erros = {
    titulo: titulo.trim().length < 3 ? "Informe o título do evento." : undefined,
    data: !data ? "Informe a data." : undefined,
    inicio: !inicio ? "Informe o horário." : undefined,
    termino: !termino ? "Informe o horário." : inicio && termino <= inicio ? "O término deve ser após o início." : undefined,
  };
  const valido = !Object.values(erros).some(Boolean);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (valido) criar.mutate();
  }

  return (
    <ModalBase titulo="Novo evento" tituloId="titulo-novo-evento" onFechar={onFechar}>
      <form noValidate onSubmit={enviar}>
        <div className="mt-[14px] flex flex-col gap-[16px]">
          <CampoModal rotulo="Título do evento" erro={tentou ? erros.titulo : undefined}>
            <input autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Reunião geral" className={entradaModal} />
          </CampoModal>
          <CampoModal rotulo="Data" erro={tentou ? erros.data : undefined} icone={<Calendar size={20} strokeWidth={2.2} aria-hidden="true" />}>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={entradaModal} />
          </CampoModal>
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <CampoModal rotulo="Hora de início" erro={tentou ? erros.inicio : undefined} icone={<Clock size={20} strokeWidth={2.2} aria-hidden="true" />}>
              <input type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} className={entradaModal} />
            </CampoModal>
            <CampoModal rotulo="Hora de término" erro={tentou ? erros.termino : undefined} icone={<Clock size={20} strokeWidth={2.2} aria-hidden="true" />}>
              <input type="time" value={termino} onChange={(e) => setTermino(e.target.value)} className={entradaModal} />
            </CampoModal>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[#f4f4f5] px-[16px] py-[10px]">
            <div className="leading-[1.25]">
              <p className="text-[15px] font-bold text-black">Evento obrigatório</p>
              <p className="text-[13px] text-muted">Entra no cálculo de assiduidade. Eventos opcionais geram apenas bônus.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={obrigatorio}
              aria-label="Evento obrigatório"
              onClick={() => setObrigatorio((o) => !o)}
              className={cx("relative h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full transition-colors", obrigatorio ? "bg-brand-action" : "bg-[#a1a1aa]")}
            >
              <span className={cx("absolute top-[2px] size-[20px] rounded-full bg-white transition-all", obrigatorio ? "left-[22px]" : "left-[2px]")} />
            </button>
          </div>

          <div className="flex items-center gap-[10px] rounded-[10px] bg-[#ffeeee] px-[16px] py-[12px] text-[#e43636]">
            <Info size={18} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
            <p className="text-[13px] leading-[1.25]">
              A presença fica disponível no horário agendado. Registro até {TOLERANCIA_PADRAO_MINUTOS} minutos após o início constam como “Presente”.
            </p>
          </div>

          {criar.isError && (
            <p role="alert" className="text-[13px] font-medium text-[#b91c1c]">
              {mensagemDeErro(criar.error, "Não foi possível criar o evento. Tente novamente.")}
            </p>
          )}
        </div>

        <div className="mt-[22px] flex items-center justify-end gap-[14px]">
          <button type="button" onClick={onFechar} className="h-[43px] w-[142px] cursor-pointer rounded-[15px] border border-[#d4d4d8] bg-white text-[16px] font-bold text-black hover:bg-wash">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={criar.isPending}
            className="h-[52px] w-[155px] cursor-pointer rounded-[15px] bg-brand-action text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {criar.isPending ? "Criando..." : "Criar evento"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
