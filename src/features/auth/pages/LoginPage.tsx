import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-5">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-7">
          <div className="mb-4 grid size-11 place-items-center rounded-xl bg-slate-900 font-bold text-white">IP</div>
          <h1 className="text-2xl font-semibold">Entrar no IncludePresença</h1>
          <p className="mt-2 text-sm text-slate-500">A tela será conectada ao contrato de autenticação do backend.</p>
        </div>
        <label className="mb-2 block text-sm font-medium" htmlFor="email">E-mail</label>
        <input id="email" type="email" placeholder="seu@email.com" className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-500" />
        <label className="mb-2 block text-sm font-medium" htmlFor="password">Senha</label>
        <input id="password" type="password" placeholder="Sua senha" className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-500" />
        <button type="button" disabled className="w-full cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600">Aguardando contrato de autenticação</button>
        <p className="mt-5 text-center text-xs text-slate-500"><Link to="/" className="underline">Abrir ambiente de desenvolvimento</Link></p>
      </section>
    </main>
  );
}
