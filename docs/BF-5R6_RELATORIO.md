# BF-5R6 — O Códice Iluminado (reconstrução de identidade visual)

**Data:** 2026-11-04  
**Estado:** código implementado diretamente no repositório remoto na branch `feat/bf-5-uiux-global-rework`. PR #20 **draft**. Sem merge, sem homologação artística, sem alegação de teste físico.  
**Gatilho:** após validar a BF-5R5 no Moto G06, o proprietário rejeitou explicitamente a estética de folhas de cards verde-escuros e botões planos, a aparência sintética de formulários e a falta de vibração ao toque.

## O que muda efetivamente

### Direção artística: códice iluminado

Em vez de mais uma mudança de cor em cards, a intervenção cria uma gramática completa de **fólio, lombada, tinta, veludo noturno, cobre e gravação manual**. A paleta principal abandona o verde-petróleo/dourado plano por **ameixa noturna, marfim e pergaminho aquecido, cera granada e acentos espectrais pontuais**. Superfícies de leitura são claras com tinta escura, diferentes do fundo de navegação.

Arquivos originais locais:
- `public/ornaments/folio-corners.svg` — filigrana e cantos de página.
- `public/ornaments/illuminated-spine.svg` — lombada/pesponto de livro.
- `public/ornaments/ritual-rule.svg` — divisor com trama simbólica.
- `public/ornaments/astral-veil.svg` — linhas e constelações do atlas.

O sistema é implementado em `src/styles-atelier.css`, com foco em todas as páginas vigentes, formulário, estados, telas vazias, listas, detalhes, arquivo, resumo, ajustes, narrativas, dock e HUD. Ele é um **design system de substituição visual** sobre as estruturas e contratos funcionais existentes, não uma alteração de dados ou substituição do motor.

### Composição, não só cores

- `RealmIntro`: substituído por frontispício editorial com numeração de ala, lema de cada área, gravação e selo próprio (sem criar um segundo landmark `banner`).
- `PrimaryDock`: nova composição de trilho encadernado, medalhões, estrelas de seleção e texto com foco legível.
- `NewEntryPage`: seleção inicial de categorias como armário de fólios com gravuras do próprio tipo, numeração e convite narrativo.
- `RitualChapter` e `RitualFields`: divisões de manuscrito, numeração, ornamentos, rótulos de tinta e margens. Os campos permanecem com nomes/validações/contratos preservados.
- `WorkoutFields`: tratamento de movimentos numerados, sem alterar contagem, unidade, salvação e execução.
- Coleção: fichas recompactadas com lombada gravada, impressão de tipo, texto de tinta, bordas inclinadas e espaço usado com intenção.
- Detalhes de livros e demais tipos: folha iluminada, cabeçalho de identidade, blocos de leitura e instrumentos de progresso, notas, citações, sessões e organização.
- Arquivo: tratamento de notas como tiras de manuscrito. Observatório: atlas noturno e placas de métricas iluminadas. Ateliê: painéis de instrumentos. RPG: painel teatral de escolhas. Toda a navegação mantém rotas existentes.

### Vibração nativa Android

A implementação anterior chamava apenas `navigator.vibrate(8)`, suporte inconsistente em Android WebView. A R6 cria o plugin nativo **`TactileFeedbackPlugin`**, registrado na `MainActivity`, e uma ponte TypeScript com `@capacitor/core` já instalado. A chamada ocorre em ativação de botão/link/dock/aba, nunca em movimento de pan ou pinch. Para ações confirmatórias, duração breve maior que seleção. Respeita a preferência Android de feedback tátil, não precisa de dependência npm adicional, aceita falha silenciosa e conserva fallback browser fora do Android. **A vibração percebida precisa ser testada no Moto G06.**

### Engenharia de fluidez

- Não são adicionados novos filtros de blur, transformações do canvas ou refatoração do renderer.
- Os recursos gráficos vetoriais são locais e estáticos.
- Animações temporais são limitadas a opacidade/transform e pequenas alterações de estado, com modo sem movimento.
- Ao focar input/textarea/select, o dock deixa espaço ao teclado.
- A BF-5R5 já tornou o mundo residente entre abas. **Isso é preservado.**
- O defeito anteriormente corrigido da barra inferior, composição de pátio e gestos da câmera permanecem intactos.

## Conservação de dados e arquitetura

Nenhuma mudança de schema, Dexie v9, backup v6, domínio, IDs, RPG, assets de mundo, câmera ou gestos. Seis categorias preservadas. Nenhum serviço externo, contas, XP, sincronização ou monetização.

## Testes e aceite

- `src/app/RealmIntro.test.tsx` — cabeçalhos, capítulos e semântica.
- `e2e/bf5-r6-manuscript.spec.ts` — frontispício, dock, largura em retrato, mudança de ala.
- Gate integral deve ser verificado na CI; **o histórico de E2E amplo vermelho nas versões anteriores não deve ser ocultado**.
- Android compile e teste de vibração em hardware real ainda precisam de resultado.
- Avaliação artística é exclusivamente humana: boa aprovação de build **não significa** design satisfatório.

## Roteiro físico (Moto G06)

1. Coleção: contraste do papel, tamanho de listagem, tipos, leitura e scroll com dock.
2. Nova ficha: as seis opções ilustradas, criar e editar cada tipo sem perder valores.
3. Detalhes: registros, campos, notas, citações, sessões, trabalho, estudo e treino; testar navegação com teclado.
4. Mundo: fullscreen, pan, pinch, seleção, NPC, diálogo e diário — não deve haver regressão.
5. Trocar abas repetidamente e avaliar animação, memória, recuperação e estabilidade.
6. **Vibração:** conferir preferência do aparelho para resposta tátil, apertar botões primários/secundários e dock. Não assumir PASS pela mera existência do plugin.
7. Retrato/paisagem, contraste alto e movimento reduzido.

**BF-5 permanece aberta. PR #20 draft sem merge.**
