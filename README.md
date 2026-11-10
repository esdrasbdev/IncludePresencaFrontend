# IncludePresença

Frontend web para gestão de eventos, check-in e acompanhamento de frequência de membros.

## Stack

- React + Vite + TypeScript
- React Router
- Tailwind CSS
- Axios
- TanStack Query
- React Hook Form + Zod
- Lucide React
- Recharts

## Instalação

```bash
npm install
cp .env.example .env
npm run dev
```

No Windows PowerShell, para copiar o arquivo de ambiente:

```powershell
Copy-Item .env.example .env
```

O front sobe em `http://localhost:5173` (porta fixa) e repassa `/api/*` para o backend em `http://localhost:5045`
(proxy do Vite, ver `vite.config.ts`). Se o backend estiver em outro endereço, ajuste `VITE_PROXY_TARGET` no `.env`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Organização

- `src/features`: funcionalidades de negócio separadas por domínio.
- `src/components`: componentes compartilhados.
- `src/services`: cliente HTTP e integrações.
- `src/types`: contratos e tipos compartilhados.
- `src/app`: roteamento e provedores globais.


## Estado atual

Esta é a fundação do frontend. As telas estão como pontos de entrada iniciais; a integração real depende da API disponível e do contrato final.

## Telas implementadas (fiéis ao protótipo do Figma)

| Rota | Tela |
| --- | --- |
| `/login` | Login |
| `/esqueci-senha` | Esqueceu a senha |
| `/activate?token=...` | Ativação de conta (link do e-mail de convite) |
| `/reset-password?token=...` | Redefinição de senha (link do e-mail de recuperação) |
| `/` | Início (área do membro) |
| `/registrar-presenca` | Confirmar presença (código de 6 caracteres) |
| `/historico` | Histórico de reuniões |

## Integração com o backend (ASP.NET)

Não existe auto-cadastro: a **Diretoria** cadastra o membro (`Gerenciamento > Novo membro`), o backend envia um
e-mail com o link `/activate?token=...` e o membro define a própria senha.

| Tela / ação | Endpoint do backend |
| --- | --- |
| Login | `POST /api/auth/login` `{ email, password }` → `{ accessToken }` (JWT, 1 h) |
| Ativar conta | `POST /api/auth/activate` `{ token, password }` |
| Esqueci a senha | `POST /api/auth/forgot-password` `{ email }` |
| Redefinir senha | `POST /api/auth/reset-password` `{ token, password }` |
| Novo membro (Diretoria) | `POST /api/members` `{ name, email, role }` — `role`: `1` Membro, `2` Diretoria |
| Reenviar convite (sem botão na tela ainda) | `POST /api/members/{id}/resend-activation` |

- **Sessão:** o JWT fica em `localStorage` ("Manter conectado" marcado) ou `sessionStorage`; vai no cabeçalho
  `Authorization: Bearer`. Perfil (`Membro`/`Diretoria`) vem da claim `role`. Rotas logadas exigem token e a área
  `/diretoria` exige perfil Diretoria. Token expirado (401) volta ao login.
- **Nome do usuário:** o JWT só traz e-mail e perfil (não há `GET /me`), então o nome exibido é derivado do e-mail.
- **Cargo no modal "Novo membro":** `Membro` → role 1; `Diretor(a)` e `Admin` → role 2. **Número** e **Setor** ainda
  não existem no backend e não são enviados.

### Módulos que o backend ainda não tem

Eventos, presenças/check-in, justificativas, frequência, relatórios, e listar/editar/inativar membros **não existem
no backend**. Com `VITE_MOCK_MODULOS_PENDENTES=true` (padrão) essas telas seguem com dados de exemplo
(`src/mocks`). Com `false` elas chamam rotas assumidas e mostram erro até o backend implementá-las.
`VITE_USE_MOCKS=true` volta ao modo 100% exemplo (sem backend; e-mails com `diretoria` entram como Diretoria).

## Segunda entrega de telas (protótipo do Figma)

| Rota | Tela |
| --- | --- |
| `/justificar-falta` | Justificar falta (membro) |
| `/diretoria` | Painel da diretoria |
| `/diretoria/eventos` | Eventos (+ modal "Novo evento" via `?novo=1`) |
| `/diretoria/gerenciamento` | Gerenciamento de membros |
| `/diretoria/justificativas` | Justificativas (detalhe em painel lateral) |

- **Endpoints assumidos (ainda não existem no backend):** `GET /me/faltas?semJustificativa=true`, `GET|POST /me/justificativas`, `GET /justificativas`, `PATCH /justificativas/:id`, `GET|POST /membros`, `PATCH /membros/:id`, `PATCH /membros/:id/status`, `GET /eventos/resumo`, `GET /relatorios/frequencia-global`.

### Ajustes recentes

- Menu da diretoria idêntico em todas as páginas (igual ao do Painel).
- Gerenciamento: tabela proporcional ao tamanho do card e botão "Novo membro" abre um modal (`POST /membros` assumido).
- Modais da diretoria com cartão branco e fundo escurecido.
- Setores do modal de membro: Comercial, Desenvolvimento, Financeiro, Marketing, Presidência Executiva, Projetos, Recursos Humanos e VPGG (`src/features/auth/lib/setores.ts`).
