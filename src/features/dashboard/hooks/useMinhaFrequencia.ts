import { useQuery } from "@tanstack/react-query";
import { frequenciaService } from "../services/frequenciaService";

export function useMinhaFrequencia() {
  return useQuery({ queryKey: ["me", "frequencia"], queryFn: frequenciaService.obterMinhaFrequencia });
}
