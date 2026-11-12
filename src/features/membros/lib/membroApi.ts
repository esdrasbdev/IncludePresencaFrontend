import type { Membro } from "../types/membro";

/** Enum `Role` do backend (serializado como número). */
export const ROLE = { Membro: 1, Diretoria: 2 } as const;
/** Enum `StatusConta` do backend (serializado como número). */
export const STATUS_CONTA = { PendenteAtivacao: 1, Ativa: 2, Desativada: 3 } as const;

/** Membro como o backend devolve (GET /api/members): JSON em camelCase, enums numéricos. */
export interface MembroApi {
  id: string;
  name: string;
  email: string;
  role: number;
  accountStatus: number;
}

/** Corpo de POST /api/members e PUT /api/members/{id}. */
export interface CorpoMembroApi {
  name: string;
  email: string;
  role: number;
}

/** Diretor(a) e Admin viram Diretoria; o backend só distingue Membro e Diretoria. */
export const roleDoCargo = (cargo: string) => (cargo === "Membro" ? ROLE.Membro : ROLE.Diretoria);
export const cargoDoRole = (role: number) => (role === ROLE.Diretoria ? "Diretor(a)" : "Membro");

export function corpoDoMembro(p: { nome: string; email: string; cargo: string }): CorpoMembroApi {
  return { name: p.nome.trim(), email: p.email.trim(), role: roleDoCargo(p.cargo) };
}

/** Número, setor e assiduidade não existem no backend de identidade: ficam vazios/`null` (a tela mostra "—"). */
export function membroDaApi(m: MembroApi): Membro {
  return {
    id: m.id,
    nome: m.name,
    email: m.email,
    cargo: cargoDoRole(m.role),
    area: "",
    assiduidade: null,
    ativo: m.accountStatus !== STATUS_CONTA.Desativada,
    pendente: m.accountStatus === STATUS_CONTA.PendenteAtivacao,
  };
}
