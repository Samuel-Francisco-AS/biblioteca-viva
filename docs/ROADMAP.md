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
- **blocos concluídos:** 5 — Backup, restauração e recuperação; 6 — Biblioteca visual conectada;
- **gates:** G5 e G6 aprovados por Sam em 2026-08-06; G4 permanece aberto em paralelo;
- **implementação concluída:** Blocos 4, 5 e 6;
- **prompts tecnicamente implementados:** Prompts 4 a 19; Prompts 14 a 19 mantêm validações humanas acumuladas e não estão aprovados;
- **fase atual:** refinamento pós-protótipo orientado pela primeira rodada integrada no Moto G06;
- **próximo trabalho:** R1 — Coerência funcional; G4 e G7–G10 continuam abertos e G11 não foi iniciado;
- **bloco atual:** Bloco 10 tecnicamente implementado; G10 e gates humanos anteriores permanecem abertos;
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
- [~] Prompt 14 — Arquitetura de áudio e primeira paisagem sonora; tecnicamente implementado após correção, validação humana acumulada.
- [~] Prompt 15 — Conteúdo externo, localização e diálogos básicos; tecnicamente implementado, validação humana acumulada.
- [~] Prompt 16 — Motor de marcos e primeiro desbloqueio; tecnicamente implementado, validação humana acumulada.
- [~] Prompt 17 — Acessibilidade e preferências de experiência; tecnicamente implementado, validação humana acumulada.
- [~] Prompt 18 — Perfil de desempenho e estabilidade mobile; tecnicamente implementado, validação humana acumulada.
- [~] Prompt 19 — Suíte crítica, CI e manutenção; tecnicamente implementado, validação humana acumulada.

## Blocos e gates

| Estado | Bloco | Prompts | Resultado observável | Gate |
|---|---:|---:|---|---|
| `[x]` | 0 | — | contrato aprovado | G0 aprovado |
| `[x]` | 1 | 1–2 | fundação web navegável | G1 aprovado |
| `[x]` | 2 | 3 | APK debug instalado e validado no Android real | G2 aprovado |
| `[x]` | 3 | 4–6 | domínio, aplicação e persistência validados | G3 aprovado |
| `[~]` | 4 | 7–9 | implementação concluída; uso real prolongado pendente | G4 aberto |
| `[x]` | 5 | 10 | backup externo e restauração física em armazenamento limpo validados | G5 aprovado em 2026-08-06 |
| `[x]` | 6 | 11–13 | biblioteca visual e experiência física Android validadas | G6 aprovado em 2026-08-06 |
| `[~]` | 7 | 14–15 | áudio e diálogos implementados tecnicamente; validação integrada acumulada | G7 aberto |
| `[~]` | 8 | 16 | implementação técnica do primeiro ciclo concluída; validação integrada pendente | G8 aberto |
| `[~]` | 9 | 17–18 | acessibilidade e desempenho implementados; validação integrada pendente | G9 aberto |
| `[~]` | 10 | 19 | regressão, E2E, CI e manutenção implementados; checkpoint integrado pendente | G10 aberto |
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

No modo acelerado aprovado em 2026-08-10, cada prompt pode receber um commit de checkpoint técnico após verificações automáticas e documentação, sem representar aprovação humana ou de gate. Validações de G4 e G7–G10 ficam acumuladas para checkpoint integrado; riscos de dados, migração destrutiva, backup/restauração, exclusão ou abertura nativa continuam exigindo validação própria.

Excepcionalmente, o Bloco 5 pode iniciar com G4 aberto: a implementação e a validação funcional web do Bloco 4 foram concluídas, enquanto o uso real prolongado continua como pendência explícita e não bloqueadora. Isso não equivale a aprovar G4.

Excepcionalmente, Sam autorizou iniciar o Bloco 6 com G5 aberto. A restauração física de G5 e a prova física de G6 foram então planejadas para o mesmo checkpoint ao final do Bloco 6, sem aprovação antecipada; ambas foram concluídas e seus gates aprovados em 2026-08-06.

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

## Fase de refinamento pós-protótipo

Esta fase é posterior e separada dos Blocos 0–11 e dos Prompts 1–19 históricos. O plano operacional completo está em `REFINEMENT_PLAN.md`; não existe “Prompt 20” definido.

- `[ ]` **R1 — Coerência funcional:** automatizar início/conclusão pelo progresso, apresentar barra e páginas restantes, rever estante pequena, tornar backup de segurança opcional conforme o banco e investigar o delay sonoro;
- `[ ]` **R2 — Utilidade de notas/citações e áudio:** editar, excluir e compartilhar anotações; adicionar playlist declarativa e substituição modular de áudio;
- `[ ]` **R3 — UX/Layout v2:** redesign extenso, tema escuro coerente e Biblioteca visual protagonista, preservando acessibilidade;
- `[ ]` **checkpoint integrado Android:** validar regressões, novas regras, conteúdo, áudio, backup, marco, layout, acessibilidade, lifecycle e desempenho;
- `[ ]` **preparação posterior para G11:** somente após avaliar explicitamente os gates ainda abertos.
