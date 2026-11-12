import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Plus } from "lucide-react";
import { env } from "../../../config/env";
import { StatusBadge, type VarianteBadge } from "../../../components/ui/StatusBadge";
import { cx } from "../../../lib/cx";
import { dataCompleta, hora, intervalo, rotuloDia } from "../../../lib/format";
import { eventosService } from "../../eventos/services/eventosService";
import type { Evento, StatusEvento } from "../../eventos/types/evento";
import { BarraMeta, CampoBusca, Chip, Indicador } from "../components/Indicador";
import { baixarArquivo } from "../../../lib/download";
import { DetalhesEventoModal } from "../components/DetalhesEventoModal";
import { NovoEventoModal } from "../components/NovoEventoModal";

const META = 75;
type Filtro = "TODOS" | "ABAIXO" | "EM_DIA";

const statusBadge: Record<StatusEvento, { variante: VarianteBadge; rotulo: string }> = {
  ABERTO: { variante: "presente", rotulo: "● Aberto" },
  AGENDADO: { variante: "agendado", rotulo: "Agendado" },
  ENCERRADO: { variante: "neutro", rotulo: "Encerrado" },
  CANCELADO: { variante: "falta", rotulo: "Cancelado" },
};

function statusDoEvento(e: Evento): StatusEvento {
  if (e.cancelado) return "CANCELADO";
  if (e.status) return e.status;
  const agora = Date.now();
  const inicio = new Date(e.inicioEm).getTime();
  const fim = e.terminoEm ? new Date(e.terminoEm).getTime() : inicio + 2 * 3_600_000;
  return agora < inicio ? "AGENDADO" : agora <= fim ? "ABERTO" : "ENCERRADO";
}

