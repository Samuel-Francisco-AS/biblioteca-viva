# BF-5R2 — Continuidade visual e resposta tátil (2026-11-03)

**Escopo:** correção dirigida a partir das capturas reais do Moto G06 da BF-5R1. O usuário reconheceu uma melhora, mas apontou a “chapa” escura no rodapé do mundo, botões/formulários ainda quadrados, ausência de resposta satisfatória ao toque e travamentos/abruptidade nas transições entre abas.

## Evidências e causas identificadas no código

- O canvas **já ocupava o viewport geometricamente**, mas `library-scene-vignette` aplicava uma **camada gráfica em tela inteira** com gradiente escuro inferior. A aparência de “chapa transparente” era plausivelmente causada por esse gradiente, não por uma borda do canvas.
- `arc-page-enter` animava `filter: blur(...)` sobre **páginas inteiras**, e vários painéis utilizavam `backdrop-filter: blur(...)`. Essas operações podem induzir repinturas caras em WebView Android. **Não foi medido qual delas causou a travada física**; esta é uma hipótese técnica com base nas implementações.
- A linha de ações da Coleção não quebrava de forma apropriada em largura estreita; inputs e CTAs mantinham geometria genérica. Feedback `:active` podia durar pouco demais para ser percebido.
- A montagem e desmontagem do renderer Three.js ainda existe na navegação — **a correção desta etapa não constitui prova de eliminação do custo de reinicialização**.

## Implementação

1. **Mundo sem chapa:** o sombreamento é limitado ao topo do viewport, preservando a cena até a borda inferior. O WorldHost permanece em 100dvh e o dock não altera a dimensão da cena.
2. **Transições curtas e leves:** substituição de blur de tela por opacidade + deslocamento pequeno de entrada, duração de 190ms; efeito de toque no destino ativo sem animar o mundo 3D inteiro.
3. **Menos superfícies filtradas:** remoção de `backdrop-filter` do dock, bússola, botões RPG e painel acessível; superfícies opacas com aparência arcana mantida. Sigilo continua animado com transform/opacity, sem filtro animado.
4. **Resposta tátil:** tratamento delegado de `pointerdown` no shell marca controle pressionado por ~230ms; CSS mostra mudança de profundidade, brilho, borda e escala. Não atrasa navegação nem altera a execução de comandos.
5. **Ergonomia global:** estados visuais de botões, cards, filtros, campos, painéis, ações destrutivas; ações da Coleção quebram em grade no retrato estreito, e botões perigosos nas fichas podem ganhar linha própria.

## Validação e ressalvas

- Adicionado E2E para geometria do canvas, ausência de chapa inferior, transição sem filtro blur e sinal visual ao toque.
- **Apenas estados realmente verificados pela CI podem ser anunciados como PASS.** Não houve validação física desta revisão nem medições temporais/frames no Moto G06.
- Preservados dados, IDs, persistência, backup, runtime, narrativa e fallback; sem dependências novas. A BF-5 e PR draft #20 seguem abertas e não aprovadas artisticamente.
- Roteiro físico: observar o rodapé do mundo com dock sobreposto; alternar Biblioteca ↔ Coleção 5 vezes e demais abas; verificar sem pausas visíveis, toques/filtragem, teclado e rotação; registrar vídeo breve se ainda houver engasgos. Se o lag continuar, investigar instrumentação de startup/dispose do ThreeWorldRuntime e montagem das outras rotas.
