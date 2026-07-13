# AGENTS.md - Práticas Fastify

## Estrutura de Diretórios

- `src/` — código fonte
- `src/routes/` — rotas organizadas por domínio
- `src/plugins/` — plugins compartilhados
- `src/schemas/` — JSON Schemas de validação
- `src/services/` — lógica de negócio
- `src/types/` — tipos compartilhados
- `src/utils/` — utilitários

## Convenções Fastify

### Inicialização

- Usar `buildApp()` pattern — função que retorna a instância do Fastify
- Separar configuração do servidor da inicialização
- Usar `@fastify/env` para validação de variáveis de ambiente na inicialização

### Rotas

- Organizar rotas por domínio/resource
- Usar plugins para agrupar rotas relacionadas
- Definir schema na rota para validação automática de request/response
- Usar `preValidation` hooks para auth e validação comum
- Prefixed routes: `/api/v1/users`, `/api/v1/posts`

### Schema Validation

- Usar JSON Schema nativo do Fastify para validação de rotas
- Separar schemas em arquivos dedicados
- Validar body, params e query string em todas as rotas POST/PUT/PATCH

### Serialização

- Definir `response` schemas para controlar o que é retornado
- Evitar retornar campos sensíveis (senhas, tokens)

### Plugins

- Um plugin por responsabilidade
- Registrar plugins na ordem correta (dependencies first)
- Usar `@fastify/helmet` e `@fastify/rate-limit`

### Hooks

- `onRequest` — autenticação, logging
- `preParsing` — parsing customizado
- `preValidation` — validação customizada
- `preHandler` — lógica antes do handler
- `onSend` — modificar response antes de enviar
- `onError` — tratamento de erros centralizado

### Error Handling

- Usar custom errors com códigos HTTP
- Retornar erro padronizado: `{ error: string, message: string, statusCode: number }`
- Logar erros com contexto para debugging
- Usar `@fastify/sensible` para erros HTTP prontos

### Testing

- Usar `inject()` do Fastify para testes de rotas
- Não subverter servidor HTTP real em testes unitários
- Mockar dependências externas (DB, APIs)


### Environment

- Validar todas as env vars na inicialização
- Usar tipos para env vars
- Nunca logar dados sensíveis

## Linting

- Biome com configuração compartilhada na raiz
- Rodar `pnpm lint` antes de commitar
