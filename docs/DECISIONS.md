# Registro de decisões

Decisões não são apagadas quando substituídas. Altere o status para `substituída` e referencie a decisão nova.

## Formato

- **ID**;
- **data**;
- **status:** proposta, aceita, substituída ou rejeitada;
- **contexto**;
- **decisão**;
- **consequências**.

---

## D-001 — Aplicativo pessoal com qualidade de portfólio

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** não existe perspectiva concreta de produto comercial agora, mas a base deve permitir evolução futura.

**Decisão:** construir um aplicativo real de uso pessoal, visual e sonoro, documentado como portfólio, sem backend no protótipo.

**Consequências:** confiabilidade e UX prática têm o mesmo peso da apresentação; escala comercial não justifica complexidade antecipada.

## D-002 — Stack híbrida web-first

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** TypeScript estrito, React, Vite, Phaser 3 e Capacitor.

**Consequências:** React cuida do app; Phaser da biblioteca; uma base gera web e Android.

## D-003 — Modular monolith em um repositório e pacote

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** um repositório e um pacote no protótipo, com camadas lógicas.

**Consequências:** sem monorepo, microserviços ou pacotes internos antes de necessidade real.

## D-004 — Phaser como view especializada

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** Phaser recebe projeção pronta, renderiza e emite interações tipadas. Não acessa banco nem decide marcos.

**Consequências:** coleção continua funcional sem cena; React e Phaser podem ser testados separadamente.

## D-005 — Persistência inicial com Dexie atrás de portas

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** Dexie/IndexedDB no protótipo; repositórios isolam tecnologia.

**Consequências:** backup e migrações são obrigatórios; SQLite será avaliado por gatilhos verificáveis.

## D-006 — Capacitor e APK cedo

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** criar APK debug no Bloco 2, antes do domínio completo.

**Consequências:** riscos de WebView, Android Studio, safe areas e ciclo de vida aparecem cedo.

## D-007 — Som como serviço desacoplado

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** React e Phaser emitem intenções; um `AudioPort` controla reprodução e preferências.

**Consequências:** sem chamadas de áudio espalhadas ou duplicadas.

## D-008 — Conteúdo orientado a dados

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** diálogos, marcos, recompensas, salas e assets usam IDs, schemas, manifests e fallback.

**Consequências:** adicionar conteúdo não exige alterar motor central.

## D-009 — Somente livros no protótipo

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** a união discriminada prevê expansão, mas apenas `BookEntry` será implementado até G11.

**Consequências:** filmes, séries e estudos permanecem no backlog pós-protótipo.

## D-010 — Progresso sem punição

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** sem streak obrigatória, degradação, culpa ou perda por ausência.

**Consequências:** retorno é acolhedor; abandono é status válido; recompensas refletem ações sem coerção.

## D-011 — Backup antes do polimento final

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** exportação, restauração e migrações entram no Bloco 5, antes da sala visual completa.

**Consequências:** dados têm prioridade sobre acabamento.

## D-012 — Decisões aprovadas no Gate G0

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o encerramento do Gate G0 exigia consolidar as definições humanas que orientam o protótipo antes da fundação técnica.

**Decisão:** manter o nome provisório “Biblioteca Viva”; aprovar o primeiro ciclo emocional de `PRODUCT.md`, seus critérios de sucesso e o conjunto documental inicial; adotar uma biblioteca em visão superior, com referências gerais em Pokémon FireRed e Stardew Valley, sem copiar assets ou identidade dessas obras; usar retrato como orientação principal; adotar o Moto G06 como referência primária de testes, sem torná-lo alvo exclusivo; e incluir música ambiente discreta, som de interface, confirmação de cadastro, reação da estante e conclusão ou desbloqueio, com controles separados para música e efeitos.

**Consequências:** o Gate G0 está aprovado e o Bloco 1 pode começar pelo Prompt 1. A interface deve usar layout responsivo, respeitar safe areas e ser testada em diferentes dimensões, proporções e densidades de tela. O aplicativo deve permanecer compatível com diferentes celulares Android; o Moto G06 é um dispositivo principal de validação, não uma restrição de compatibilidade.

Use `templates/ADR_TEMPLATE.md` para novas decisões.
