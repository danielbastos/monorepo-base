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

### Código

- Funções puras sempre que possível
- Injetar dependências externas quando isso melhorar isolamento e testabilidade, evitando abstrações antecipadas e containers de DI sem necessidade
- Tratar erros explicitamente — nunca engolir erros silenciosamente
- Validar inputs externos com schemas
- Não commitar secrets, chaves ou credenciais

### Commits

- Mensagens claras e descritivas em inglês
- Formato: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`
- Um commit por mudança lógica

### Git

- Manter `main` protegida e sempre utilizável
- Usar branches curtas `feature/*` e `fix/*`
- Pull requests são obrigatórios para todas as mudanças em `main`
- Usar squash merge para manter um commit por mudança lógica

### Qualidade

- Rodar lint e typecheck antes de commitar
- Não suprimir avisos sem justificativa
- Testes devem ser rápidos e determinísticos

### Dependências

- Instalar apenas o necessário — evitar dependências duplicadas entre pacotes
- Manter dependências atualizadas
- Preferir dependências bem mantidas e com boa reputação

### Segurança

- Nunca expor dados sensíveis em logs
- Usar variáveis de ambiente para configuração
- Validar e sanitizar todas as entradas externas

### Performance

- Medir antes de otimizar
- Evitar trabalho desnecessário no hot path

## Comandos

- `pnpm dev` — rodar web e api em paralelo
- `pnpm build` — buildar todas as aplicações
- `pnpm lint` — lintar todas as aplicações
- `pnpm typecheck` — typecheck em todas as aplicações
