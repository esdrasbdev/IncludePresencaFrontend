import { useQuery } from "@tanstack/react-query";
import { frequenciaService } from "../../dashboard/services/frequenciaService";

export function useMeuHistorico(dias = 60) {
  return useQuery({
    queryKey: ["me", "presencas", dias],
    queryFn: () => frequenciaService.obterMeuHistorico({ dias }),
  });
}
