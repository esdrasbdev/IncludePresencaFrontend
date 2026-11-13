import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, CircleAlert, FileText } from "lucide-react";
import { env } from "../../../config/env";
import { SeletorPeriodo } from "../../../components/ui/SeletorPeriodo";
import { StatusBadge, type VarianteBadge } from "../../../components/ui/StatusBadge";
import { mensagemDeErro } from "../../../lib/apiError";
import { cx } from "../../../lib/cx";
import { dataCompleta, diaMesAbreviado, hora } from "../../../lib/format";
import { useUsuarioAtual } from "../../auth/hooks/useUsuarioAtual";
import { useMinhaFrequencia } from "../../dashboard/hooks/useMinhaFrequencia";
import { justificativasService } from "../services/justificativasService";
import { MOTIVOS, type MotivoFalta, type StatusJustificativa } from "../types/justificativa";

const MINIMO_DESCRICAO = 1;
const TAMANHO_MAXIMO_ANEXO = 5 * 1024 * 1024;
const META_MINIMA = 75;

const statusDaJustificativa: Record<StatusJustificativa, { variante: VarianteBadge; rotulo: string }> = {
  EM_ANALISE: { variante: "aguardando", rotulo: "Em análise" },
  APROVADA: { variante: "presente", rotulo: "Aprovada" },
  REJEITADA: { variante: "falta", rotulo: "Rejeitada" },
};

function Indicador({ titulo, legenda, valor, children }: { titulo: string; legenda: string; valor: string; children?: ReactNode }) {
  return (
    <article className="relative h-[92px] overflow-hidden rounded-[12px] border border-line bg-brand text-white">
      <h2 className="absolute left-[10px] top-[24px] text-[20px] font-bold leading-normal">{titulo}</h2>
      <p className={cx("absolute left-[10px] text-[14px] font-medium leading-normal", children ? "top-[62px]" : "top-[50px]")}>{legenda}</p>
      {children}
      <p className="absolute right-[24px] top-[26px] text-[32px] font-bold leading-normal">{valor}</p>
    </article>
  );
}

