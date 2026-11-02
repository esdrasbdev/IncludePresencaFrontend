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
