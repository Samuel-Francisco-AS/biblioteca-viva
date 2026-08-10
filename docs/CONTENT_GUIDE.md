# Guia de conteúdo, diálogos e localização

## 1. Estado e objetivo

O Prompt 15 separa conteúdo contextual do motor. Diálogos, personagens, sala, decoração reservada e textos contextuais de interface são locais, versionáveis e validados. Não existe CMS, serviço remoto, IA ou interpretação de obras.

A implementação técnica não aprova Prompt 15 nem G7. A validação manual foi acumulada para o checkpoint integrado definido em D-034.

## 2. Estrutura real

```text
src/content/
├── locales/pt-BR.ts       # textos do locale inicial
├── localization.ts        # locale pedido → pt-BR → fallback final
├── prototypeContent.ts    # catálogo declarativo do protótipo
├── schemas.ts             # schemas Zod e referências cruzadas
├── content.test.ts        # integridade, falhas e localização
└── index.ts

src/application/dialogue.ts
├── contratos e porta
├── DialogueSelector puro
└── DialogueService

src/infrastructure/dialogue/
└── histórico mínimo na tabela settings existente
```

`PROTOTYPE_CONTENT` é validado ao importar o módulo. Conteúdo inválido falha cedo antes de compor a aplicação.

## 3. IDs e entidades

IDs são estáveis, minúsculos e hierárquicos. Revisar texto não altera ID.

- diálogos: `dialogue.librarian.first-book`;
- personagens: `character.librarian`, `character.creature`;
- sala: `room.main`;
- decoração reservada: `decoration.reading-lamp`;
- interface contextual: `interface.dialogue.close`;
- eventos: `librarian.interaction`, `creature.interaction`, `book.first-completed`.

O catálogo valida IDs ausentes/duplicados, locales, chaves de texto, fallbacks, personagens e referências de sala/decoração. A luminária é somente definição reservada para uso futuro; não existe desbloqueio no Prompt 15.

## 4. Localização

O locale inicial e padrão é `pt-BR`. `ContentLocalizer` aplica uma cadeia determinística:

1. procurar a chave no locale solicitado;
2. usar a chave em `pt-BR` quando o locale não existir ou estiver incompleto;
3. usar `interface.content.missing`;
4. usar a frase final interna “Conteúdo indisponível.” somente se até o catálogo padrão estiver danificado.

Não há outro idioma, tradução automática, concatenação de frases ou biblioteca adicional de internacionalização. Um idioma futuro adiciona um bundle validado sem alterar o selector.

## 5. Voz da bibliotecária

A bibliotecária é acolhedora, observadora, discretamente mágica, concisa e não julgadora. Ela reconhece fatos existentes sem avaliar o usuário.

Evitar:

- culpa por ausência ou abandono;
- cobrança, streak, urgência ou produtividade;
- elogio corporativo e entusiasmo exagerado;
- infantilização;
- repetição excessiva de magia ou destino;
- interpretação do livro a partir de título, autor, páginas ou progresso.

Aceitável:

> “Há uma leitura em curso. Ela pode seguir no ritmo que couber.”

Inaceitável:

> “Você ficou cinco dias sem ler; continue assim para não perder sua sequência.”

## 6. Limite epistemológico

O sistema conhece somente fatos estruturados: quantidades, status, progresso, existência de conclusão e intervalo desde a visita anterior. Ele não conhece personagens, gênero, dificuldade, qualidade, acontecimentos ou emoções de uma obra.

Título, autor, nota e citação não cruzam a seleção nem entram no histórico. Não são usados como prompt, não são enviados para serviço e não aparecem em logs de diálogo.

## 7. Contextos atuais

| Contexto | ID principal | Regra |
|---|---|---|
| Biblioteca vazia | `dialogue.librarian.empty` | `totalBooks = 0`, cooldown de 6 h |
| Primeiro livro | `dialogue.librarian.first-book` | `totalBooks = 1`, `once` |
| Livro em andamento | `dialogue.librarian.in-progress` | `inProgressBooks ≥ 1`, cooldown de 6 h |
| Primeira conclusão | `dialogue.librarian.first-completion` | `completedBooks ≥ 1`, `once` |
| Retorno após alguns dias | `dialogue.librarian.return-after-days` | `daysSinceLastVisit ≥ 3`, cooldown de 72 h |
| Toque na bibliotecária | três falas gerais | rotação por uso mais antigo e cooldown curto |
| Toque na criatura | três respostas curtas | rotação por uso mais antigo e cooldown curto |