export function DiretoriaEventosPage() {
  const [params, setParams] = useSearchParams();
  const modalAberto = params.get("novo") === "1";
  const { data: eventos = [], isLoading, isError } = useQuery({ queryKey: ["eventos", "lista"], queryFn: eventosService.listar });
  const { data: resumo } = useQuery({ queryKey: ["eventos", "resumo"], queryFn: eventosService.obterResumo });
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [busca, setBusca] = useState("");
  const [detalhes, setDetalhes] = useState<Evento | null>(null);

  const exportar = useMutation({
    mutationFn: async () => {
      const linhas = [
        "evento;data;horario;tolerancia;responsavel;status",
        ...eventos.map((e) =>
          [e.titulo, dataCompleta(e.inicioEm), intervalo(e.inicioEm, e.terminoEm), e.toleranciaMinutos != null ? `${e.toleranciaMinutos} min` : "—", e.responsavelNome ?? "", statusBadge[statusDoEvento(e)].rotulo.replace("● ", "")].join(";"),
        ),
      ];
      return new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    },
    onSuccess: (blob) => baixarArquivo(blob, "eventos.csv"),
  });

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return eventos.filter((e) => {
      if (filtro === "ABAIXO" && !(e.presencaMedia !== undefined && e.presencaMedia < META)) return false;
      if (filtro === "EM_DIA" && !(e.presencaMedia !== undefined && e.presencaMedia >= META)) return false;
      return !termo || e.titulo.toLowerCase().includes(termo);
    });
  }, [eventos, filtro, busca]);

  const media = resumo?.presencaMedia;
  const abrirModal = () => setParams({ novo: "1" });
  const fecharModal = () => setParams({});

  return (
    <div className="pb-[48px] pt-[53px]">
      <header className="pl-[clamp(20px,3.9vw,50px)]">
        <h1 className="text-[32px] font-bold leading-[29px] text-ink">Eventos</h1>
        <p className="mt-[18px] text-[18px] leading-normal text-black">
          Reuniões e presenças do <span className="text-brand">Include</span>
        </p>
      </header>

      <section
        aria-label="Indicadores"
        className="mt-[40px] grid grid-cols-1 gap-[clamp(16px,5.4vw,70px)] pl-[clamp(16px,2.1vw,27px)] pr-[clamp(16px,3.4vw,44px)] md:grid-cols-3"
      >
        <Indicador className="flex h-[98px] items-center justify-between gap-[12px] px-[22px] py-[16px]">
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-bold leading-[24px]">Próximo evento</h2>
            <p className="mt-[3px] text-[14px] font-medium leading-[17px]">{resumo?.proximoEvento?.titulo ?? "—"}</p>
          </div>
          {resumo?.proximoEvento && (
            <p className="shrink-0 whitespace-nowrap text-[20px] font-bold leading-[24px]">
              {`${rotuloDia(resumo.proximoEvento.inicioEm)}, ${hora(resumo.proximoEvento.inicioEm)}`}
            </p>
          )}
        </Indicador>
        <Indicador className="h-[98px]">
          <h2 className="absolute left-[24px] top-[25px] text-[20px] font-bold leading-normal">Eventos no mês</h2>
          <p className="absolute left-[24px] top-[50px] text-[14px] font-medium leading-normal">
            {/* O backend não tem o campo "obrigatório": com a API real, conta todos os eventos não cancelados. */}
            {env.mocks.eventos ? "Eventos obrigatórios" : "Todos os eventos"}
          </p>
          <p className="absolute right-[33px] top-[26px] text-[32px] font-bold leading-normal">{resumo?.eventosNoMes ?? "—"}</p>
        </Indicador>
        <Indicador className="h-[98px]">
          <h2 className="absolute left-[24px] top-[20px] text-[20px] font-bold leading-normal">Presença média</h2>
          <BarraMeta percentual={media ?? 0} className="absolute left-[24px] top-[49px]" />
          <p className="absolute left-[24px] top-[63px] text-[14px] font-medium leading-normal">
            {`Meta mínima de ${META}%  ·  `}
            {media === null ? "sem dados" : media !== undefined && media >= META ? "▲ acima da meta" : "▼ abaixo da meta"}
          </p>
          <p className="absolute right-[18px] top-[24px] text-[32px] font-bold leading-normal">{media != null ? `${media}%` : "—"}</p>
        </Indicador>
      </section>

      <div className="mt-[92px] flex flex-wrap items-center gap-[12px] pl-[clamp(16px,2vw,26px)] pr-[clamp(16px,3.4vw,44px)]">
        <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar evento" />
        <Chip ativo={filtro === "TODOS"} onClick={() => setFiltro("TODOS")}>Todos</Chip>
        <Chip ativo={filtro === "ABAIXO"} onClick={() => setFiltro("ABAIXO")}>Abaixo da meta</Chip>
        <Chip ativo={filtro === "EM_DIA"} onClick={() => setFiltro("EM_DIA")}>Em dia</Chip>
        <button
          type="button"
          onClick={() => exportar.mutate()}
          className="flex h-[41px] cursor-pointer items-center gap-[8px] rounded-[8px] border border-line bg-white px-[18px] text-[14px] font-semibold leading-normal text-ink hover:bg-wash"
        >
          <Download size={16} strokeWidth={2} aria-hidden="true" />
          Exportar CSV
        </button>
        <button
          type="button"
          onClick={abrirModal}
          className="ml-auto flex h-[53px] cursor-pointer items-center gap-[6px] rounded-[12px] bg-brand px-[18px] text-[20px] font-semibold leading-normal text-white transition-opacity hover:opacity-90"
        >
          <Plus size={24} strokeWidth={2.5} aria-hidden="true" />
          Novo evento
        </button>
      </div>

      <section
        aria-label="Tabela de eventos"
        className="ml-[clamp(16px,2vw,25px)] mr-[clamp(16px,3.4vw,44px)] mt-[26px] overflow-hidden rounded-[12px] border border-line bg-white"
      >
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-7 bg-[#fafafa] px-[16px] py-[10px] text-[11px] font-semibold leading-normal text-subtle">
              {["EVENTO", "DATA", "HORÁRIO", "TOLERÂNCIA", "RESPONSÁVEL", "STATUS", "AÇÃO"].map((c, i) => (
                <span key={c} className={cx(i > 0 && "text-center")}>{c}</span>
              ))}
            </div>
            {linhas.map((e) => {
              const { variante, rotulo } = statusBadge[statusDoEvento(e)];
              return (
                <div key={e.id} className="grid min-h-[56px] grid-cols-7 items-center border-b border-line px-[16px] py-[10px] text-[14px] leading-normal text-ink last:border-b-0">
                  <span>{e.titulo}</span>
                  <span className="text-center">{dataCompleta(e.inicioEm)}</span>
                  <span className="text-center">{intervalo(e.inicioEm, e.terminoEm)}</span>
                  <span className="text-center">{e.toleranciaMinutos != null ? `${e.toleranciaMinutos} min` : "—"}</span>
                  <span className="text-center">{e.responsavelNome ?? "—"}</span>
                  <span className="text-center">
                    <StatusBadge variante={variante}>{rotulo}</StatusBadge>
                  </span>
                  <span className="text-center">
                    <button
                      type="button"
                      onClick={() => setDetalhes(e)}
                      className="inline-flex h-[31px] cursor-pointer items-center rounded-[8px] border border-line bg-white px-[18px] text-[14px] font-semibold text-ink hover:bg-wash"
                    >
                      Ver detalhes
                    </button>
                  </span>
                </div>
              );
            })}
            {linhas.length === 0 && (
              <p className="px-[16px] py-[24px] text-[14px] text-muted">
                {isLoading ? "Carregando eventos..." : isError ? "Não foi possível carregar os eventos." : "Nenhum evento encontrado."}
              </p>
            )}
          </div>
        </div>
      </section>

      {modalAberto && <NovoEventoModal onFechar={fecharModal} />}
      {detalhes && <DetalhesEventoModal evento={detalhes} status={statusBadge[statusDoEvento(detalhes)]} aberto={statusDoEvento(detalhes) === "ABERTO"} onFechar={() => setDetalhes(null)} />}
    </div>
  );
}
