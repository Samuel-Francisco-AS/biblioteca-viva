# Roadmap — Biblioteca Viva

> O detalhamento e os prompts completos estão em `EXECUTION_PLAN.md`.

## Legenda

- `[ ]` não iniciado;
- `[~]` em andamento;
- `[x]` concluído;
- `[!]` bloqueado;
- `[-]` removido;
- `[?]` precisa de decisão.

## Estado atual

- **versão:** fundação pré-v0.1.0;
- **bloco:** 1 — Fundação web, em andamento;
- **gate:** G1 atual; G0 aprovado;
- **próximo prompt:** Prompt 1 — Scaffold, ferramentas e documentação-base;
- **APK:** não iniciado;
- **código:** não iniciado.

## Blocos e gates

| Estado | Bloco | Prompts | Resultado observável | Gate |
|---|---:|---:|---|---|
| `[x]` | 0 | — | contrato aprovado | G0 aprovado |
| `[~]` | 1 | 1–2 | fundação web navegável | G1 atual |
| `[ ]` | 2 | 3 | APK debug instalado | G2 |
| `[ ]` | 3 | 4–6 | domínio e persistência isolados | G3 |
| `[ ]` | 4 | 7–9 | app pessoal utilizável | G4 |
| `[ ]` | 5 | 10 | dados exportáveis e recuperáveis | G5 |
| `[ ]` | 6 | 11–13 | biblioteca visual conectada | G6 |
| `[ ]` | 7 | 14–15 | identidade sonora e contextual | G7 |
| `[ ]` | 8 | 16 | primeiro ciclo emocional completo | G8 |
| `[ ]` | 9 | 17–18 | acessibilidade e desempenho mobile | G9 |
| `[ ]` | 10 | 19 | regressão, CI e manutenção | G10 |
| `[ ]` | 11 | — | APK release e portfólio | G11 |

## Marcos sugeridos

- `v0.1.0`: fundação, navegação e prova Android;
- `v0.2.0`: domínio, persistência e CRUD;
- `v0.3.0`: progresso, notas, busca e backup;
- `v0.4.0`: biblioteca visual conectada;
- `v0.5.0`: áudio e primeiro ciclo emocional;
- `v0.6.0`: acessibilidade, desempenho e robustez;
- `v0.7.0` ou `v1.0.0-prototype`: candidato final, após decisão.

## Regra para avançar

Um bloco só muda para concluído quando:

- critérios do prompt foram atendidos;
- diff foi revisado;
- testes automáticos passaram;
- testes manuais requeridos foram registrados;
- documentos estão atualizados;
- gate foi aprovado por Sam;
- commit foi feito depois da aprovação humana.

## Expansões pós-protótipo

1. uso pessoal contínuo e correção de atritos;
2. novos tipos de registro por módulos verticais;
3. tags, estatísticas e histórico melhores;
4. segunda sala e novo personagem;
5. reavaliação de persistência e possível SQLite;
6. capas e anexos;
7. conta e sincronização somente com proposta de produto concreta;
8. recursos públicos ou sociais por último.

Não colocar expansões dentro dos blocos atuais apenas porque parecem fáceis.
