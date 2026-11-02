import { PageHeader } from "../../../components/ui/PageHeader";

export function AttendancePage() {
  return (
    <>
      <PageHeader title="Presenças" description="Consulte registros e acompanhe confirmações de presença." />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-medium">Check-in e registros</h2>
        <p className="mt-1 text-sm text-slate-500">O check-in do membro usará POST /api/eventos/{eventoId}/checkin. A gestão manual usará PATCH /api/eventos/{eventoId}/presencas/{membroId}.</p>
      </div>
    </>
  );
}