export function JustificarFaltaPage() {
  const queryClient = useQueryClient();
  const { data: usuario } = useUsuarioAtual();
  const { data: frequencia } = useMinhaFrequencia();
  const [dias, setDias] = useState<number>(60);

  const { data: faltas = [], isLoading: carregandoFaltas } = useQuery({
    queryKey: ["me", "faltas-sem-justificativa"],
    queryFn: justificativasService.listarFaltasSemJustificativa,
  });
  const { data: minhas = [] } = useQuery({
    queryKey: ["me", "justificativas", dias],
    queryFn: justificativasService.listarMinhas,
  });

  const [faltaId, setFaltaId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<MotivoFalta | null>(null);
  const [descricao, setDescricao] = useState("");
  const [anexo, setAnexo] = useState<File | null>(null);
  const [erroAnexo, setErroAnexo] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const inputArquivo = useRef<HTMLInputElement>(null);

  // Seleciona a primeira falta por padrão (e ajusta se a selecionada deixar de existir).
  const falta = useMemo(() => faltas.find((f) => f.id === faltaId) ?? faltas[0] ?? null, [faltas, faltaId]);

  const enviar = useMutation({
    mutationFn: () => justificativasService.enviar({ faltaId: falta!.id, motivo: motivo!, descricao: descricao.trim(), anexo }),
    onSuccess: () => {
      setSucesso(true);
      setMotivo(null);
      setDescricao("");
      setAnexo(null);
      setFaltaId(null);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  useEffect(() => {
    if (!sucesso) return;
    const t = setTimeout(() => setSucesso(false), 6000);
    return () => clearTimeout(t);
  }, [sucesso]);

  const podeEnviar = Boolean(falta && motivo && descricao.trim().length >= MINIMO_DESCRICAO) && !enviar.isPending;
  const emAnalise = minhas.filter((j) => j.status === "EM_ANALISE").length;
  const percentual = frequencia?.percentual;

  function escolherArquivo(arquivo: File | undefined) {
    setErroAnexo(null);
    if (!arquivo) return;
    if (!/\.(pdf|png|jpe?g)$/i.test(arquivo.name)) {
      setErroAnexo("Use um arquivo PDF, PNG ou JPG.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_ANEXO) {
      setErroAnexo("O arquivo deve ter no máximo 5 MB.");
      return;
    }
    setAnexo(arquivo);
  }

  return (
    <div className="min-h-screen bg-white pb-[48px] pl-[clamp(16px,2vw,24px)] pr-[clamp(16px,2.8vw,36px)] pt-[58px]">
      <header className="flex min-h-[108px] flex-wrap items-center justify-between gap-4 pl-[4px]">
        <div className="flex flex-col gap-[4px] leading-normal">
          <h1 className="text-[36px] font-bold text-ink">Justificar falta</h1>
          <p className="text-[18px] font-bold text-muted">
            Olá, <span className="text-brand-action">{usuario?.nome ?? ""}</span>! Envie sua justificativa para a Diretoria analisar.
          </p>
        </div>
        <SeletorPeriodo dias={dias} onChange={setDias} />
      </header>
      {env.mocks.justificativas && (
        <p role="status" className="mt-[8px] rounded-[10px] bg-[#f6f5d8] px-[16px] py-[10px] text-[13px] text-[#745d55]">
          Modo de demonstração: justificativas não são persistidas no servidor.
        </p>
      )}

      <section aria-label="Resumo" className="mt-[14px] grid grid-cols-1 gap-[clamp(16px,4.2vw,62px)] md:grid-cols-3">
        <Indicador titulo="Sem justificativa" legenda="Faltas aguardando seu envio" valor={String(faltas.length)} />
        <Indicador titulo="Em análise" legenda="Aguardando decisão da diretoria" valor={String(emAnalise)} />
        <Indicador
          titulo="Minha frequência"
          legenda={`Meta mínima de ${META_MINIMA}%  ·  ${percentual === null ? "sem dados ainda" : percentual !== undefined && percentual >= META_MINIMA ? "▲ acima da meta" : "▼ abaixo da meta"}`}
          valor={percentual != null ? `${percentual}%` : "—"}
        >
          <div className="absolute left-[10px] top-[51px] h-[8px] w-[192px] overflow-hidden rounded-[4px] bg-[rgba(192,192,207,0.65)]">
            <div className="h-full rounded-[4px] bg-white" style={{ width: `${Math.min(percentual ?? 0, 100)}%` }} />
            <div className="absolute -top-[3px] h-[14px] w-[2px] bg-ink" style={{ left: `${META_MINIMA}%` }} />
          </div>
        </Indicador>
      </section>

      <div className="mt-[15px] flex min-h-[41px] items-center gap-[10px] rounded-[15px] bg-[#f6f5d8] px-[clamp(16px,3.4vw,52px)] py-[10px]">
        <CircleAlert size={22} strokeWidth={2.25} className="shrink-0 text-[#745d55]" aria-hidden="true" />
        <p className="text-[14px] font-medium leading-normal text-[#745d55]">
          Se a diretoria aprovar a justificativa, a falta é abonada e sua falta é recalculada. Se for rejeitada, a falta continua valendo.
        </p>
      </div>

      <div className="mt-[18px] flex flex-wrap items-start gap-x-[45px] gap-y-8">
        {/* 1. Escolha a falta */}
        <section aria-labelledby="titulo-faltas" className="w-full max-w-[393px]">
          <h2 id="titulo-faltas" className="text-[15px] font-bold leading-normal text-black">
            1. Escolha a falta
          </h2>
          <ul className="lista-rolavel mt-[6px] max-h-[350px] overflow-y-auto rounded-[12px] border border-line bg-white">
            {faltas.map((f, i) => {
              const selecionada = f.id === falta?.id;
              return (
                <li key={f.id} className={cx(i < faltas.length - 1 && "border-b border-[#ffeeee]")}>
                  <button
                    type="button"
                    aria-pressed={selecionada}
                    onClick={() => setFaltaId(f.id)}
                    className={cx(
                      "flex h-[70px] w-full cursor-pointer items-center gap-[10px] px-[16px] text-left",
                      selecionada ? "bg-[#ffeeee]" : "hover:bg-wash",
                    )}
                  >
                    <span className="min-w-0 flex-1 text-[16px] leading-normal text-ink">{f.titulo}</span>
                    <span className="w-[100px] shrink-0 text-[14px] font-bold leading-normal text-ink">{dataCompleta(f.inicioEm)}</span>
                    <StatusBadge variante="falta">Falta</StatusBadge>
                  </button>
                </li>
              );
            })}
            {faltas.length === 0 && (
              <li className="px-[16px] py-[22px] text-[14px] text-muted">
                {carregandoFaltas ? "Carregando faltas..." : "Você não tem faltas aguardando justificativa."}
              </li>
            )}
          </ul>

          <h2 className="ml-[7px] mt-[15px] text-[15px] font-bold leading-normal text-black">Minhas justificativas</h2>
          <div className="ml-[7px] mt-[14px] w-full max-w-[430px] overflow-hidden rounded-[12px] border border-line bg-white text-[14px] leading-normal text-ink">
            <div className="grid grid-cols-[minmax(90px,1fr)_92px_76px_88px] items-center border-b border-line px-[16px] py-[10px] text-[13px] font-bold text-[#595959]">
              <span>Evento</span>
              <span>Data da falta</span>
              <span>Enviada</span>
              <span>Status</span>
            </div>
            {minhas.map((j) => {
              const { variante, rotulo } = statusDaJustificativa[j.status];
              return (
                <div key={j.id} className="border-b border-line px-[16px] py-[14px] last:border-b-0">
                  <div className="grid grid-cols-[minmax(90px,1fr)_92px_76px_88px] items-center">
                    <span className="truncate pr-2">{j.titulo}</span>
                    <span>{diaMesAbreviado(j.dataFalta)}</span>
                    <span>{diaMesAbreviado(j.enviadaEm)}</span>
                    <span>
                      <StatusBadge variante={variante}>{rotulo}</StatusBadge>
                    </span>
                  </div>
                  {j.anexoNome && (
                    <p className="mt-[8px] flex items-center gap-[5px] truncate text-[12px] text-muted" title={j.anexoNome}>
                      <FileText size={14} aria-hidden="true" />
                      Anexo: {j.anexoNome}
                    </p>
                  )}
                </div>
              );
            })}
            {minhas.length === 0 && <p className="px-[16px] py-[22px] text-muted">Você ainda não enviou justificativas.</p>}
          </div>
        </section>

        {/* 2. Conte o que aconteceu */}
        <section aria-labelledby="titulo-form" className="w-full max-w-[761px] flex-1">
          <h2 id="titulo-form" className="text-[15px] font-bold leading-normal text-black">
            2. Conte o que aconteceu
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (podeEnviar) enviar.mutate();
            }}
            className="mt-[6px] flex min-h-[493px] flex-col rounded-[15px] bg-[#f4f4f4] px-[clamp(16px,2.7vw,34px)] pb-[14px] pt-[23px]"
          >
            <div className="grid min-h-[54px] grid-cols-1 gap-2 rounded-[8px] border border-[#a1a1aa] bg-white px-[18px] py-[8px] sm:grid-cols-[minmax(0,464px)_1fr] sm:py-0">
              <div className="flex flex-col justify-center leading-normal">
                <span className="text-[13px] font-bold text-[#595959]">EVENTO</span>
                <span className="text-[15px] font-bold text-black">{falta?.titulo ?? "—"}</span>
              </div>
              <div className="flex flex-col justify-center leading-normal">
                <span className="text-[13px] font-bold text-[#595959]">DATA DA FALTA</span>
                <span className="text-[15px] font-bold text-black">
                  {falta ? `${diaMesAbreviado(falta.inicioEm)} · ${hora(falta.inicioEm)}` : "—"}
                </span>
              </div>
            </div>

            <p className="mt-[14px] text-[15px] font-bold leading-normal text-black">
              Motivo da falta <span className="text-[#e23737]">*</span>
            </p>
            <div role="radiogroup" aria-label="Motivo da falta" className="mt-[10px] flex flex-wrap gap-[15px]">
              {MOTIVOS.map((m) => (
                <button
                  key={m.valor}
                  type="button"
                  role="radio"
                  aria-checked={motivo === m.valor}
                  onClick={() => setMotivo(m.valor)}
                  className={cx(
                    "h-[40px] cursor-pointer rounded-full border px-[26px] text-[15px] leading-normal text-black transition-colors",
                    motivo === m.valor ? "border-brand-action bg-brand-soft" : "border-[#a1a1aa] bg-white hover:bg-wash",
                  )}
                >
                  {m.rotulo}
                </button>
              ))}
            </div>

            <label htmlFor="descricao" className="mt-[14px] block text-[15px] font-bold leading-normal text-black">
              Descreva a situação <span className="text-[#e23737]">*</span>
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Explique com clareza o que aconteceu para a Diretoria poder avaliar."
              className="mt-[10px] h-[93px] w-full resize-none rounded-[8px] border border-[#a1a1aa] bg-white px-[13px] py-[11px] text-[14px] leading-normal text-black outline-none placeholder:text-[13px] placeholder:text-[#535353] focus:border-brand"
            />
            <div className="mt-[3px] flex justify-between text-[12px] leading-normal">
              <span className="text-[#535353]">A descrição é obrigatória.</span>
              <span className="text-black">
                {descricao.trim().length} caracteres
              </span>
            </div>

            <p className="mt-[5px] text-[15px] font-bold leading-normal text-black">
              Anexo <span className="font-normal text-[#535353]">(opcional)</span>
            </p>
            <label className="mt-[8px] flex h-[93px] cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-black bg-[#f3f3f3] text-center">
              <ArrowUp size={26} strokeWidth={1.5} aria-hidden="true" />
              <span className="mt-[2px] text-[13px] font-bold leading-normal text-black">
                {anexo ? anexo.name : "Clique para anexar um comprovante"}
              </span>
              <span className="text-[12px] leading-normal text-[#595959]">PDF, PNG ou JPG - até 5 MB</span>
              <input
                ref={inputArquivo}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                className="sr-only"
                onChange={(e) => {
                  escolherArquivo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {anexo && (
              <div className="mt-[6px] flex items-center justify-between gap-3 rounded-[8px] border border-line bg-white px-[10px] py-[7px] text-[12px]">
                <p className="flex min-w-0 items-center gap-[5px] truncate text-ink" title={anexo.name}>
                  <FileText size={14} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{anexo.name}</span>
                </p>
                <button type="button" onClick={() => setAnexo(null)} className="shrink-0 cursor-pointer text-muted underline">
                  Remover
                </button>
              </div>
            )}
            {erroAnexo && (
              <p role="alert" className="mt-[4px] text-[12px] text-danger">
                {erroAnexo}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between gap-4 pt-[14px]">
              <span className="text-[13px] leading-normal text-[#434343]">
                Prazo: {falta ? diaMesAbreviado(falta.prazoEm) : "—"}
              </span>
              <button
                type="submit"
                disabled={!podeEnviar}
                className={cx(
                  "h-[30px] w-[162px] rounded-[8px] text-[13px] font-normal leading-normal transition-colors",
                  podeEnviar ? "cursor-pointer bg-brand-action text-white hover:opacity-90" : "cursor-not-allowed bg-[#d9d9d9] text-[#434343]",
                )}
              >
                {enviar.isPending ? "Enviando..." : "Enviar justificativa"}
              </button>
            </div>
            {sucesso && (
              <p role="status" className="mt-[8px] text-right text-[13px] font-medium text-success">
                Justificativa enviada! A Diretoria vai analisar.
              </p>
            )}
            {enviar.isError && (
              <p role="alert" className="mt-[8px] text-right text-[13px] text-danger">
                {mensagemDeErro(enviar.error, "Não foi possível enviar a justificativa. Tente novamente.")}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
