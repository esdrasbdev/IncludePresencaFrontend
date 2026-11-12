import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Check, Pencil, Plus } from "lucide-react";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { mensagemDeErro } from "../../../lib/apiError";
import { cx } from "../../../lib/cx";
import { iniciais } from "../../../lib/format";
import { membrosService } from "../../membros/services/membrosService";
import type { Membro } from "../../membros/types/membro";
import { Avatar, BarraFrequencia, CampoBusca, Chip } from "../components/Indicador";
import { NovoMembroModal } from "../components/NovoMembroModal";

type Filtro = "TODOS" | "ATIVOS" | "INATIVOS";
const COLUNAS = "grid-cols-[2.5fr_1fr_1.45fr_1.7fr_0.95fr_88px]";

export function DiretoriaGerenciamentoPage() {
  const queryClient = useQueryClient();
  const { data: membros = [], isLoading, isError } = useQuery({ queryKey: ["membros"], queryFn: membrosService.listar });
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [membroEmEdicao, setMembroEmEdicao] = useState<Membro>();

  const alterar = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => membrosService.alterarStatus(id, ativo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["membros"] }),
  });

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return membros.filter((m) => {
      if (filtro === "ATIVOS" && !m.ativo) return false;
      if (filtro === "INATIVOS" && m.ativo) return false;
      return !termo || m.nome.toLowerCase().includes(termo) || m.email.toLowerCase().includes(termo);
    });
  }, [membros, filtro, busca]);

  return (
    <div className="pb-[48px] pt-[53px]">
      <header className="pl-[clamp(20px,3.9vw,50px)]">
        <h1 className="text-[32px] font-bold leading-[29px] text-ink">Gerenciamento</h1>
        <p className="mt-[18px] text-[18px] leading-normal text-black">
          Gerencie o cadastro dos membros da <span className="text-brand">Include</span>
        </p>
      </header>

      <div className="mt-[55px] flex flex-wrap items-center gap-[12px] pl-[clamp(16px,6.2vw,78px)] pr-[clamp(16px,7.5vw,97px)]">
        <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por nome ou e-mail" />
        <Chip ativo={filtro === "TODOS"} onClick={() => setFiltro("TODOS")}>Todos</Chip>
        <Chip ativo={filtro === "ATIVOS"} onClick={() => setFiltro("ATIVOS")}>Ativos</Chip>
        <Chip ativo={filtro === "INATIVOS"} onClick={() => setFiltro("INATIVOS")}>Inativos</Chip>
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="ml-auto flex h-[46px] cursor-pointer items-center gap-[6px] rounded-[12px] bg-brand px-[20px] text-[20px] font-semibold leading-normal text-white transition-opacity hover:opacity-90"
        >
          <Plus size={22} strokeWidth={2.5} aria-hidden="true" />
          Novo membro
        </button>
      </div>

      <section
        aria-label="Tabela de membros"
        className="ml-[clamp(16px,6.2vw,78px)] mr-[clamp(16px,6.8vw,88px)] mt-[47px] overflow-hidden rounded-[12px] border border-line bg-white"
      >
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className={cx("grid bg-[#fafafa] px-[16px] py-[10px] text-[11px] font-semibold leading-normal text-subtle", COLUNAS)}>
              {["MEMBRO", "CARGO", "ÁREA", "ASSIDUIDADE", "STATUS", "AÇÕES"].map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            {linhas.map((m) => (
              <div key={m.id} className={cx("grid items-center border-b border-line px-[16px] py-[12px] text-[14px] leading-normal text-ink last:border-b-0", COLUNAS)}>
                <span className="flex items-center gap-[12px]">
                  <Avatar iniciais={iniciais(m.nome)} tamanho={34} />
                  <span className="min-w-0 leading-[1.2]">
                    <span className="block truncate text-[14px] font-semibold">{m.nome}</span>
                    <span className="block truncate text-[12px] text-muted">{m.email}</span>
                  </span>
                </span>
                <span>{m.cargo}</span>
                <span>{m.area || "—"}</span>
                {m.assiduidade === null ? <span className="text-subtle">—</span> : <BarraFrequencia percentual={m.assiduidade} largura={96} />}
                <span>
                  {m.pendente ? (
                    <span title="O membro ainda não ativou a conta pelo e-mail de convite">
                      <StatusBadge variante="atraso">Pendente</StatusBadge>
                    </span>
                  ) : (
                    <StatusBadge variante={m.ativo ? "presente" : "neutro"}>{m.ativo ? "Ativo" : "Inativo"}</StatusBadge>
                  )}
                </span>
                <span className="flex gap-[6px]">
                  <button
                    type="button"
                    onClick={() => setMembroEmEdicao(m)}
                    aria-label={`Editar ${m.nome}`}
                    title="Editar membro"
                    className="grid size-[32px] cursor-pointer place-items-center rounded-[8px] border border-line bg-white text-muted hover:bg-wash"
                  >
                    <Pencil size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => alterar.mutate({ id: m.id, ativo: !m.ativo })}
                    disabled={alterar.isPending}
                    aria-label={m.ativo ? `Inativar ${m.nome}` : `Reativar ${m.nome}`}
                    title={m.ativo ? "Inativar membro" : "Reativar membro"}
                    className={cx(
                      "grid size-[32px] cursor-pointer place-items-center rounded-[8px] border border-line bg-white hover:bg-wash disabled:opacity-60",
                      m.ativo ? "text-[#b91c1c]" : "text-[#15803d]",
                    )}
                  >
                    {m.ativo ? <Ban size={16} strokeWidth={2} aria-hidden="true" /> : <Check size={16} strokeWidth={2.5} aria-hidden="true" />}
                  </button>
                </span>
              </div>
            ))}
            {linhas.length === 0 && (
              <p className="px-[16px] py-[24px] text-[14px] text-muted">
                {isLoading ? "Carregando membros..." : isError ? "Não foi possível carregar os membros." : "Nenhum membro encontrado."}
              </p>
            )}
          </div>
        </div>
      </section>

      {alterar.isError && (
        <p role="alert" className="mt-[12px] pl-[clamp(16px,6.2vw,78px)] text-[13px] text-[#b91c1c]">
          {mensagemDeErro(alterar.error, "Não foi possível alterar o status do membro. Tente novamente.")}
        </p>
      )}

      {modalAberto && <NovoMembroModal onFechar={() => setModalAberto(false)} />}
      {membroEmEdicao && <NovoMembroModal membro={membroEmEdicao} onFechar={() => setMembroEmEdicao(undefined)} />}
    </div>
  );
}
