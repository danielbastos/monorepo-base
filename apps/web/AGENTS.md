# AGENTS.md - Práticas Next.js

## Estrutura de Diretórios

- `src/app/` — App Router (rotas por diretório)
- `src/components/` — componentes reutilizáveis
- `src/lib/` — utilitários, helpers, lógica de negócio
- `src/types/` — tipos compartilhados
- `public/` — assets estáticos

## Convenções Next.js

### App Router

- Usar App Router (`src/app/`) — não Pages Router
- Layouts para layouts compartilhados entre rotas
- Manter um baseline global com `loading.tsx`, `error.tsx` e `not-found.tsx` em `src/app/`
- Adicionar arquivos especiais em rotas específicas apenas quando precisarem de comportamento diferente do baseline global

### Server vs Client Components

- **Server Components** (padrão) — renderizar no servidor
- **Client Components** — usar `"use client"` apenas quando necessário (interatividade, hooks, browser APIs)
- Manter a maioria dos componentes como Server Components
- Dados do servidor ficam no servidor — não passar funções/DB para client

### Server Actions

- Usar Server Actions para mutações de dados
- Validar inputs antes de processar
- Retornar objetos de erro padronizados

### Estilização

- Tailwind CSS é a biblioteca padrão de estilização
- CSS Modules para estilos específicos de componente
- Evitar `styled-components` 

### Metadata

- Usar `generateMetadata` para SEO dinâmico
- Definir metadata estática em layouts pai

### Ambiente

- `.env.local` para variáveis de ambiente locais
- `.env` para defaults
- Nunca commitar `.env.local`
- Usar `NEXT_PUBLIC_` prefixo para variáveis expostas ao client

## Linting

- Biome com configuração compartilhada na raiz
- `pnpm lint` para verificar e `pnpm lint:fix` para corrigir
