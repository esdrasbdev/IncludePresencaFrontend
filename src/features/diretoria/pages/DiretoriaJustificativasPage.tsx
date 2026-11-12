import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Plus } from "lucide-react";
import { StatusBadge, type VarianteBadge } from "../../../components/ui/StatusBadge";
import { mensagemDeErro } from "../../../lib/apiError";
import { cx } from "../../../lib/cx";
import { dataCompleta, dataCurta, dataHoraCurta, haTempo, iniciais, intervalo } from "../../../lib/format";
import { justificativasService } from "../../justificativas/services/justificativasService";
import type { DecisaoJustificativa, JustificativaFila, StatusJustificativa } from "../../justificativas/types/justificativa";
import { Avatar, Chip, Indicador } from "../components/Indicador";

type Filtro = "TODOS" | StatusJustificativa;

const statusBadge: Record<StatusJustificativa, { variante: VarianteBadge; rotulo: string }> = {
  EM_ANALISE: { variante: "aguardando", rotulo: "Em análise" },
  APROVADA: { variante: "presente", rotulo: "Aprovada" },
  REJEITADA: { variante: "falta", rotulo: "Rejeitada" },
};

const tituloLista: Record<Filtro, string> = {
  TODOS: "Todas as justificativas",
  EM_ANALISE: "Aguardando avaliação",
  APROVADA: "Justificativas aprovadas",
  REJEITADA: "Justificativas rejeitadas",
};

