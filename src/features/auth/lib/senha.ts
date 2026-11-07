export const CRITERIOS_SENHA = [
  { id: "tamanho", rotulo: "Mínimo de 8 caracteres", atende: (s: string) => s.length >= 8 },
  { id: "maiuscula", rotulo: "Letra maiúscula", atende: (s: string) => /[A-Z]/.test(s) },
  { id: "minuscula", rotulo: "Letra minúscula", atende: (s: string) => /[a-z]/.test(s) },
  { id: "numero", rotulo: "Pelo menos um número", atende: (s: string) => /\d/.test(s) },
  { id: "especial", rotulo: "Caractere especial", atende: (s: string) => /[^A-Za-z0-9]/.test(s) },
] as const;

export const senhaValida = (senha: string) => CRITERIOS_SENHA.every((c) => c.atende(senha));
