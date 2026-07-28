# AGENTS.md - Práticas Next.js

## App Router e Renderização

- Usar App Router em novas funcionalidades
- Preferir Server Components por padrão
- Adicionar `"use client"` somente quando o componente precisar de interatividade, hooks, estado local, efeitos ou APIs do navegador
- Manter Client Components pequenos e próximos dos pontos de interação
- Não importar módulos de servidor, banco de dados, secrets ou SDKs privilegiados em Client Components
- Tratar estados de carregamento, erro e ausência de dados com `loading.tsx`, `error.tsx` e `not-found.tsx` quando aplicável
- Não ignorar erros de hidratação; investigar divergências entre renderização de servidor e cliente

## Dados e Cache

- Definir explicitamente o comportamento de cache para cada fonte de dados dinâmica
- Usar revalidação quando dados puderem ficar temporariamente desatualizados
- Não usar conteúdo dinâmico em páginas estáticas sem declarar essa necessidade

## Estilização e Assets

- Tailwind CSS é a biblioteca padrão de estilização
- Usar CSS Modules para estilos específicos de componente
- Evitar `styled-components`
- Usar `next/image` para imagens de conteúdo e informar dimensões ou `fill` adequadamente
- Usar `next/font` para carregamento de fontes

## Metadata

- Usar `generateMetadata` para SEO dinâmico
- Definir metadata estática em layouts pai

## Ambiente

- Usar o prefixo `NEXT_PUBLIC_` apenas para variáveis intencionalmente expostas ao client