function Detalhe({ item, onFechar }: { item: JustificativaFila; onFechar: () => void }) {
  const queryClient = useQueryClient();
  const decidir = useMutation({
    mutationFn: (decisao: DecisaoJustificativa) => justificativasService.decidir(item.id, decisao),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["justificativas"] });
      onFechar();
    },
  });

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onFechar]);

  const { variante, rotulo } = statusBadge[item.status];
  const boa = item.membroFrequencia >= 75;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Fechar detalhes" onClick={onFechar} className="absolute inset-0 cursor-default bg-black/40" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Justificativa de ${item.membroNome}`}
        className="relative flex h-full w-full max-w-[802px] animate-slide-in-right flex-col overflow-y-auto bg-white
        px-[25px] pb-[24px] pt-[22px] font-inter shadow-[0_0_30px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-center gap-[16px]">
          <Avatar iniciais={iniciais(item.membroNome)} tamanho={52} />
          <div className="min-w-0 flex-1 leading-normal">
            <h2 className="text-[18px] font-bold text-ink">{item.membroNome}</h2>
            <p className="text-[13px] text-muted">
              {item.membroCargo} · {item.membroArea}
            </p>
          </div>
          <StatusBadge variante={variante} tamanho="md">{rotulo}</StatusBadge>
        </div>

        <div className="mt-[22px] flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-wash px-[14px] py-[14px]">
          <div className="leading-normal">
            <p className="text-[15px] font-semibold text-ink">{item.titulo}</p>
            <p className="whitespace-pre text-[13px] text-muted">
              {`${dataCompleta(item.eventoInicioEm)}  ·  ${intervalo(item.eventoInicioEm, item.eventoTerminoEm)}`}
            </p>
          </div>
          <div className="flex gap-[8px]">
            {item.eventoObrigatorio && <StatusBadge variante="obrigatorio" tamanho="md">Obrigatório</StatusBadge>}
            <StatusBadge variante="falta" tamanho="md">Falta</StatusBadge>
          </div>
        </div>

        <p className="mt-[34px] text-[13px] font-semibold uppercase leading-normal text-subtle">Motivo</p>
        <p className="text-[18px] font-semibold leading-normal text-ink">{item.motivo}</p>

        <p className="mt-[24px] text-[13px] font-semibold uppercase leading-normal text-subtle">Descrição</p>
        <p className="text-[18px] leading-[24px] text-muted">{item.descricao}</p>
        {item.anexoNome && <p className="mt-[8px] text-[13px] text-muted">Anexo: {item.anexoNome}</p>}

        <div
          className={cx(
            "mt-[24px] flex items-center gap-[12px] rounded-[10px] px-[14px] py-[12px]",
            item.dentroDoPrazo ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fef3c7] text-[#a16207]",
          )}
        >
          <Clock size={26} strokeWidth={2} className="shrink-0" aria-hidden="true" />
          <p className="text-[17px] leading-[22px]">
            Enviada em {dataHoraCurta(item.enviadaEm)} — {item.dentroDoPrazo ? "dentro" : "fora"} do prazo de 48 horas após o término do evento.
          </p>
        </div>

        <section aria-label="Assiduidade do membro" className="mt-[48px] rounded-[10px] bg-[#f4f4f5] px-[14px] py-[12px]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[20px] font-semibold leading-normal text-ink">Assiduidade do Membro</h3>
              <div className="mt-[4px] flex items-center gap-[14px]">
                <p className={cx("text-[32px] font-bold leading-normal", boa ? "text-[#4cd424]" : "text-[#b91c1c]")}>{item.membroFrequencia}%</p>
                <div className="leading-normal">
                  <p className="text-[20px] font-semibold text-ink">{item.membroNome}</p>
                  <p className="text-[12px] text-muted">Frequência geral nas atividades</p>
                </div>
              </div>
            </div>
            <div className="flex gap-[28px] text-center leading-normal">
              <div>
                <p className="text-[16px] font-semibold text-ink">Faltas justificadas</p>
                <p className="mt-[8px] text-[20px] font-bold text-ink">{item.faltasJustificadas}</p>
              </div>
              <div>
                <p className="text-[16px] font-semibold text-ink">Faltas pendentes</p>
                <p className="mt-[8px] text-[20px] font-bold text-ink">{item.faltasPendentes}</p>
              </div>
            </div>
            <StatusBadge variante={boa ? "presente" : "falta"}>{boa ? "Boa frequência" : "Frequência baixa"}</StatusBadge>
          </div>
        </section>

        <div className="mt-auto flex flex-wrap items-center justify-end gap-[12px] pt-[32px]">
          {decidir.isError && (
            <p role="alert" className="mr-auto text-[13px] text-danger">
              {mensagemDeErro(decidir.error, "Não foi possível registrar a decisão.")}
            </p>
          )}
          {item.status === "EM_ANALISE" ? (
            <>
              <button
                type="button"
                disabled={decidir.isPending}
                onClick={() => decidir.mutate("REJEITAR")}
                className="h-[39px] cursor-pointer rounded-[8px] bg-[#fee2e2] px-[18px] text-[14px] font-semibold text-[#b91c1c] hover:opacity-90 disabled:opacity-60"
              >
                Rejeitar
              </button>
              <button
                type="button"
                disabled={decidir.isPending}
                onClick={() => decidir.mutate("APROVAR")}
                className="h-[39px] cursor-pointer rounded-[8px] bg-brand-action px-[18px] text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                Aprovar e abonar falta
              </button>
            </>
          ) : (
            <p className="text-[13px] text-muted">Esta justificativa já foi avaliada.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

export function DiretoriaJustificativasPage() {
  const { data: fila = [], isLoading, isError } = useQuery({ queryKey: ["justificativas", "fila"], queryFn: justificativasService.listarFila });
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null);

  const contagem = (s: StatusJustificativa) => fila.filter((j) => j.status === s).length;
  const lista = useMemo(() => fila.filter((j) => filtro === "TODOS" || j.status === filtro), [fila, filtro]);
  const aberta = fila.find((j) => j.id === selecionadaId) ?? null;

  return (
    <div className="pb-[48px] pt-[53px]">
      <div className="flex flex-wrap items-start justify-between gap-4 pl-[clamp(20px,3.9vw,50px)] pr-[clamp(16px,5vw,64px)]">
        <header>
          <h1 className="text-[32px] font-bold leading-[29px] text-ink">Justificativas</h1>
          <p className="mt-[18px] text-[18px] leading-normal text-black">
            Análise das justificativas de faltas dos <span className="text-brand">membros</span>
          </p>
        </header>
        <Link
          to="/diretoria/eventos?novo=1"
          className="mt-[26px] flex h-[50px] items-center gap-[6px] rounded-[12px] bg-brand px-[18px] text-[20px] font-semibold leading-normal text-white transition-opacity hover:opacity-90"
        >
          <Plus size={22} strokeWidth={2.5} aria-hidden="true" />
          Novo evento
        </Link>
      </div>

      <section
        aria-label="Resumo"
        className="mt-[24px] grid grid-cols-1 gap-[clamp(16px,3.1vw,40px)] pl-[clamp(16px,3.2vw,41px)] pr-[clamp(16px,2.8vw,36px)] md:grid-cols-3"
      >
        {[
          { titulo: "Em análise", legenda: "Aguardando decisão", valor: contagem("EM_ANALISE") },
          { titulo: "Aprovadas", legenda: "Faltas abonadas", valor: contagem("APROVADA") },
          { titulo: "Rejeitadas", legenda: "Faltas mantidas", valor: contagem("REJEITADA") },
        ].map((k) => (
          <Indicador key={k.titulo} className="h-[92px]">
            <h2 className="absolute left-[10px] top-[24px] text-[20px] font-bold leading-normal">{k.titulo}</h2>
            <p className="absolute left-[10px] top-[50px] text-[14px] font-medium leading-normal">{k.legenda}</p>
            <p className="absolute right-[46px] top-[26px] text-[32px] font-bold leading-normal">{k.valor}</p>
          </Indicador>
        ))}
      </section>

      <div className="mt-[24px] flex flex-wrap items-center gap-[14px] pl-[clamp(16px,2.9vw,37px)]">
        <Chip ativo={filtro === "TODOS"} onClick={() => setFiltro("TODOS")}>Todos</Chip>
        <Chip ativo={filtro === "EM_ANALISE"} onClick={() => setFiltro("EM_ANALISE")}>Em análise</Chip>
        <Chip ativo={filtro === "APROVADA"} onClick={() => setFiltro("APROVADA")}>Aprovadas</Chip>
        <Chip ativo={filtro === "REJEITADA"} onClick={() => setFiltro("REJEITADA")}>Rejeitadas</Chip>
      </div>

      <section
        aria-label={tituloLista[filtro]}
        className="ml-[clamp(16px,4vw,52px)] mt-[56px] min-h-[466px] w-[calc(100%-clamp(32px,6vw,68px))] max-w-[440px] overflow-hidden rounded-[12px] border border-line bg-white"
      >
        <h2 className="px-[20px] pb-[16px] pt-[16px] text-[16px] font-semibold leading-normal text-ink">{tituloLista[filtro]}</h2>
        <ul>
          {lista.map((j) => {
            const selecionada = j.id === selecionadaId;
            const { variante, rotulo } = statusBadge[j.status];
            return (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => setSelecionadaId(j.id)}
                  aria-haspopup="dialog"
                  className={cx(
                    "flex h-[69px] w-full cursor-pointer items-center gap-[12px] border-b border-line pl-[20px] pr-[24px] text-left",
                    selecionada ? "border-l-[3px] border-l-brand bg-brand-soft pl-[17px]" : "hover:bg-wash",
                  )}
                >
                  <Avatar iniciais={iniciais(j.membroNome)} tamanho={40} />
                  <span className="min-w-0 flex-1 leading-[1.25]">
                    <span className="block truncate text-[14px] font-semibold text-ink">{j.membroNome}</span>
                    <span className="block truncate text-[12px] text-muted">
                      {j.titulo} · {dataCurta(j.eventoInicioEm)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-[4px]">
                    <StatusBadge variante={variante}>{rotulo}</StatusBadge>
                    <span className="text-[11px] leading-normal text-subtle">{haTempo(j.enviadaEm)}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {lista.length === 0 && (
            <li className="px-[20px] py-[24px] text-[14px] text-muted">
              {isLoading ? "Carregando justificativas..." : isError ? "Não foi possível carregar as justificativas." : "Nenhuma justificativa nesta categoria."}
            </li>
          )}
        </ul>
      </section>

      {aberta && <Detalhe item={aberta} onFechar={() => setSelecionadaId(null)} />}
    </div>
  );
}
