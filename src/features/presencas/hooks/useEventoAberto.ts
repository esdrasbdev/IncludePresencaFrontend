import { useQuery } from "@tanstack/react-query";
import { eventosService } from "../../eventos/services/eventosService";

export function useEventoAberto() {
  return useQuery({ queryKey: ["eventos", "aberto"], queryFn: eventosService.obterEventoAberto });
}
