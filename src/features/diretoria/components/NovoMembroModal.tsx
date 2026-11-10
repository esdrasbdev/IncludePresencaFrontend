import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Info } from "lucide-react";
import { mensagemDeErro, statusHttp } from "../../../lib/apiError";
import { CARGOS, SETORES } from "../../auth/lib/setores";
import { membrosService } from "../../membros/services/membrosService";
import type { Membro } from "../../membros/types/membro";
import { CampoModal, ModalBase, entradaModal } from "./CamposModal";

function mascararTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export function NovoMembroModal({ onFechar, membro }: { onFechar: () => void; membro?: Membro }) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState(membro?.nome ?? "");
  const [numero, setNumero] = useState(membro?.numero ?? "");
  const [email, setEmail] = useState(membro?.email ?? "");
  const [setor, setSetor] = useState(membro?.area ?? "");
  const [cargo, setCargo] = useState<string>(membro?.cargo ?? CARGOS[0]);
  const [tentou, setTentou] = useState(false);
  const editando = Boolean(membro);
  const setoresDisponiveis = Array.from(new Set([...(setor ? [setor] : []), ...SETORES]));

  useEffect(() => {
    setNome(membro?.nome ?? "");
    setNumero(membro?.numero ?? "");
    setEmail(membro?.email ?? "");
    setSetor(membro?.area ?? "");
    setCargo(membro?.cargo ?? CARGOS[0]);
    setTentou(false);
  }, [membro]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onFechar]);

  const salvar = useMutation({
    mutationFn: () => {
      const payload = { nome: nome.trim(), numero, email: email.trim(), setor, cargo };
      return membro ? membrosService.atualizar(membro.id, payload) : membrosService.criar(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["membros"] });
      onFechar();
    },
  });

  const erros = {
    nome: nome.trim().length < 3 ? "Informe o nome completo." : undefined,
    numero: !/^\(\d{2}\) 9\d{4}-\d{4}$/.test(numero) ? "Use o formato (00) 90000-0000." : undefined,
    email: !emailValido(email.trim()) ? "Informe um e-mail válido." : undefined,
    setor: !setor ? "Selecione um setor." : undefined,
  };
  const valido = !Object.values(erros).some(Boolean);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (valido) salvar.mutate();
  }

  const seta = <ChevronDown size={20} strokeWidth={1.8} className="pointer-events-none shrink-0 text-subtle" aria-hidden="true" />;

  return (
    <ModalBase titulo={editando ? "Editar membro" : "Novo membro"} tituloId="titulo-membro" onFechar={onFechar}>
      <form noValidate onSubmit={enviar}>
        <div className="mt-[14px] flex flex-col gap-[16px]">
          <CampoModal rotulo="Nome" erro={tentou ? erros.nome : undefined}>
            <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Maria Isabel" autoComplete="off" className={entradaModal} />
          </CampoModal>
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <CampoModal rotulo="Número" erro={tentou ? erros.numero : undefined}>
              <input
                type="tel"
                inputMode="numeric"
                value={numero}
                onChange={(e) => setNumero(mascararTelefone(e.target.value))}
                placeholder="(00) 90000-0000"
                className={entradaModal}
              />
            </CampoModal>
            <CampoModal rotulo="E-mail" erro={tentou ? erros.email : undefined}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@includejr.com.br" autoComplete="off" className={entradaModal} />
            </CampoModal>
          </div>
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <CampoModal rotulo="Setor" erro={tentou ? erros.setor : undefined} icone={seta}>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className={`${entradaModal} order-first cursor-pointer appearance-none ${setor ? "" : "text-black/60"}`}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {setoresDisponiveis.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </CampoModal>
            <CampoModal rotulo="Cargo" icone={seta}>
              <select value={cargo} onChange={(e) => setCargo(e.target.value)} className={`${entradaModal} order-first cursor-pointer appearance-none`}>
                {CARGOS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </CampoModal>
          </div>

          {!editando && (
            <div className="flex items-center gap-[10px] rounded-[10px] bg-[#ffeeee] px-[16px] py-[12px] text-[#e43636]">
              <Info size={18} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
              <p className="text-[13px] leading-[1.25]">O membro receberá um e-mail para criar a própria senha e acessar o sistema.</p>
            </div>
          )}

          {salvar.isError && (
            <p role="alert" className="text-[13px] font-medium text-[#b91c1c]">
              {statusHttp(salvar.error) === 409
                ? "Já existe um membro com este e-mail."
                : mensagemDeErro(salvar.error, `Não foi possível ${editando ? "editar" : "cadastrar"} o membro. Tente novamente.`)}
            </p>
          )}
        </div>

        <div className="mt-[22px] flex items-center justify-end gap-[14px]">
          <button
            type="submit"
            disabled={salvar.isPending}
            className="h-[52px] w-[170px] cursor-pointer rounded-[15px] bg-brand-action text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvar.isPending ? (editando ? "Salvando..." : "Cadastrando...") : editando ? "Editar membro" : "Cadastrar membro"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
