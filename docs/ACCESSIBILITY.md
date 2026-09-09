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

Os botões são somente controles experimentais da Fundação, não uma decisão de UX final. O highlight ciano não é a única indicação de estado. A estrutura e a ponte foram aprovadas para a F1, mas TalkBack humano completo não foi executado e permanece pendente para F6 ou outro gate específico.
