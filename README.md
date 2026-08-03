# monorepo-base

Monorepo com pnpm workspaces contendo duas aplicações e packages reutilizáveis:

- **web** — Frontend em Next.js 16
- **api** — Backend em Fastify 5
- **database** — Prisma, PostgreSQL, migrations e adapters de persistência
- **auth** — Better Auth, e-mail/senha, Google e organizações multi-tenant

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
| `pnpm test` | Executa os testes automatizados |
| `pnpm db:generate` | Gera o Prisma Client |
| `pnpm db:migrate` | Cria/aplica migrations em desenvolvimento |
| `pnpm db:migrate:deploy` | Aplica migrations versionadas |
| `pnpm db:studio` | Abre o Prisma Studio |
| `pnpm auth:schema` | Atualiza o schema de autenticação e organizações |
| `pnpm ui:add -- <componente>` | Adiciona um componente com o CLI shadcn |
| `pnpm ui:diff -- <componente>` | Compara um componente local com o registry |
| `pnpm ui:view -- <componente>` | Exibe um componente do registry |

## Estrutura

```
monorepo-base/
├── AGENTS.md            # Regras comuns do monorepo
├── biome.json           # Lint e formatação compartilhados
├── tsconfig.base.json   # Config TypeScript compartilhada
├── apps/
    ├── web/             # Next.js 16 (App Router + Tailwind v4)
    │   ├── AGENTS.md    # Práticas Next.js
    │   └── src/app/
    └── api/             # Fastify 5 (helmet + rate-limit)
        ├── AGENTS.md    # Práticas Fastify
        └── src/
└── packages/
    ├── auth/            # Autenticação, organizações e SMTP
    └── database/        # Único package com acesso ao Prisma
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

O navegador não acessa a API Fastify diretamente. Formulários usam Server
Actions e os callbacks de OAuth/verificação passam por Route Handlers do
Next.js. Somente o BFF usa `API_BASE_URL`; por isso, a API não registra CORS.

## Autenticação e multi-tenancy

- E-mail e senha exigem confirmação de e-mail; senhas têm de 12 a 128 caracteres.
- Google é o provedor social inicial. Configure o callback local como
  `http://localhost:3000/auth/api/callback/google`.
- Sessões são persistidas, duram sete dias e são renovadas após um dia de
  atividade. O `proxy.ts` repassa o `Set-Cookie` da API ao navegador.
- Redefinir a senha revoga as sessões existentes.
- Usuários podem participar de várias organizações. Os papéis disponíveis são
  `owner`, `admin` e `member`.
- Convites expiram em 48 horas e exigem que o destinatário tenha e-mail
  verificado.
- Ações sensíveis de organização exigem uma sessão criada nos últimos 15
  minutos.
- Todo futuro dado de negócio pertencente a um tenant deve conter
  `organizationId`; slug e tenant ativo nunca substituem autorização na API.

O package `packages/database` é o único que importa Prisma. A API recebe um
adapter opaco e controla o fechamento da conexão no ciclo de vida do Fastify.
Tokens internos do Better Auth são tratados como valores opacos; qualquer
operação explícita futura com tokens deve ficar isolada no package de
autenticação.
