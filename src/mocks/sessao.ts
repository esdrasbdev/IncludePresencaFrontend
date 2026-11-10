export type Perfil = "MEMBRO" | "DIRETORIA";

const CHAVE = "includepresenca:mock-perfil";

/** Só para o modo de exemplo: e-mails com "diretoria" entram como Diretoria. */
export const perfilMock = (): Perfil => (sessionStorage.getItem(CHAVE) as Perfil | null) ?? "MEMBRO";
export const definirPerfilMock = (perfil: Perfil) => sessionStorage.setItem(CHAVE, perfil);
