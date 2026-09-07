# Documentação da Biblioteca Viva

Esta é a entrada única da documentação. O conjunto separa contratos vigentes de registros históricos.

## Ordem de leitura

### Entender o produto

1. `PRODUCT.md`
2. `STATUS.md`
3. `ROADMAP.md`

### Alterar código ou comportamento

1. `STATUS.md`
2. `../AGENTS.md`
3. documento técnico da área
4. `decisions/README.md`
5. `TESTING.md`

### Preparar Android ou release

1. `ANDROID.md`
2. `TESTING.md`
3. `SECURITY.md`
4. `PRIVACY.md`
5. `templates/RELEASE_CHECKLIST.md`

## Documentos ativos

| Documento | Responsabilidade |
|---|---|
| `STATUS.md` | presente, problemas conhecidos e próxima decisão |
| `PRODUCT.md` | visão, contrato atual e limites do produto |
| `ROADMAP.md` | trabalho futuro e critérios de entrada |
| `W3_PLAN.md` | sequência vigente W3-B–W3-F, dependências e limites |
| `ARCHITECTURE.md` | camadas, dependências e autoridades técnicas |
| `DATA_MODEL.md` | entidades, persistência, schemas e backup |
| `WORLD_MODEL.md` | geometria, estrutura, objetos e renderização do mundo |
| `UX.md` | fluxos de uso vigentes |
| `ACCESSIBILITY.md` | requisitos e validações de acesso |
| `TESTING.md` | estratégia, comandos, gates e evidências |
| `SECURITY.md` | ameaças e controles |
| `PRIVACY.md` | dados pessoais e tratamento |
| `PERFORMANCE.md` | orçamento, medições e problemas conhecidos |
| `ANDROID.md` | build, aparelho e release |
| `MAINTENANCE.md` | rotinas de evolução segura |
| `RISKS.md` | riscos ativos e mitigação |
| `ART_DIRECTION.md` | intenção visual vigente |
| `ASSET_PIPELINE.md` | contrato técnico de assets |
| `ASSET_REGISTRY.md` | origem, licença e estado dos assets |
| `AUDIO.md` | arquitetura e validação sonora |
| `CONTENT_GUIDE.md` | conteúdo, localização e diálogos |
| `GLOSSARY.md` | vocabulário atual |
| `HISTORY.md` | cronologia resumida |
| `decisions/` | decisões vigentes |
| `history/` | documentos encerrados e evidência histórica |

## Regras de consistência

- Só `STATUS.md` declara o presente operacional.
- `ROADMAP.md` não repete logs de execução.
- Documentos técnicos descrevem o contrato vigente, não a sequência que o produziu.
- Resultados de testes pertencem ao checkpoint correspondente; estratégia de testes fica em `TESTING.md`.
- Decisão substituída permanece no histórico e aponta para sua sucessora.
- Conteúdo de `history/` nunca autoriza trabalho.
- Datas são absolutas no formato `AAAA-MM-DD`.

## Autoridade e atualização

Documentação deve acompanhar o comportamento, mas não substitui inspeção do código. Se `STATUS.md`, uma decisão e o checkout divergirem, registre a inconsistência antes de alterar o subsistema afetado.
