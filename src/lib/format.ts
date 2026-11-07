const TZ = "America/Sao_Paulo";

const fmtHora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const fmtDataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ });
const fmtData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ });

export const hora = (iso: string) => fmtHora.format(new Date(iso));
export const dataCurta = (iso: string) => fmtDataCurta.format(new Date(iso));
export const dataCompleta = (iso: string) => fmtData.format(new Date(iso));

export function intervalo(inicioIso: string, terminoIso?: string | null) {
  return terminoIso ? `${hora(inicioIso)} – ${hora(terminoIso)}` : hora(inicioIso);
}

export function ehHoje(iso: string) {
  return fmtData.format(new Date(iso)) === fmtData.format(new Date());
}

/** "Hoje" quando o evento é no dia atual; caso contrário, dd/mm. */
export function rotuloDia(iso: string) {
  return ehHoje(iso) ? "Hoje" : dataCurta(iso);
}

export function somarMinutos(iso: string, minutos: number) {
  return new Date(new Date(iso).getTime() + minutos * 60_000).toISOString();
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}
