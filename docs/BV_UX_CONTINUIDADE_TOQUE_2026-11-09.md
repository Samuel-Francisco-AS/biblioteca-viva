# BV-UXC — Continuidade entre toque e ação

**Candidata de 09/11/2026 — PR draft separada, não integrada.**

## Intenção e decisão do proprietário

O objetivo não é simplesmente reduzir a latência absoluta ou diminuir a arte para o Moto G06. A sensação de tocar, selecionar, abrir diálogo ou atravessar um portal deve ser **um ato contínuo**, mesmo quando raycast, React, persistência ou inicialização de WebGL ainda precisem ocorrer. É legítimo usar uma transição de apresentação para sustentar a intenção do gesto. **Não mascarar erros funcionais, não fabricar um spinner longo, não impor espera fixa.**

## Implementação candidata

1. **Contato no Canvas da Biblioteca:** o próprio contêiner existente apresenta uma marca circular discreta via CSS no `pointerdown`, antes do raycast. Confirmação expande/dissolve, pan/pinch/cancelamento não deixam uma seleção fantasma. Sem novo Canvas, textura, luz, RAF próprio ou DOM por clique.
2. **Personagens/quests:** o painel de conversa passa a se revelar pelo deslocamento/opacidade em aproximadamente 205 ms. Conteúdo segue animado em 120 ms; título, foco, Adiar e semântica da sessão continuam presentes no commit.
3. **Dock inferior:** remoção do pré-carregamento no toque; ele permanece possível com hover de mouse. O toque confirma a intenção com o medalhão pendente e o véu visual antes do compromisso de rota. Navegação ocorre após uma fronteira de apresentação entre dois `requestAnimationFrame`, **não depois de um timeout cronometrado**. Links continuam normais para modificadores/nova aba. Alterar a intenção no mesmo intervalo cancela a anterior.
4. **Portal orbital do Duelo Arcano:** seleção preservada, véu imediato e navegação no mesmo contrato de frame. O agendamento é cancelado se a Biblioteca for desativada/desmontada; nenhum trabalho de gameplay/TCG/IndexedDB foi alterado.
5. **Links internos comuns:** um véu fixo sem captura de ponteiro/foco conecta a saída e a entrada; `App` reconhece mudanças de rota e remove o estado quando termina a animação. O conteúdo de destino continua livre para carregar em seu próprio tempo.
6. **Acessibilidade/lifecycle:** `prefers-reduced-motion` e preferência interna desativam animações e não esperam os frames de apresentação; ARIA, foco existente, botão Voltar, rotas e residência da Biblioteca preservados.

## Limites do que foi confirmado

- **Confirmado:** inspeção do código da `main`, preparação das modificações em branch separada, commit remoto e adição de testes de interface e de gesto. A mudança é isolada em apresentação/navegação, sem alteração de schema, arte de personagens, regras de quest ou motor do duelo.
- **Ainda não confirmado:** execução dos novos testes, `typecheck`, lint, build, E2E e instalação física. Ações de CI não devem ser solicitadas por causa da cota esgotada; commits da candidata usam `[skip ci]`. A existência dos testes **não equivale a PASS**. Nenhum ganho de FPS, redução real de long tasks ou desaparecimento de travamentos pode ser declarado sem evidência.
- **Dívida conhecida preservada:** picking/skinning e highlight 3D ainda possuem custo síncrono; esta rodada sustenta a continuidade visual, mas não reivindica eliminação definitiva do custo. Problemas de timeouts orbitais, CI e BF-5.6G continuam independentes.

## Gate físico proposto — Moto G06

Repetir o toque em cada um dos quatro habitantes e a abertura/fechamento de diálogos (incluindo toques consecutivos); o primeiro sinal deve aparecer antes do painel, sem quadro congelado aparente ou diálogo duplicado. Alternar Biblioteca ↔ Coleção/Arquivo/Ajustes pelo dock, repetindo rapidamente e usando Voltar. Entrar pelo grimório/lua orbital no Arcanário, sair e retornar; conferir se o cenário residente volta corretamente e se o duelo não perde estado. Exercitar pan/pinch, toque cancelado, retrato/paisagem, segundo plano/retorno, toque no vazio e redução de movimento. Registrar **suavidade percebida, qualquer engasgo residual e regressões**, separadamente dos testes automatizados.

**Critério de aceite:** sensação contínua no Moto G06, sem toques perdidos, gestos fantasmas, sobreposição persistente, bloqueio de interface ou quebra de dados. Proprietário decide aceitação/merge somente após seu gate; sem integração automática da PR e sem declarar encerramento de BF-5.6G.
