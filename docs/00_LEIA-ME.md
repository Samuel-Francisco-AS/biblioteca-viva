# Documentação da Biblioteca Viva

> Estado atual em 2026-08-10: Gates G0 a G3, G5 e G6 aprovados; G4 permanece aberto por uso real prolongado; Blocos 5 e 6 concluídos; Prompts 14 e 15 estão tecnicamente implementados, com validações humanas acumuladas para checkpoint integrado; G7 permanece aberto; versão `0.2.0-alpha.1`.

## 1. Função desta documentação

A documentação existe para preservar contexto, limitar escopo, orientar implementação e tornar o projeto continuável sem depender da memória de conversas ou do comportamento de um agente específico.

Ela está dividida por frequência de mudança:

- **estáveis:** visão, princípios, arquitetura;
- **operacionais:** produto, roadmap, execução, testes;
- **voláteis:** status, riscos e pendências;
- **históricos:** decisões e changelog.

## 2. Ordem de leitura por objetivo

### Entender o projeto

1. `VISION.md`;
2. `PRODUCT.md`;
3. `PLANO_MESTRE.md` para a visão de longo prazo.

### Executar uma tarefa

1. `STATUS.md`;
2. `../AGENTS.md`;
3. documento da área;
4. `ROADMAP.md`;
5. prompt correspondente em `EXECUTION_PLAN.md`.

### Avaliar uma mudança arquitetural

1. `ARCHITECTURE.md`;
2. `DECISIONS.md`;
3. `DATA_MODEL.md` ou documento técnico relacionado;
4. `RISK_REGISTER.md`.

### Preparar um gate ou release

1. `TEST_PLAN.md`;
2. `ANDROID_RELEASE.md`, quando aplicável;
3. `templates/GATE_REPORT_TEMPLATE.md`;
4. `CHANGELOG.md` na raiz.

## 3. Mapa de arquivos

| Arquivo | Responsabilidade | Atualizar quando |
|---|---|---|
| `STATUS.md` | estado atual e próximo trabalho | toda sessão ou gate |
| `VISION.md` | propósito e princípios duradouros | direção do produto mudar |
| `PRODUCT.md` | contrato do protótipo | escopo aprovado mudar |
| `PLANO_MESTRE.md` | visão completa de longo prazo | estratégia macro mudar |
| `ARCHITECTURE.md` | stack, camadas e contratos | decisão técnica estrutural mudar |
| `DATA_MODEL.md` | entidades, invariantes e migrações | schema ou regra persistente mudar |
| `UX_FLOWS.md` | navegação e fluxos | comportamento do usuário mudar |
| `ROADMAP.md` | marcos, gates e progresso | prompt ou gate mudar de estado |
| `EXECUTION_PLAN.md` | prompts completos do Codex | estratégia de execução mudar |
| `TEST_PLAN.md` | estratégia e evidências | cobertura ou plataforma mudar |
| `SECURITY.md` | controles e ameaças | superfície de ataque mudar |
| `PRIVACY.md` | tratamento de dados pessoais | coleta, conta ou integração mudar |
| `ACCESSIBILITY.md` | requisitos de acesso | UI ou preferências sensoriais mudar |
| `ART_DIRECTION.md` | linguagem visual e assets | direção artística mudar |
| `ASSET_REGISTRY.md` | origem e licença dos assets | asset entrar, mudar ou sair |
| `AUDIO.md` | sistema e direção sonora | comportamento de áudio mudar |
| `CONTENT_GUIDE.md` | textos, diálogos e dados de conteúdo | tom ou schema de conteúdo mudar |
| `PERFORMANCE.md` | metas e perfil | medições ou orçamento mudar |
| `ANDROID_RELEASE.md` | APK, assinatura e distribuição | pipeline Android mudar |
| `MAINTENANCE.md` | evolução e disciplina operacional | política de manutenção mudar |
| `DECISIONS.md` | histórico de decisões | decisão relevante for tomada |
| `RISK_REGISTER.md` | riscos, gatilhos e mitigação | risco mudar |
| `GLOSSARY.md` | vocabulário do domínio | novo termo estrutural surgir |

## 4. Regras de consistência

- `STATUS.md` informa o presente; não use o plano mestre para descobrir o próximo prompt.
- `ROADMAP.md` resume; `EXECUTION_PLAN.md` contém detalhes e prompts.
- `DECISIONS.md` preserva histórico; decisões substituídas não são apagadas.
- Documentação deve descrever o estado real, não a intenção otimista.
- Uma funcionalidade não está concluída até existir evidência de teste e gate aprovado.
- Datas relativas como “hoje” ou “depois” não devem aparecer em registros históricos.

## 5. Estado inicial

- fundação React e TypeScript executável criada pelo Prompt 1;
- Prompt 1 validado manualmente em desktop e três dimensões móveis;
- shell responsivo e cinco rotas criados pelo Prompt 2;
- Prompt 2 concluído e validado no navegador;
- Gates G0 a G3, G5 e G6 aprovados; implementação do Bloco 4 e Prompts 7–13 concluídos;
- G4 permanece aberto por uso pessoal prolongado;
- Blocos 5 e 6 concluídos após validação de backup, restauração e biblioteca visual no Moto G06;
- Bloco 7 possui Prompts 14 e 15 tecnicamente implementados; a primeira validação humana do Prompt 14 foi reprovada e a revalidação, junto à validação do Prompt 15, foi acumulada sem aprovar G7;
- Bloco 8 possui o Prompt 16 tecnicamente implementado com quatro marcos idempotentes e o primeiro desbloqueio; G8 permanece aberto;
- validações manuais repetitivas de G7, G8 e G9 serão agrupadas em checkpoint integrado próximo ao final do protótipo, sem marcar itens não executados como aprovados;
- repositório Git inicializado na branch `main`;
- stack e arquitetura aprovadas;
- APK diagnóstico interno validado no Gate G3; APK release assinado permanece pendente;
- tipos além de livro permanecem fora do protótipo.
