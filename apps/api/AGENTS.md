# AGENTS.md - Práticas Fastify

## Inicialização e Plugins

- Usar o pattern `buildApp()` para criar e configurar a instância do Fastify
- Separar a configuração da aplicação da inicialização do servidor
- Organizar rotas relacionadas em plugins e registrar dependências antes de seus consumidores
- Usar `@fastify/helmet` e rate limiting como proteções de borda

## Rotas e Contratos HTTP

- Organizar rotas por domínio ou recurso e registrá-las sob um prefixo de API documentado
- Usar JSON Schema nativo do Fastify e manter schemas em arquivos dedicados
- Declarar schemas de `body`, `params` e `querystring` para toda entrada recebida pela rota
- Declarar schemas de resposta para sucessos e erros HTTP esperados
- Definir explicitamente a estratégia para propriedades desconhecidas conforme o contrato da rota
- Usar códigos HTTP semanticamente corretos, incluindo `201`, `204`, `401`, `403`, `404` e `409`

## Handlers e Hooks

- Manter handlers finos: validar entrada, delegar ao serviço e formatar a resposta
- Usar o hook mínimo adequado para preocupações transversais e nunca concentrar regras de negócio em hooks
- Usar erros HTTP customizados ou helpers já disponíveis para expressar falhas esperadas

## Dados e Integrações

- Controlar conexões, clientes HTTP e outros recursos de longa duração no ciclo de vida da aplicação
- Não iniciar conexões por request quando elas puderem ser reutilizadas com segurança
- Usar transações para operações que alterem múltiplos registros dependentes
- Configurar timeouts para integrações externas e aplicar retries apenas quando forem explícitos e seguros
- Paginar endpoints de coleção e definir limite máximo de itens por requisição

## Observabilidade

- Usar logs estruturados com contexto seguro, como request id, rota e status HTTP
- Propagar ou gerar um identificador de correlação por requisição
- Registrar falhas de integrações externas com contexto suficiente para diagnóstico

## Testes

- Usar `inject()` do Fastify para testar rotas sem subir um servidor HTTP real
- Testar schemas e respostas de erro como parte do contrato HTTP
- Mockar dependências externas e usar recursos isolados em testes de integração
