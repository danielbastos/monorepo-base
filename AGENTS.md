# AGENTS.md - Regras Comuns do Monorepo

## Estrutura

- `apps/web/` — aplicação Next.js (frontend)
- `apps/api/` — aplicação Fastify (backend)

## Convenções Gerais

### TypeScript

- Usar `strict: true` em todos os projetos
- Evitar `any` — usar `unknown` quando o tipo for incerto
- Preferir interfaces para shapes de objetos públicos
- Usar `as const` para constantes e configurações imutáveis

### Código e Contratos

- Funções puras sempre que possível
- Injetar dependências externas quando isso melhorar isolamento e testabilidade, evitando abstrações antecipadas e containers de DI sem necessidade
- Validar inputs externos com schemas
- Manter contratos de entrada e saída tipados e documentados nas fronteiras da aplicação
- Tratar erros explicitamente, com respostas consistentes e sem expor detalhes internos ou dados sensíveis
- Aplicar autenticação e autorização no servidor, nunca somente na interface

### Configuração e Segurança

- Usar variáveis de ambiente para configuração e validá-las na inicialização da aplicação
- Manter `.env.example` atualizado sem credenciais reais
- Nunca commitar secrets, chaves ou credenciais
- Nunca expor dados sensíveis em logs
- Validar e sanitizar todas as entradas externas

### Qualidade

- Rodar lint e typecheck antes de commitar
- Não suprimir avisos sem justificativa
- Criar testes para regras de negócio, fluxos críticos e autorização
- Testes devem ser rápidos, determinísticos e independentes da ordem de execução, do relógio real e de serviços externos

### Dependências

- Instalar apenas o necessário — evitar dependências duplicadas entre pacotes
- Manter dependências atualizadas
- Preferir dependências bem mantidas e com boa reputação

### Git

- Manter `main` protegida e sempre utilizável
- Usar branches curtas `feature/*` e `fix/*`
- Pull requests são obrigatórios para todas as mudanças em `main`
- Usar squash merge para manter um commit por mudança lógica
- Mensagens de commit devem ser claras e descritivas em inglês, no formato `<type>(<scope>): <description>`
- Types permitidos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`
- Um commit por mudança lógica

### Performance

- Medir antes de otimizar
- Evitar trabalho desnecessário no hot path

## Comandos

- `pnpm dev` — rodar web e api em paralelo
- `pnpm build` — buildar todas as aplicações
- `pnpm lint` — lintar todas as aplicações
- `pnpm typecheck` — typecheck em todas as aplicações
