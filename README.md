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

Ajuste `VITE_API_URL` em `.env` para a URL-base fornecida pelo backend.

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
| `/cadastro` | Cadastrar membro |
| `/esqueci-senha` | Esqueceu a senha |
| `/` | Início (área do membro) |
| `/registrar-presenca` | Confirmar presença (código de 6 caracteres) |
| `/historico` | Histórico de reuniões |

### Dados de exemplo (sem backend)

Com `VITE_USE_MOCKS=true` (padrão no `.env.example`) os serviços devolvem os dados do protótipo
(`src/mocks/dados.ts`). Para usar a API real, defina `VITE_USE_MOCKS=false` e `VITE_API_URL`.
No modo de exemplo, o código `A7K2XX` simula um código inválido na tela de confirmar presença.

### Endpoints assumidos (confirmar com o backend)

- `POST /auth/cadastro` — `{ nome, numero, setor, email, senha }`
- `POST /auth/esqueci-senha` — `{ email }`
- `GET /me` — `{ nome, setor? }`
- `GET /me/presencas?dias=` — lista de `RegistroHistorico` (ver `features/presencas/types/presenca.ts`)
- `GET /me/frequencia` — com o campo opcional `atrasos`
- `Evento.terminoEm` (opcional) para definir quando o evento está "aberto agora"

Sessão/token ainda não foi implementada, conforme o contrato de autenticação pendente.
