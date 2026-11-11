# BF-5.7A — Botões de cristal: primeira candidata

**Escopo:** alteração visual e tátil global de controles na PR draft da BF-5.7A. Não inclui reescrita de navegação, engine, banco, backup ou UX de tela inteira.

## Intenção artística
- Pequenos botões analógicos talhados em cristal: facetas diagonais discretas, estrias estáticas, bordas iluminadas, base escura e sombra de contato.
- Preservar o vocabulário do Códice Iluminado: rosa ameixa (primário), violeta escuro (secundário), rubi (perigo), ametista (Arcanário), lápis-lazúli e ouro (arena), quartzo claro em controles dos fólios; medallhões do dock como cristais encaixados.
- Não redesenhar cards de registros, imagens das cartas, campos de texto ou o próprio palco 3D como pequenos botões. Eles conservam seu material e resposta próprios.

## Contrato de interação
- Pointerdown continua fazendo o reconhecimento imediato existente da BV-UXC. Depois do clique, um eco de pressão dura 190 ms para não desaparecer entre pointerup e a próxima pintura.
- Para Links internos e dock que acionam a cortina R6, iniciar a cobertura **120 ms depois** de confirmar um clique por ponteiro; apenas então usar o fluxo de saída opaca, trabalho adiado, prontidão e revelação já aprovado. Nenhuma ação de rota ocorre atrás de uma cobertura ainda transparente.
- Ativação por teclado/assistiva, aba oculta e movimento reduzido **não** têm esse atraso adicional; preservam acesso direto e o contrato de redução de movimento.
- Segunda intenção cancela a etapa anterior quando ainda está aguardando; navegação externa cancela a etapa pendente. Não adiar ações normais dos formulários nem interceptar botões com lógica própria.
- Nada de JavaScript por frame, partículas, SVG dinâmico, filtros ou imagens novas.

## Áreas cobertas
- Ações tradicionais e links com classe de botão, controles de formulários, botões de texto e categoria, seletores e calendário inclusive em dialog nativo portalled, navegação e áreas do Arcanário, arena e controles de exploração/quests, teclas circulares do dock.
- Cards inteiros (livros, cartas TCG, seletor de tipos) conservam a arte atual; o selo do seletor de tipos ganha depressão própria.

## Código e rastreio
- styles-crystal.css: camada terminal de materiais e pressão.
- app/crystalPress.ts: eco visual e agendamento cancelável de navegação por toque.
- App.tsx / PrimaryDock.tsx: integração sem alterar o ciclo de vida da cortina.
- Testes dirigidos de eco, prelude, cancelamento, teclado e redução de movimento.

## Validação e gate pendente
**Ainda sem evidência de teste local, CI, E2E, APK ou gate físico nesta operação remota.** Não classificar como PASS o que não rodou. Ações do GitHub foram edição estática e revisão de diff.

Rodada sugerida no Moto G06 (retrato e paisagem): (1) Coleção/Arquivo/Resumo/Ajustes via dock e botão Buscar/Novo registro; (2) botão primário, secundário, perigo, desabilitado e alternância de filtros; (3) Folio Estudos e Entretenimento, Notas/Citações, temporizador e salvar; (4) seletores/modal/calendário e Back; (5) Arcanário Portal/Acervo/Oficina/Provações e duelo em tela única; (6) quests, navegação rápida, toque duplo, scroll em cards; (7) movimento reduzido e alto contraste. Comparar sensação de pressione → cortina sem piscadas e observar custo de pintura no dispositivo.

**Integração à main bloqueada** até revisão e autorização explícita do proprietário, com reparos de regressões se houver.
