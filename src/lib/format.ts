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

const partesDia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: TZ });

/** "03 nov" */
export function diaMesAbreviado(iso: string) {
  const partes = partesDia.formatToParts(new Date(iso));
  const dia = partes.find((p) => p.type === "day")?.value ?? "";
  const mes = (partes.find((p) => p.type === "month")?.value ?? "").replace(".", "");
  return `${dia} ${mes}`;
}

/** "há 2 horas", "há 5 dias" */
export function haTempo(iso: string) {
  const minutos = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutos < 60) return minutos <= 1 ? "agora há pouco" : `há ${minutos} minutos`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.round(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

/** "05/11 às 09:12" */
export function dataHoraCurta(iso: string) {
  return `${dataCurta(iso)} às ${hora(iso)}`;
}
