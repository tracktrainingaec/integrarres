# Diretriz: Criação da Turma Integrar Girau

## Objetivo
Criar programaticamente a nova turma "Integrar Girau" no banco de dados Supabase e garantir que o sistema administrativo permita a gestão de novas turmas de forma independente.

## Contexto Técnico
- **Tabela Alvo**: `public.events` (Projeto `myfgfnyhthkicouwcoxs`)
- **Campos Necessários**: `name`, `slug`, `keyword`, `active`
- **Bloqueio Identificado**: A política de RLS (Row-Level Security) impede inserções e atualizações diretas via chave anônima externa sem políticas explícitas de `INSERT`, `UPDATE` e `SELECT`.

## Protocolo Operacional (DOE)

### Directive (D)
- Documentar a necessidade de bypass de RLS ou uso de `service_role_key`.
- Fornecer o SQL necessário para execução manual das políticas de `INSERT`, `UPDATE` e `SELECT`.

### Orchestration (O)
- Implementar interface de criação de eventos no `DashboardPage.tsx`.
- Centralizar lógica de persistência em `src/utils/api.ts` usando RPC para bypass de RLS.

### Execution (E)
- Script de criação inicial: `scripts/create_event_girau.js`.
- Migração de UI para suporte a novos eventos.
- Implementação da função `set_active_event` no PostgreSQL.

## Aprendizados (2026-04-30)
- O projeto utiliza dois ambientes Supabase distintos: um para o site "Integrar" (`myfgfnyhthkicouwcoxs`) e outro para gestão de treinamento (`jxlvqsoudlcsbbntmtsr`).
- A tabela `events` no projeto principal possui RLS ativo, exigindo permissões de nível de serviço para inserção via script.
- A melhor solução de longo prazo é permitir que o administrador crie turmas via interface segura.