`dialogue.librarian.first-completion` aceita também o evento explícito `book.first-completed`. O Prompt 16 usa esse contrato após o commit do primeiro marco de conclusão; a fala continua selecionada pelo serviço de diálogos, sem texto especial no componente.

## 8. DialogueSelector

O selector recebe catálogo, evento, fatos preparados, histórico e instante controlado. Ele não acessa React, Phaser, Dexie, Capacitor, DOM, Web Audio ou relógio de plataforma.

Política:

1. filtrar pelo evento e por todas as condições;
2. excluir IDs `once` já registrados;
3. excluir falas ainda em cooldown;
4. ordenar por prioridade decrescente;
5. no empate, escolher a menos recentemente exibida;
6. persistindo o empate, escolher o menor ID lexicográfico;
7. sem candidato, usar o fallback explícito do evento.

Uma fala `once` é reservada em memória antes da próxima seleção serializada. Falas repetíveis voltam após cooldown. Toques rápidos percorrem alternativas disponíveis e finalmente caem no fallback, em vez de repetir incessantemente uma fala especial.

## 9. Histórico e privacidade

`dialogue.history.v1` usa a tabela `settings` v2 já existente. Não houve mudança de schema nem migração. O valor contém somente:

- versão do formato;
- IDs `once` já exibidos;
- último instante por ID necessário a cooldown/rotação;
- último instante de entrada na Biblioteca para calcular retorno.

Não persiste cópia de fala, título, autor, progresso, nota, citação ou sequência extensa de interações. Settings já integra backup/restauração. Valor externo é validado por Zod; falha de leitura usa histórico vazio e falha de gravação preserva a sessão, ambas com códigos sanitizados.

## 10. Integração React–Phaser e áudio

Phaser continua emitindo apenas `LibrarianSelected` e `CreatureSelected`. React envia a intenção sonora já existente e solicita o texto ao `DialoguePort`. O painel React atual recebe `LocalizedDialogue`; não existe segundo modal ou texto de conteúdo na cena.

O contexto enviado contém somente `totalBooks`, `inProgressBooks` e `completedBooks`. `DialogueService` calcula dias desde a última visita e possui histórico/seleção. Áudio e diálogo coexistem, mas não dependem um do outro.

## 11. Como adicionar conteúdo

### Nova fala em contexto existente

1. adicionar uma chave e texto em `locales/pt-BR.ts`;
2. adicionar a definição em `prototypeContent.ts` com ID, personagem, evento, condições, prioridade, `once` e cooldown;
3. executar os testes de conteúdo.

Nenhuma alteração em selector, serviço, painel, Phaser ou Dexie é necessária.

### Novo contexto

1. confirmar que o fato é realmente conhecido e não expõe conteúdo pessoal;
2. acrescentar evento/fato ao contrato somente se os atuais não expressarem o caso;
3. criar fallback explícito;
4. acrescentar definições e testes de seleção;
5. integrar a intenção na aplicação/React, nunca na cena Phaser.

### Novo locale futuro

Adicionar um bundle com locale BCP 47 válido. Chaves ausentes continuarão usando `pt-BR`. Não copiar tradução automática sem revisão humana.

## 12. Revisão obrigatória

- schema e referências válidos;
- ID estável;
- tom não punitivo;
- limite epistemológico respeitado;
- texto curto e claro em mobile;
- repetição aceitável;
- fallback presente;
- ausência de conteúdo pessoal no histórico/log;
- painel e alternativa textual acessíveis;
- licença registrada se algum conteúdo deixar de ser autoria interna.

## 13. Marcos e recompensa do protótipo

Marcos, recompensas e decorações são conteúdo declarativo validado cedo em `prototypeContent.ts`. Os IDs estáveis são `milestone.first-book`, `milestone.first-note`, `milestone.first-quote`, `milestone.first-completed-book`, `reward.first-completion-reading-lamp` e `decoration.reading-lamp`. Condições referenciam somente eventos e fatos estruturados; versões de regra são inteiros positivos. Referências duplicadas, inexistentes ou incompatíveis falham claramente no carregamento de desenvolvimento.

Somente a primeira conclusão concede uma recompensa: a luminária de leitura procedural. Os demais marcos registram história mínima, sem XP, moeda, ranking, badge ou texto pessoal. React e Phaser consomem resultados prontos e não repetem essas regras.
