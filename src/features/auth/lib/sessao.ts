import type { Perfil } from "../../../mocks/sessao";

const CHAVE = "includepresenca:token";

export interface Sessao {
  token: string;
  /** `sub` do JWT (Guid do membro). */
  id: string;
  email: string;
  perfil: Perfil;
}

function base64UrlParaTexto(valor: string) {
  const base64 = valor.replace(/-/g, "+").replace(/_/g, "/");
  const preenchido = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binario = atob(preenchido);
  return new TextDecoder().decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)));
}

const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

/** Converte o valor da claim de perfil do backend ("Membro" | "Diretoria") para o tipo do front. */
function perfilDaClaim(claims: Record<string, unknown>): Perfil {
  const bruto = claims.role ?? claims[CLAIM_ROLE];
  const papeis = Array.isArray(bruto) ? bruto : [bruto];
  return papeis.some((p) => String(p).toLowerCase() === "diretoria") ? "DIRETORIA" : "MEMBRO";
}

/** Lê o JWT sem validar a assinatura (quem valida é a API). Retorna null se inválido ou expirado. */
function decodificar(token: string): Sessao | null {
  try {
    const [, payload] = token.split(".");
    const claims = JSON.parse(base64UrlParaTexto(payload)) as Record<string, unknown>;
    if (typeof claims.exp === "number" && claims.exp * 1000 <= Date.now()) return null;
    return {
      token,
      id: String(claims.sub ?? ""),
      email: String(claims.email ?? ""),
      perfil: perfilDaClaim(claims),
    };
  } catch {
    return null;
  }
}

function armazenamentos() {
  return [localStorage, sessionStorage];
}

/** "Manter conectado" marcado → localStorage (sobrevive ao fechar o navegador); senão → sessionStorage. */
export function salvarToken(token: string, manterConectado: boolean) {
  limparSessao();
  try {
    (manterConectado ? localStorage : sessionStorage).setItem(CHAVE, token);
  } catch {
    /* armazenamento indisponível: a sessão vale só até recarregar a página */
  }
}

export function sessaoAtual(): Sessao | null {
  for (const armazenamento of armazenamentos()) {
    try {
      const token = armazenamento.getItem(CHAVE);
      if (!token) continue;
      const sessao = decodificar(token);
      if (sessao) return sessao;
      armazenamento.removeItem(CHAVE); // expirado ou corrompido
    } catch {
      /* ignora */
    }
  }
  return null;
}

export function limparSessao() {
  for (const armazenamento of armazenamentos()) {
    try {
      armazenamento.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
  }
}

export const lerToken = () => sessaoAtual()?.token ?? null;

/** Nome de exibição provisório: o JWT do backend traz só e-mail e perfil (sem nome). */
export function nomeDoEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
}
