import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";

export function MemberDashboardPage() {
  return (
    <>
      <PageHeader title="Visão geral" description="Acompanhe sua frequência e os eventos da organização." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Frequência" value="—" helper="Aguardando dados da API" />
        <StatCard label="Eventos" value="—" helper="Total de eventos considerados" />
        <StatCard label="Presenças" value="—" helper="Presenças confirmadas" />
        <StatCard label="Faltas" value="—" helper="Justificadas e não justificadas" />
      </section>
      <section className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6">
        <h2 className="font-semibold">Seu histórico aparecerá aqui</h2>
        <p className="mt-1 text-sm text-slate-500">Os indicadores serão carregados de /api/me/frequencia e /api/me/presencas.</p>
      </section>
    </>
  );
}
