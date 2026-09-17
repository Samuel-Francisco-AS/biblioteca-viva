# Acessibilidade

Funções essenciais devem usar HTML semântico e permanecer utilizáveis sem áudio, animação, gesto preciso ou cor isolada.

- ordem de foco previsível e foco visível;
- controles nativos e nomes acessíveis;
- alvos de toque adequados;
- erros próximos ao controle e mensagens anunciáveis;
- safe areas Android;
- estados vazio e carregamento descritos em texto;
- preferências de movimento, alto contraste e tamanho de texto;
- áudio nunca como confirmação exclusiva.

A rota Biblioteca mantém descrição, status, fallback e navegação em React ao redor do canvas. TalkBack, teclado virtual, contraste físico e áudio percebido ainda exigem validação humana específica.

## Fundação 3D

A introdução experimental de Three.js não altera a regra central: **o canvas 3D não pode se tornar a única superfície semântica de uma função essencial**.

A F1 demonstrou uma ponte mínima bidirecional:

```text
Mundo 3D → estado efêmero → React semântico
React semântico → estado efêmero → Mundo 3D
```

Na cena de prova:

- a Biblioteca descreve em texto que existe um ambiente 3D experimental;
- o objeto selecionado no mundo é informado em uma superfície React semântica;
- a alternativa React com controle nativo altera a seleção sem gesto preciso no canvas;
- a seleção pela alternativa React reflete visualmente no mundo;
- a falha do renderer preserva um estado textual compreensível e não bloqueia o aplicativo convencional.

A F1 provou a **viabilidade arquitetural** dessa relação e a interação básica no Moto G06; ela não autoriza declarar TalkBack aprovado. TalkBack completo, ergonomia final e demais tecnologias assistivas permanecem evidência humana futura.

Na F1-C, o host passou a anunciar inicialização, sucesso ou falha e informar o label selecionado em uma região `aria-live`. O `<select>` inicialmente usado como alternativa abriu uma superfície branca vazia durante a primeira validação física no Moto G06 e foi removido na F1-F-FIX.

A alternativa atual usa dois botões HTML nativos, `Anterior` e `Próximo`, que percorrem com wrap os onze objetos técnicos e comandam o mesmo highlight Three. Os botões possuem nomes visíveis, alvo de toque do sistema de estilos, foco de teclado normal e foco visível. Seleção pelo canvas continua atualizando React; seleção pelos botões continua atualizando o highlight. O canvas permanece fora da árvore semântica e não é necessário para operar a seleção de prova.

Na revalidação física da F1-F-FIX, os botões ficaram visíveis e funcionais, identificaram o objeto corretamente em React e atualizaram seleção e highlight nos dois sentidos. A superfície branca do `<select>` deixou de ser necessária.

Os botões são somente controles experimentais da Fundação, não uma decisão de UX final. O highlight ciano não é a única indicação de estado. A estrutura e a ponte foram aprovadas para a F1, e a F3 concluiu câmera/interação mobile; TalkBack humano completo não foi executado e permanece pendente para F6 ou outro gate específico. A evidência física da F3 não aprova TalkBack.

## F6-A — contrato auditado da Fundação

Funções essenciais nesta fixture: compreender que o ambiente 3D experimental está inicializando, disponível ou indisponível sem perder a aplicação convencional; conhecer a seleção técnica; e alterá-la sem canvas. A descrição da rota, os estados React de loading/ready/fallback, o texto selecionado anunciado e os botões nativos `Anterior`/`Próximo` são a representação semântica dessa fronteira. A ponte permanece bidirecional: Three atualiza React e React comanda o mesmo highlight; canvas e host ficam fora da árvore semântica.

Pan, wheel zoom, pinch, câmera, exploração espacial e tap direto no canvas são mecanismos visuais não essenciais da fixture descartável. Não exigem paridade nesta Fundação, nem justificam controles especulativos. Movimento não é confirmação exclusiva de função essencial; seleção também não depende somente de cor ou áudio.

| Área auditada | Classificação F6-A |
|---|---|
| descrição, loading, ready, fallback, seleção e anúncio relevante | ATENDIDO |
| controles nativos, teclado, foco visível/previsível e navegação convencional | ATENDIDO |
| equivalência React ↔ Three, highlight suplementar e canvas semântico oculto | ATENDIDO |
| seleção sem gesto preciso, cor isolada ou áudio | ATENDIDO |
| pan/zoom/pinch/exploração e movimento da fixture | NÃO APLICÁVEL À FUNDAÇÃO ATUAL |
| texto aumentado, safe areas e viewport | ATENDIDO estruturalmente |
| TalkBack no Moto G06, ordem/leitura e anúncios percebidos, ergonomia, contraste, tamanho de texto Android e áudio percebido | DÍVIDA HUMANA ACEITA EM F6-C |

Não houve lacuna de produção confirmada para F6-B nem teste novo a criar por esta auditoria. A evidência existente inclui `WorldHost.test.tsx`, `ThreeWorldRuntime.test.ts` e os cenários da rota Biblioteca em `e2e/r4-shell.spec.ts`; F6-A executou somente `WorldHost.test.tsx` (10 testes aprovados). A evidência humana que código, jsdom e Chromium não podem declarar aprovada foi registrada como dívida em F6-C.

### F6-B — evidência automatizada consolidada

F6-B encontrou somente uma lacuna de evidência: faltava provar explicitamente a sequência nativa de foco/teclado e os marcos estruturais da superfície React. `WorldHost.test.tsx` agora confirma status `role="status"`, host oculto semanticamente, fallback `role="alert"`, região de seleção `aria-live="polite"`, tabulação que alcança `Anterior` antes do canvas e ativação nativa por Space/Enter. A regressão consolidada passou sem mudança de produção.

### F6-C — fechamento técnico com dívida assistiva aceita

A FUNDAÇÃO está concluída arquiteturalmente: React conserva a superfície semântica, o canvas não é a única representação de função essencial e a seleção é operável sem gesto preciso. **TalkBack não foi executado nem aprovado**, e não há aprovação de leitura, anúncios, foco, ergonomia, contraste, tamanho de texto Android, áudio percebido ou acessibilidade final da Biblioteca. A indisponibilidade temporária do Moto G06 foi aceita conscientemente como dívida técnica.

Antes de declarar concluído o primeiro recorte real do mundo e antes de beta/release dependente dessa experiência, executar o gate humano assistivo no build então atual e representativo — não necessariamente o APK F6-B — cobrindo TalkBack, ordem/leitura, anúncios, foco percebido, navegação convencional, operação essencial sem canvas, ergonomia, contraste, tamanho de texto Android e áudio quando aplicável.
