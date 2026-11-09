# BF-5.6E — Duelo Arcano: implementação candidata

Autorização específica do proprietário em 09/11/2026: execução contínua E1–E4, commits/push/APK e uma PR draft. Sem merge, encerramento BF-5.6 ou F/G/BF-6. Base `6babce2`, merge D `b3db5d87ce7e327e2ab88420681c4feaf99b1d6e` confirmado ancestral. Branch `feat/bf-5-6e-arcanario-duelo-arcano`; checkout inicial limpo.

## E1 — regulamento, motor e persistência

[ADR-029 / regulamento v1](decisions/ADR-029-duelo-arcano-regulamento.md) documenta preparação, zonas, mão, energia, ataques, Guardião/Ímpeto, efeitos, alvos, fadiga, resultados, abandono e limites. Domínio puro em `src/domain/duel`; aplicação em `src/application/duels.ts`; portas e tabelas globais reutilizadas. Transição imutável, comandos idempotentes por rejeição de ID/revisão, seed/PRNG, snapshots e replay. Atualização visual só recebe estado depois do commit.

Dexie v19 aditiva mantém tabelas/índices v18 e placeholders históricos. Backup v11 mantém formatos originais v6–v10, SHA-256, 10 MiB e rollback. Teste em base descartável valida restauração e falha após escrita. Sem downgrade ou limpeza de dados pessoais.

Validação E1: 12 testes dirigidos PASS (motor + Dexie); TypeScript PASS. Primeira execução encontrou expectativa incorreta da mensagem de falha simulada: a aplicação mascara erros de armazenamento, conforme contrato existente. Asserção corrigida para exigir código/contexto de persistência e rollback integral; não houve enfraquecimento do rollback. Checkpoints posteriores e rodada final ainda em execução.

## E2 — coleção, decks e arte

48 identidades oficiais originais: 10 por afinidade + 8 neutras; 24 criaturas, 14 feitiços, 10 artefatos. Sem raridade/pacotes pagos/desbloqueios. Quatro decks de 24 cartas (12 identidades × 2), cada qual com dez da tradição e duas neutras distintas. Cartas e baralhos oficiais são imutáveis; decks pessoais mantêm associações globais e contagens próprias. Construtor possui formatos, afinidade, curva de custos, cópias, inspeção e rascunho local. Salvar valida composição integral; rascunho pode permanecer incompleto.

48 gravuras vetoriais individuais: anatomias de criaturas, objetos arcanos e composições mágicas distinguíveis, cinco paletas, hachuras e cenários. Molduras por afinidade e tratamentos por tipo, custo/atributos/texto fora da ilustração. SVGs públicos totalizam 711.545 bytes; carregamento lazy/async, sem RAF ou WebGL novo. [Fontes e procedência](../assets/duel/source/README.md), manifesto de SHA-256 e script reproduzível incluídos. Inspeção de contato local feita; aprovação artística humana permanece pendente. Cartas autorais podem escolher essas artes como tema identificado; upload de arte TCG não é oferecido nesta versão.

Catálogo instala idempotentemente ao entrar no salão; instalação detecta divergência em vez de sobrescrever. Backup omite decks iniciais e conteúdo oficial sem referência pessoal; preserva cadeias compartilhadas necessárias. Restore em base descartável seguido da reinstalação do catálogo foi testado.

Validação E2: 7 testes dirigidos PASS (catálogo/arte/decks + Dexie), verificação exata das 48 artes PASS; 15 testes acumulados antes do teste adicional de reinstalação PASS. TypeScript anterior PASS; rodada consolidada posterior incluirá o construtor.
