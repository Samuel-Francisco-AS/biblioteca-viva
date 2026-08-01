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

- **versão:** `v0.2.0-alpha.1`, marco atual;
- **bloco concluído:** 6 — Biblioteca visual conectada (checkpoint físico conjunto pendente);
- **gate:** G3 aprovado por Sam em 2026-07-29;
- **implementação concluída:** Blocos 4, 5 e 6;
- **prompts concluídos:** Prompts 4 a 13;
- **prompt atual:** checkpoint físico conjunto de G5/G6 no Moto G06;
- **bloco atual:** Bloco 6 concluído; G5 aguarda backup e restauração em instalação limpa, G6 aguarda teste no Moto G06; Bloco 7 e Prompt 14 não iniciados;
- **APK:** diagnóstico interno validado no Moto G06 com Android 15; release assinado ainda não existe;
- **código:** implementação do Bloco 4 validada no navegador; G4 aguarda uso real prolongado.

- [x] Prompt 4 — Modelo de domínio de livros;
- [x] Prompt 5 — Portas e casos de uso;
- [x] Prompt 6 — Dexie, migrações e composição;
- [x] Prompt 7 — Cadastro e edição de livro, concluído e validado no navegador.
- [x] Prompt 8 — Coleção, detalhes, progresso, notas e citações, concluído e validado no navegador.
- [x] Prompt 9 — Busca, filtros e arquivo, concluído e validado no navegador.
- [x] Prompt 10 — Backup, restauração, recuperação e endurecimento, concluído e validado no navegador.
- [x] Prompt 11 — Host Phaser e ciclo de vida, concluído e validado no navegador.
- [x] Prompt 12 — Projeção visual e ponte de eventos, concluído e validado no navegador.
- [x] Prompt 13 — Cena visual e interação inicial, concluído e validado no navegador.

## Blocos e gates

| Estado | Bloco | Prompts | Resultado observável | Gate |
|---|---:|---:|---|---|
| `[x]` | 0 | — | contrato aprovado | G0 aprovado |
| `[x]` | 1 | 1–2 | fundação web navegável | G1 aprovado |
| `[x]` | 2 | 3 | APK debug instalado e validado no Android real | G2 aprovado |
| `[x]` | 3 | 4–6 | domínio, aplicação e persistência validados | G3 aprovado |
| `[~]` | 4 | 7–9 | implementação concluída; uso real prolongado pendente | G4 aberto |
| `[x]` | 5 | 10 | implementação e validação web concluídas; restauração física em instalação limpa pendente | G5 aberto |
| `[x]` | 6 | 11–13 | implementação e validação web concluídas; teste físico no Moto G06 pendente | G6 aberto |
| `[ ]` | 7 | 14–15 | identidade sonora e contextual | G7 |
| `[ ]` | 8 | 16 | primeiro ciclo emocional completo | G8 |
| `[ ]` | 9 | 17–18 | acessibilidade e desempenho mobile | G9 |
| `[ ]` | 10 | 19 | regressão, CI e manutenção | G10 |
| `[ ]` | 11 | — | APK release e portfólio | G11 |

## Marcos sugeridos

- `v0.1.0`: fundação, navegação e prova Android;
- `v0.2.0-alpha.1` (atual): domínio, aplicação e persistência validados;
- `v0.2.0`: CRUD de livros e ferramenta pessoal utilizável;
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
- gate foi aprovado por Sam.

O commit, quando autorizado, ocorre somente depois da aprovação humana e não é pré-condição para registrar o estado aprovado.

Excepcionalmente, o Bloco 5 pode iniciar com G4 aberto: a implementação e a validação funcional web do Bloco 4 foram concluídas, enquanto o uso real prolongado continua como pendência explícita e não bloqueadora. Isso não equivale a aprovar G4.

Excepcionalmente, Sam autorizou iniciar o Bloco 6 com G5 aberto. A restauração física de G5 e a prova física de G6 serão executadas juntas ao final do Bloco 6; isso não aprova nenhum dos dois gates.

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
