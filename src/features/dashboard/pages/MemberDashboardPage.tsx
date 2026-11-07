import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { StatusBadge, BadgeDoStatus } from "../../../components/ui/StatusBadge";
import { useUsuarioAtual } from "../../auth/hooks/useUsuarioAtual";
import { useEventoAberto } from "../../presencas/hooks/useEventoAberto";
import { useMeuHistorico } from "../../presencas/hooks/useMeuHistorico";
import type { RegistroHistorico } from "../../presencas/types/presenca";
import { useMinhaFrequencia } from "../hooks/useMinhaFrequencia";
import { dataCurta, hora, intervalo, rotuloDia, somarMinutos } from "../../../lib/format";

const META_MINIMA = 75;

export function MemberDashboardPage() {
  const { data: usuario } = useUsuarioAtual();
  const { data: frequencia } = useMinhaFrequencia();
  const { data: evento } = useEventoAberto();
  const { data: historico } = useMeuHistorico();

  const percentual = frequencia?.percentual;
  const faltas = frequencia ? frequencia.faltasJustificadas + frequencia.faltasNaoJustificadas : undefined;

  // Se há evento aberto sem registro do membro, ele aparece primeiro como "Aguardando".
  const registrado = (historico ?? []).some(
    (r) => r.eventoId === evento?.id && (r.status === "PRESENTE" || r.status === "ATRASO"),
  );
  const ultimas: Array<{ chave: string; data: string; titulo: string; item: RegistroHistorico | null }> = [];
  if (evento && !registrado) {
    ultimas.push({ chave: "aberto", data: dataCurta(evento.inicioEm), titulo: evento.titulo, item: null });
  }
  for (const r of historico ?? []) {
    ultimas.push({ chave: String(r.id), data: dataCurta(r.inicioEm), titulo: r.titulo, item: r });
  }

  return (
    <div className="pb-[46px] pt-[52px]">
      <header className="px-[clamp(20px,4.2vw,53px)]">
        <h1 className="text-[32px] font-bold leading-[29px]">Início</h1>
        <p className="mt-[14px] text-[32px] font-bold leading-[1.1]">
          Seja bem-vindo(a) <span className="text-brand">{usuario?.nome ?? ""}</span>!
        </p>
      </header>

      <section
        aria-label="Indicadores"
        className="mt-[50px] grid grid-cols-1 gap-[38px] pl-[clamp(20px,5.2vw,65px)] pr-[clamp(20px,3.5vw,44px)] md:grid-cols-3 md:gap-[clamp(16px,3vw,38px)]"
      >
        <article className="flex min-h-[156px] flex-col gap-[6px] rounded-[12px] border border-line bg-brand p-[20px] text-white">
          <h2 className="text-[20px] font-medium leading-normal">Frequência</h2>
          <p className="text-[32px] font-bold leading-normal">{percentual !== undefined ? `${percentual}%` : "—"}</p>
          <div
            role="progressbar"
            aria-label="Frequência"
            aria-valuenow={percentual ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            className="relative h-[8px] w-full max-w-[292px] rounded-[4px] bg-[rgba(192,192,207,0.65)]"
          >
            <div className="h-full rounded-[4px] bg-white" style={{ width: `${Math.min(percentual ?? 0, 100)}%` }} />
            <div
              aria-hidden="true"
              className="absolute -top-[3px] h-[14px] w-[2px] bg-ink"
              style={{ left: `${META_MINIMA}%` }}
            />
          </div>
          <p className="whitespace-pre text-[14px] font-medium leading-normal">
            {`Meta mínima de ${META_MINIMA}%  ·  `}
            {percentual !== undefined && percentual >= META_MINIMA ? "▲ acima da meta" : "▼ abaixo da meta"}
          </p>
        </article>

        <article className="flex min-h-[156px] flex-col gap-[6px] rounded-[12px] border border-line bg-brand p-[20px] text-white">
          <h2 className="text-[20px] font-medium leading-normal">Presença</h2>
          <p className="text-[40px] font-bold leading-normal">
            {frequencia ? `${frequencia.presencas}/${frequencia.totalEventos}` : "—"}
          </p>
          <p className="text-[14px] font-medium leading-normal">Eventos obrigatórios</p>
        </article>

        <article className="flex min-h-[156px] flex-col gap-[6px] rounded-[12px] border border-line bg-brand p-[20px] text-white">
          <h2 className="text-[20px] font-medium leading-normal">Faltas</h2>
          <p className="text-[40px] font-bold leading-normal">{faltas ?? "—"}</p>
          {frequencia && (
            <p className="text-[14px] font-normal leading-normal">
              {frequencia.faltasJustificadas} justificada · {frequencia.faltasNaoJustificadas} sem justificativa
            </p>
          )}
        </article>
      </section>

      <section aria-label="Evento aberto" className="mt-[54px] pl-[clamp(20px,5.2vw,65px)] pr-[clamp(20px,3.5vw,44px)]">
        {evento ? (
          <div className="flex flex-col gap-5 rounded-[12px] border border-brand-line bg-brand-soft p-[20px] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-[6px]">
              <div className="flex gap-[8px]">
                <StatusBadge variante="presente" tamanho="md">
                  ● Aberto agora
                </StatusBadge>
                <StatusBadge variante="obrigatorio" tamanho="md">
                  Obrigatório
                </StatusBadge>
              </div>
              <h2 className="text-[26px] font-bold leading-normal text-ink">{evento.titulo}</h2>
              <p className="whitespace-pre-wrap text-[14px] leading-normal text-brand-ink">
                {`${rotuloDia(evento.inicioEm)}, ${intervalo(evento.inicioEm, evento.terminoEm)}  ·  registre até ${hora(
                  somarMinutos(evento.inicioEm, evento.toleranciaMinutos),
                )} para constar como Presente`}
              </p>
            </div>
            <Link
              to="/registrar-presenca"
              className="flex h-[59px] w-full shrink-0 items-center justify-center rounded-[8px] bg-brand-action px-[26px] py-[14px] text-[16px] font-semibold leading-normal text-white transition-opacity hover:opacity-90 sm:w-[213px]"
            >
              Confirmar presença
            </Link>
          </div>
        ) : (
          <div className="rounded-[12px] border border-brand-line bg-brand-soft p-[20px]">
            <h2 className="text-[20px] font-bold leading-normal text-ink">Nenhum evento aberto agora</h2>
            <p className="mt-1 text-[14px] leading-normal text-brand-ink">
              Quando uma reunião ou evento estiver em andamento, você poderá confirmar sua presença por aqui.
            </p>
          </div>
        )}
      </section>

      <section
        aria-label="Últimas reuniões"
        className="mt-[46px] pl-[clamp(20px,5.2vw,65px)] pr-[clamp(20px,3.5vw,44px)] md:pl-[clamp(20px,5vw,63px)]"
      >
        <div className="flex w-full max-w-[358px] flex-col gap-[12px] rounded-[12px] border border-line bg-white p-[20px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold leading-normal text-ink">Últimas reuniões</h2>
            <Link to="/historico" className="flex items-center gap-[4px] text-[13px] font-semibold leading-normal text-brand-action">
              Ver tudo
              <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          {ultimas.slice(0, 4).map(({ chave, data, titulo, item }) => (
            <div key={chave} className="flex items-center gap-[12px] py-[4px]">
              <span className="grid h-[40px] w-[48px] shrink-0 place-items-center rounded-[8px] bg-wash text-[12px] font-semibold text-muted">
                {data}
              </span>
              <p className="min-w-0 flex-1 text-[14px] font-semibold leading-normal text-ink">{titulo}</p>
              {item ? <BadgeDoStatus status={item.status} /> : <BadgeDoStatus status="AGUARDANDO" />}
            </div>
          ))}
          {historico && ultimas.length === 0 && <p className="text-[14px] text-muted">Nenhum registro ainda.</p>}
        </div>
      </section>
    </div>
  );
}
