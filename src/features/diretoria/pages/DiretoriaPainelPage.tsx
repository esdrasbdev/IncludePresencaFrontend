import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { cx } from "../../../lib/cx";
import { iniciais } from "../../../lib/format";
import { useUsuarioAtual } from "../../auth/hooks/useUsuarioAtual";
import { Avatar, BarraFrequencia, BarraMeta, CampoBusca, Chip, Indicador } from "../components/Indicador";
import { baixarArquivo } from "../../../lib/download";
import { diretoriaService } from "../services/diretoriaService";

const META = 75;
type Filtro = "TODOS" | "ABAIXO" | "EM_DIA";

const COLUNAS = "grid-cols-[2.6fr_1.7fr_1.1fr_0.85fr_0.85fr_2.2fr_1.6fr]";

export function DiretoriaPainelPage() {
  const { data: usuario } = useUsuarioAtual("DIRETORIA");
  const { data: painel, isLoading, isError } = useQuery({ queryKey: ["diretoria", "painel"], queryFn: diretoriaService.obterPainel });
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [busca, setBusca] = useState("");

  const exportar = useMutation({
    mutationFn: diretoriaService.exportarCsv,
    onSuccess: (blob) => baixarArquivo(blob, "presencas.csv"),
  });

  const membros = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (painel?.membros ?? []).filter((m) => {
      if (filtro === "ABAIXO" && (m.frequencia === null || m.frequencia >= META)) return false;
      if (filtro === "EM_DIA" && (m.frequencia === null || m.frequencia < META)) return false;
      return !termo || m.nome.toLowerCase().includes(termo);
    });
  }, [painel, filtro, busca]);

  const global = painel?.frequenciaGlobal;

  return (
    <div className="pb-[48px] pt-[49px]">
      <header className="pl-[clamp(20px,2.8vw,35px)]">
        <h1 className="text-[32px] font-bold leading-[29px] text-ink">Painel da Diretoria</h1>
        <p className="mt-[14px] text-[32px] font-bold leading-[1.1] text-ink">
          Seja bem-vindo(a) <span className="text-brand">{usuario?.nome ?? ""}</span>!
        </p>
      </header>

      <section
        aria-label="Indicadores"
        className="mt-[59px] grid grid-cols-1 gap-[clamp(16px,5.8vw,75px)] pl-[clamp(16px,2.2vw,28px)] pr-[clamp(16px,2.4vw,31px)] md:grid-cols-3"
      >
        <Indicador className="h-[98px]">
          <h2 className="absolute left-[13px] top-[20px] text-[16px] font-medium leading-normal">Frequência global</h2>
          <BarraMeta percentual={global ?? 0} className="absolute left-[13px] top-[51px]" />
          <p className="absolute left-[13px] top-[66px] text-[14px] font-medium leading-normal">
            {`Meta mínima de ${META}%  ·  `}
            {global === null ? "sem dados" : global !== undefined && global >= META ? "▲ acima da meta" : "▼ abaixo da meta"}
          </p>
          <p className="absolute right-[15px] top-[24px] text-[32px] font-bold leading-normal">{global != null ? `${global}%` : "—"}</p>
        </Indicador>
        <Indicador className="h-[98px]">
          <h2 className="absolute left-[18px] top-[31px] text-[16px] font-medium leading-normal">Membros ativos</h2>
          <p className="absolute right-[42px] top-[26px] text-[32px] font-bold leading-normal">{painel?.membrosAtivos ?? "—"}</p>
        </Indicador>
        <Indicador className="h-[98px]">
          <h2 className="absolute left-[21px] top-[24px] text-[16px] font-medium leading-normal">Abaixo da meta</h2>
          <p className="absolute left-[21px] top-[50px] text-[14px] font-bold leading-normal">Requer atenção da Diretoria</p>
          <p className="absolute right-[20px] top-[26px] text-[32px] font-bold leading-normal">{painel?.abaixoDaMeta ?? "—"}</p>
        </Indicador>
      </section>

      <div className="mt-[88px] flex flex-wrap items-center gap-[12px] pl-[clamp(16px,2.2vw,28px)] pr-[clamp(16px,2.4vw,31px)]">
        <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar membro" />
        <Chip ativo={filtro === "TODOS"} onClick={() => setFiltro("TODOS")}>Todos</Chip>
        <Chip ativo={filtro === "ABAIXO"} onClick={() => setFiltro("ABAIXO")}>Abaixo da meta</Chip>
        <Chip ativo={filtro === "EM_DIA"} onClick={() => setFiltro("EM_DIA")}>Em dia</Chip>
        <button
          type="button"
          onClick={() => exportar.mutate()}
          disabled={exportar.isPending}
          className="flex h-[41px] cursor-pointer items-center gap-[8px] rounded-[8px] border border-line bg-white px-[18px] text-[14px] font-semibold leading-normal text-ink hover:bg-wash disabled:opacity-60"
        >
          <Download size={16} strokeWidth={2} aria-hidden="true" />
          {exportar.isPending ? "Exportando..." : "Exportar CSV"}
        </button>
        {exportar.isError && (
          <span role="alert" className="text-[13px] text-danger">
            Não foi possível exportar. Tente novamente.
          </span>
        )}
      </div>

      <section
        aria-label="Tabela de presenças"
        className="ml-[clamp(16px,2.2vw,27px)] mr-[clamp(16px,2.4vw,28px)] mt-[22px] overflow-hidden rounded-[12px] border border-line bg-white"
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className={cx("grid bg-[#fafafa] px-[16px] py-[10px] text-[11px] font-semibold leading-normal text-subtle", COLUNAS)}>
              {["MEMBRO", "ÁREA", "PRESENÇAS", "ATRASOS", "FALTAS", "FREQUÊNCIA", "STATUS"].map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            {membros.map((m) => (
              <div key={m.id} className={cx("grid items-center border-b border-line px-[16px] py-[12px] text-[14px] leading-normal text-ink last:border-b-0", COLUNAS)}>
                <span className="flex items-center gap-[12px]">
                  <Avatar iniciais={iniciais(m.nome)} />
                  <span className="font-semibold">{m.nome}</span>
                </span>
                <span>{m.area || "—"}</span>
                <span>{`${m.presencas} / ${m.totalEventos}`}</span>
                <span>{m.atrasos}</span>
                <span>{m.faltas}</span>
                {m.frequencia === null ? <span className="text-subtle">—</span> : <BarraFrequencia percentual={m.frequencia} />}
                <span>
                  {m.frequencia === null ? <StatusBadge variante="neutro">Sem dados</StatusBadge> : m.frequencia >= META ? <StatusBadge variante="presente">Em dia</StatusBadge> : <StatusBadge variante="falta">Abaixo da meta</StatusBadge>}
                </span>
              </div>
            ))}
            {membros.length === 0 && (
              <p className="px-[16px] py-[24px] text-[14px] text-muted">
                {isLoading ? "Carregando painel..." : isError ? "Não foi possível carregar o painel." : "Nenhum membro encontrado."}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
