# W3 — Estantes, livros e continuidade do mundo

> **HISTÓRICO:** plano encerrado pelo WORLD RESET de 2026-09-08. Não orienta o produto atual.

> Estado documental: roteiro vigente. Atualizado em 2026-09-07 após recuperação do planejamento anterior.

## Situação

O reboot espacial definiu inicialmente W1 para mundo e câmera, W2 para objetos posicionáveis persistentes e W3 para separar desbloqueio de posicionamento. Depois de W1 e W2, a W3 foi detalhada em seis partes, de W3-A a W3-F.

Durante W3-A, a integração das paredes revelou que a estrutura precisava deixar de ser uma composição automática e virar um sistema modular construído pelo usuário. Por isso W3-A foi ampliada em W3-A1–A6 e, posteriormente, recebeu a rodada corretiva R0–R6. Esse desvio aprofundou W3-A; não cancelou W3-B–W3-F.

W3-A está encerrada. A próxima etapa planejada é W3-B.

## Sequência

### W3-B — Estantes reais

Integrar os assets reais de estante nas quatro orientações. Cada definição deve declarar orientação, pivô, footprint, depth e fallback. A estante usa o fluxo existente de seleção, movimento, rotação, validação e persistência de `PlacedObject`, no modo Organizar, sem misturar edição estrutural.

Antes da execução, confirmar dimensões dos assets, hit areas, posição visual sobre o piso, colisão, legibilidade mobile e alternativa React para ações que dependam de toque preciso.

### W3-C — Livros derivados dos registros

Projetar um livro visual para cada `BookEntry`. Os assets de livros são variantes reutilizáveis, não um limite para a quantidade de registros. O estilo deve ser determinístico e a orientação visual deve acompanhar a estante.

Fluxo de autoridade:

```text
BookEntry
→ projeção visual preparada pela aplicação
→ estante + slot
→ sprite no Phaser
```

Phaser não acessa Dexie nem recebe o registro completo. A projeção mínima deve identificar `bookId`, variante visual, `shelfInstanceId`, `slotIndex` e orientação.

Questões a fechar no contrato da etapa:

- capacidade fixa de cada estante;
- coordenadas dos slots nas quatro orientações;
- concessão ou colocação de estantes adicionais ao atingir a capacidade;
- possibilidade de reorganização manual dos livros;
- comportamento ao mover, guardar ou remover uma estante ocupada;
- densidade máxima antes de adotar agregação visual por desempenho.

### W3-D — Primeiro livro e desbloqueio

O primeiro livro cadastrado deve alcançar um marco, conceder permanentemente uma estante, posicioná-la inicialmente e apresentar o livro nela, acompanhado de reação audiovisual acessível.

A estante continua desbloqueada mesmo que o registro que originou o marco seja excluído. Depois do provisionamento inicial, ela se comporta como `PlacedObject` normal.

Esta etapa precisa reconciliar formalmente o posicionamento inicial com a regra vigente de que recompensas estruturais em geral não são colocadas automaticamente. A exceção deve ser explícita, idempotente e coberta por restauração/backup antes da implementação.

### W3-E — Livro ativo no mundo

Quando um livro passa para `in_progress`, sua projeção deixa o slot e aparece como livro aberto no mundo, vinculada por `bookId`. O objeto pode ser selecionado, movido e girado.

Abrir ou fechar altera somente a apresentação. Mover ou girar altera somente o layout. **Colocar na estante** é uma ação de domínio explícita, com confirmação equivalente a “Pausar e guardar?”.

A operação deve ser atômica:

```text
validar slot
→ alterar o registro para paused
→ registrar atividade
→ atribuir slot
→ remover a instância aberta
→ confirmar
→ atualizar a projeção
```

Se qualquer passo falhar, o livro permanece em andamento e fora da estante. A etapa exige assets de livro aberto nas orientações suportadas e fallback funcional.

### W3-F — Visualização e progresso

Ao selecionar um livro, Phaser emite somente a intenção tipada com `bookId`. React abre um painel com estética de livro antigo para título, autor, estado, avanço, notas, citações e ações de continuar, pausar ou guardar.

O painel pertence ao React para preservar edição de texto, teclado, rolagem, foco, escala de texto e tecnologias assistivas. O canvas não implementa formulários nem se torna autoridade do conteúdo.

## Invariantes da sequência

- dado real, projeção visual e posicionamento pessoal permanecem separados;
- Phaser apresenta projeções e emite intenções; aplicação e domínio decidem regras;
- desbloqueios são permanentes e monotônicos;
- estrutura é editada em Construir; estantes, livros e decoração, em Organizar;
- nenhum dado pessoal desnecessário entra na cena, logs ou evidências;
- estado persistente novo exige migração aditiva, backup compatível e rollback;
- cada etapa preserva funções essenciais pela interface React;
- automação técnica não substitui validação física no Moto G06.

## Gates transversais

A abertura inicial lenta e o engasgo do Resumo continuam problemas conhecidos. Eles devem ser medidos em todas as próximas etapas e tratados antes que qualquer regressão torne o aparelho inviável, mas não constituem uma etapa alternativa ao roteiro W3-B–W3-F.

TalkBack, foco, safe areas, redução de movimento, áudio percebido, procedência dos assets e desempenho físico acompanham cada fatia e continuam obrigatórios antes de release.
