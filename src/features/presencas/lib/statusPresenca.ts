import type { StatusHistorico } from "../types/presenca";

// Aceita os nomes em inglês do contrato conhecido (Pending, Present, JustifiedAbsence, UnjustifiedAbsence)
// e os nomes que o front já usa. O que não for reconhecido vira "AGUARDANDO" (nunca presença por engano).
const MAPA: Record<string, StatusHistorico> = {
  pending: "AGUARDANDO",
  aguardando: "AGUARDANDO",
  present: "PRESENTE",
  presente: "PRESENTE",
  late: "ATRASO",
  atraso: "ATRASO",
  justifiedabsence: "FALTA_JUSTIFICADA",
  falta_justificada: "FALTA_JUSTIFICADA",
  unjustifiedabsence: "FALTA_NAO_JUSTIFICADA",
  falta_nao_justificada: "FALTA_NAO_JUSTIFICADA",
};

export function statusPresencaDaApi(valor: unknown): StatusHistorico {
  return MAPA[String(valor ?? "").trim().toLowerCase()] ?? "AGUARDANDO";
}

/** A resposta do endpoint de senha ainda não foi confirmada: aceita texto puro ou `{ codigo }` / `{ code }`. */
export function extrairCodigo(dados: unknown): string | null {
  if (typeof dados === "string" && dados.trim()) return dados.trim();
  if (dados && typeof dados === "object") {
    const o = dados as Record<string, unknown>;
    for (const chave of ["codigo", "code"]) {
      if (typeof o[chave] === "string" && (o[chave] as string).trim()) return (o[chave] as string).trim();
    }
  }
  return null;
}

/** Semente estável a partir do id (Guid em texto ou número em texto), só para o código do modo de exemplo. */
export function sementeDoId(id: string) {
  if (/^\d+$/.test(id)) return Number(id);
  let h = 0;
  for (const c of id) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  return h;
}
