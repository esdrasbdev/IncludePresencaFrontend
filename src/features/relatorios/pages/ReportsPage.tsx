import { Download } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";

export function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Acompanhe indicadores gerais e consulte os registros de frequência."
        action={<button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400"><Download size={16} /> Exportar CSV</button>}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-medium">Relatórios da diretoria</h2>
        <p className="mt-1 text-sm text-slate-500">A frequência global e a tabela serão conectadas aos endpoints /api/relatorios.</p>
      </div>
    </>
  );
}
