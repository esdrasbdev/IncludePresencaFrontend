import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";

export function EventsPage() {
  return (
    <>
      <PageHeader
        title="Eventos"
        description="Consulte e organize reuniões e eventos."
        action={<button className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"><Plus size={16} /> Novo evento</button>}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-medium">Nenhum evento carregado</h2>
        <p className="mt-1 text-sm text-slate-500">A listagem será integrada a GET /api/eventos.</p>
        <Link to="/eventos/1" className="mt-4 inline-block text-sm underline">Visualizar exemplo de detalhes</Link>
      </div>
    </>
  );
}
