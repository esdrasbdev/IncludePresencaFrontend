import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-bold">Página não encontrada</h1>
        <Link className="mt-4 inline-block text-sm underline" to="/">Voltar ao início</Link>
      </div>
    </main>
  );
}
