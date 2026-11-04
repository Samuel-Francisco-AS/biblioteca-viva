# BF-5R8 — Entrada progressiva e continuidade entre páginas

Data: 2026-11-04. Branch `feat/bf-5-uiux-global-rework`, PR #20 draft. Referência inicial: `f48b45fec16dab6351896af71873031cd5003df2`.

## Motivação e limites

No Moto G06, o proprietário aprovou a direção artística da R6 e marcou PASS para pan/pinch e rolagem da Coleção na R7. Abertura, botões/vibração, troca de abas e RPG permaneceram parciais, com piora no início da sessão e melhora depois de navegar. Esta intervenção preserva cores, ornamentos, câmera, mundo residente, Dexie v9, backup v6, dados e narrativa. Não declara resolução física sem teste.

## Intervenções

- **Capa de entrada real, sem duração fictícia:** HTML/CSS mínimo aparece antes do bundle e do banco. Enquanto o Dexie abre, informa preparação das memórias; quando React monta, informa despertar do santuário. A capa só desaparece após o mundo declarar `ready`/`failed`, após um erro controlado da consulta inicial ou após uma rota secundária montar. Dois RAFs oferecem oportunidade de apresentação do destino; uma transição curta de opacidade não bloqueia cliques. Não há percentagens inventadas.
- **Code splitting de rotas:** Coleção, Arquivo, Resumo, Ajustes, criação, edição e detalhes saem dos imports diretos do shell. `Suspense` oferece uma indicação temática apenas durante carregamento real do chunk. Links do dock aquecem o módulo ao foco/hover e, em toque, no início do gesto. Após a primeira entrada completa, a Coleção é pré-aquecida em tempo ocioso, sem competir deliberadamente com a primeira montagem WebGL.
- **Coleção com primeiro quadro reutilizável:** um `WeakMap` por instância da aplicação conserva o último snapshot apenas para apresentação inicial ao retornar. Toda montagem reconsulta registros/etiquetas em paralelo e substitui a cópia por dados canônicos; não intercepta escritas, importação ou transações, nem altera os tipos de domínio. Dados antigos podem aparecer até a revalidação; nenhuma operação é aplicada ao cache.
- **Haptic na liberação válida:** para toque primário sem scroll/cancelamento, o pulso nativo é solicitado no `pointerup`, antes do `click`; um registro do controle suprime pulso duplicado no click. Navegação por teclado preserva haptic no click; a ação funcional continua somente no click. É uma mudança na posição da solicitação, não comprovação de latência física.
- **Passagem narrativa:** o painel RPG já permanece montado junto ao mundo residente e assina `NarrativeSession`; não foi introduzido remount nem um overlay pesado adicional. O ganho esperado depende principalmente da menor contenção de chunks e da resposta imediata ao controle.

## Segurança e pontos a validar

A capa não faz migrações, não consulta conteúdo privado nem interfere nos contratos de persistência. O cache de Coleção deve ser avaliado em navegação, edição, exclusão e restauração de backup; enquanto revalida, pode exibir brevemente o último snapshot. A nova divisão de módulos pode afetar testes que presumem renderização síncrona de rotas secundárias; estes devem aguardar a conclusão do carregamento real sem apagar asserts.

## Gates pendentes

Esta edição foi aplicada remotamente via GitHub; não houve runtime Node/Gradle nem instalação Android disponível nesta sessão. O commit e a CI remota devem ser conferidos antes de afirmar build/teste aprovado. E2E amplo permanece com dívidas anteriores na PR. Não há gate físico R8, TalkBack nem certificação de fluidez.

## Roteiro Moto G06

1. Preservar backup real, atualizar APK debug por instalação sobreposta e não limpar dados.
2. Abrir a aplicação a frio: confirmar capa antes do conteúdo, transição sem tela vazia e mundo pronto ao desaparecer.
3. Abrir Coleção pela primeira vez e retornar: observar preparação só se o código ainda estiver carregando e exibição rápida da lista.
4. Alterar/ excluir um registro fictício, voltar à Coleção e confirmar revalidação; repetir depois de backup fictício em contexto descartável.
5. Alternar as cinco abas, entrar e sair de detalhes, criar/editar seis tipos, verificar estado do teclado e Back Android.
6. Tocar rapidamente botões/dock, converter toque em scroll, cancelar gestos, usar teclado/acessibilidade e avaliar vibração sem duplicação.
7. Abrir/fechar quests e diário, pausar/retomar app, girar tela, observar jank e ausência de perda de estado.
8. Registrar separadamente atraso da capa, primeira navegação, segunda navegação, resposta ao toque e pulso Android.

**Estado:** R8 candidata remota, BF-5 e PR #20 permanecem abertas e draft; sem merge.
