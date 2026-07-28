# monorepo-base

Monorepo com pnpm workspaces contendo duas aplicações:

- **web** — Frontend em Next.js 16
- **api** — Backend em Fastify 5

O projeto usa TypeScript 5.9.3, versão recomendada e compatível com o Next.js
adotado neste monorepo.

## Pré-requisitos

- Node.js 24
- pnpm 11.17.0
- Docker com Docker Compose

## Instalação

```bash
pnpm install
```

## Infraestrutura local

O Compose da raiz fornece os serviços locais usados pelo desenvolvimento:

| Serviço | Imagem | Portas | Acesso |
|---|---|---|---|
| PostgreSQL | `postgres:18` | `5432` | `postgresql://localhost:5432` |
| RustFS S3 | `rustfs/rustfs:1.0.0-beta.11` | `9000` | `http://localhost:9000` |
| RustFS Console | `rustfs/rustfs:1.0.0-beta.11` | `9001` | `http://localhost:9001` |
| Mailpit SMTP | `axllent/mailpit:v1.30.5` | `1025` | `localhost:1025` |
| Mailpit Web | `axllent/mailpit:v1.30.5` | `8025` | `http://localhost:8025` |

Crie o arquivo local de credenciais e suba os serviços:

```bash
cp .env.example .env
docker compose up -d
docker compose ps
```

O `compose.yaml` mantém os dados em volumes nomeados. Para parar os serviços
sem apagar os dados:

```bash
docker compose down
```

Para remover também os volumes e reiniciar todos os serviços do zero:

```bash
docker compose down -v
```

O Compose prepara os serviços, mas não cria buckets no RustFS nem conecta esses
serviços à API nesta etapa.

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
