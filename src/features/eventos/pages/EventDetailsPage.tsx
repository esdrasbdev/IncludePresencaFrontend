import { useParams } from "react-router-dom";
import { PageHeader } from "../../../components/ui/PageHeader";

export function EventDetailsPage() {
  const { eventoId } = useParams();
  return (
    <>
      <PageHeader title="Detalhes do evento" description={`Evento ${eventoId ?? ""} • dados serão consultados na API.`} />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="font-medium">Detalhes e controle de presença</p>
        <p className="mt-1 text-sm text-slate-500">Aqui ficarão horário, tolerância, responsável, lista de membros, geração de código e confirmação manual.</p>
      </div>
    </>
  );
}
