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
| Listar membros (Diretoria) | `GET /api/members` → `[{ id, name, email, role, accountStatus }]` |
| Novo membro (Diretoria) | `POST /api/members` `{ name, email, role }` — `role`: `1` Membro, `2` Diretoria |
| Editar membro (Diretoria) | `PUT /api/members/{id}` `{ name, email, role }` |
| Inativar / reativar (Diretoria) | `PATCH /api/members/{id}/deactivate` · `PATCH /api/members/{id}/reactivate` |
| Reenviar convite (sem botão na tela ainda) | `POST /api/members/{id}/resend-activation` |
| Listar / consultar eventos | `GET /api/events` · `GET /api/events/{id}` → `{ id, title, description, startsAt, endsAt, isCancelled }` |
| Criar / editar evento (Diretoria) | `POST /api/events` · `PUT /api/events/{id}` `{ title, description, startsAt, endsAt }` |
| Cancelar evento (Diretoria; sem botão na tela ainda) | `PATCH /api/events/{id}/cancel` |

- **Sessão:** o JWT fica em `localStorage` ("Manter conectado" marcado) ou `sessionStorage`; vai no cabeçalho
  `Authorization: Bearer`. Perfil (`Membro`/`Diretoria`) vem da claim `role`. Rotas logadas exigem token e a área
  `/diretoria` exige perfil Diretoria. Token expirado (401) volta ao login.
- **Nome do usuário:** o JWT só traz e-mail e perfil (não há `GET /me`), então o nome exibido é derivado do e-mail e
  marcado como provisório (dica ao passar o mouse sobre o nome no menu lateral).
- **Ids:** todos os identificadores do front são **texto** (Guid do backend). As rotas do backend exigem Guid.
- **Datas de evento:** o backend só aceita **UTC** (`…Z`). O front converte antes de enviar
  (`src/features/eventos/lib/eventoApi.ts`); um valor com fuso (`…-03:00`) seria recusado com 400.
- **Adaptadores:** o formato do backend (campos em inglês, enums numéricos) é convertido para o que as telas usam em
  `features/eventos/lib/eventoApi.ts` e `features/membros/lib/membroApi.ts`. As telas não conhecem o contrato do back.
- **Cargo no modal "Novo membro":** `Membro` → role 1; `Diretor(a)` e `Admin` → role 2 (o back só distingue Membro e
  Diretoria). Com a API real, **Número** e **Setor** não são enviados nem obrigatórios.
- **Conta pendente:** membro que ainda não ativou a conta aparece com o selo "Pendente" na tabela.

### Campos que o backend de identidade não tem

| Campo no front | Com a API real |
| --- | --- |
| Evento: tolerância, responsável, obrigatório, presença média | Tolerância e responsável aparecem como "—"; "Presença média" mostra "sem dados"; o card "Eventos no mês" conta todos os eventos não cancelados. Tolerância e "obrigatório" do modal "Novo evento" não são enviados. |
| Membro: número, setor, assiduidade | Setor e assiduidade aparecem como "—"; número e setor não são enviados. |
| Evento cancelado | Selo "Cancelado" e o botão "Confirmar minha presença" fica desabilitado. |

### Mock por módulo

`VITE_USE_MOCKS=true` liga **todos** os mocks (sem backend; e-mails com `diretoria` entram como Diretoria).
Com `false`, cada módulo escolhe sozinho:

| Módulo | Padrão | Variável para forçar |
| --- | --- | --- |
| Eventos | **API real** | `VITE_MOCK_EVENTOS=true` |
| Membros | **API real** | `VITE_MOCK_MEMBROS=true` |
| Check-in / presenças | exemplo | `VITE_MOCK_PRESENCAS=false` |
| Frequência e histórico do membro | exemplo | `VITE_MOCK_FREQUENCIA=false` |
| Justificativas | exemplo | `VITE_MOCK_JUSTIFICATIVAS=false` |
| Painel e relatórios | exemplo | `VITE_MOCK_RELATORIOS=false` |

`VITE_MOCK_MODULOS_PENDENTES=false` desliga de uma vez os quatro módulos em "exemplo". Check-in é de outro
desenvolvedor e justificativas, frequência e relatórios ainda não existem no backend: as rotas dessas chamadas são
**assumidas** e precisam ser confirmadas antes de desligar o mock.

## Segunda entrega de telas (protótipo do Figma)

| Rota | Tela |
| --- | --- |
| `/justificar-falta` | Justificar falta (membro) |
| `/diretoria` | Painel da diretoria |
| `/diretoria/eventos` | Eventos (+ modal "Novo evento" via `?novo=1`) |
| `/diretoria/gerenciamento` | Gerenciamento de membros |
| `/diretoria/justificativas` | Justificativas (detalhe em painel lateral) |

- **Endpoints ainda não disponíveis no backend:** `GET /me/faltas?semJustificativa=true`, `GET|POST /me/justificativas`, `GET /justificativas`, `PATCH /justificativas/:id`, `GET /relatorios/frequencia-global`. O resumo de eventos integrado usa `GET /api/events/summary`.

### Ajustes recentes

- Menu da diretoria idêntico em todas as páginas (igual ao do Painel).
- Gerenciamento: tabela proporcional ao tamanho do card e botão "Novo membro" abre um modal (`POST /membros` assumido).
- Modais da diretoria com cartão branco e fundo escurecido.
- Setores do modal de membro: Comercial, Desenvolvimento, Financeiro, Marketing, Presidência Executiva, Projetos, Recursos Humanos e VPGG (`src/features/auth/lib/setores.ts`).
