# monorepo-base

Monorepo com pnpm workspaces contendo duas aplicações:

- **web** — Frontend em Next.js 16
- **api** — Backend em Fastify 5

O projeto usa TypeScript 5.9.3, versão recomendada e compatível com o Next.js
adotado neste monorepo.

## Pré-requisitos

- Node.js 24
- pnpm 11.12.0

## Instalação

```bash
pnpm install
```

## Comandos

| Comando | Descrição |
|---|---|
| `pnpm dev` | Roda web e api em paralelo |
| `pnpm dev:web` | Roda apenas o frontend (Next.js) |
| `pnpm dev:api` | Roda apenas o backend (Fastify) |
| `pnpm build` | Compila web e api |
| `pnpm build:web` | Builda apenas o frontend |
| `pnpm build:api` | Builda apenas o backend |
| `pnpm lint` | Verifica lint e formatação com Biome |
| `pnpm lint:fix` | Corrige automaticamente lint e formatação |
| `pnpm format` | Formata o monorepo com Biome |
| `pnpm typecheck` | Typecheck em web e api em paralelo |
| `pnpm typecheck:web` | Typecheck apenas no frontend |
| `pnpm typecheck:api` | Typecheck apenas no backend |
| `pnpm start:api` | Inicia o backend em produção |

## Estrutura

```
monorepo-base/
├── AGENTS.md            # Regras comuns do monorepo
├── biome.json           # Lint e formatação compartilhados
├── tsconfig.base.json   # Config TypeScript compartilhada
└── apps/
    ├── web/             # Next.js 16 (App Router + Tailwind v4)
    │   ├── AGENTS.md    # Práticas Next.js
    │   └── src/app/
    └── api/             # Fastify 5 (helmet + rate-limit)
        ├── AGENTS.md    # Práticas Fastify
        └── src/
```

## Portas

| App | Porta padrão |
|---|---|
| web | 3000 |
| api | 3333 |

## Ambiente

Copie os exemplos antes de iniciar as aplicações localmente:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

`API_BASE_URL` é exclusivamente server-side e não deve usar o prefixo
`NEXT_PUBLIC_`. A API aceita `PORT`, `HOST` e `LOG_LEVEL` por meio do ambiente
do processo.

O navegador não acessa a API Fastify diretamente. Toda comunicação entre o
frontend e `apps/api` deve ocorrer em código server-side do Next.js, usando
`API_BASE_URL`. Por isso, a API não registra um plugin de CORS.
