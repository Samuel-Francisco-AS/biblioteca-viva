# Acessibilidade

## Regra central

Funções essenciais devem existir em React e permanecer utilizáveis sem depender de interpretação visual do canvas, áudio, animação, gesto preciso ou cor isolada.

## Interface

- HTML semântico e controles nativos sempre que possível.
- Ordem de foco previsível e foco visível.
- Alvos de toque de pelo menos 48 CSS px nas ações principais.
- Rótulos claros, estado ativo, `aria-current`, `aria-expanded` e mensagens anunciáveis.
- Erros próximos ao controle e resumo de falha com foco quando necessário.
- Safe areas respeitadas no Android.
- Estado vazio e carregamento descritos em texto.

## Movimento e áudio

Movimento reduzido elimina deslocamentos e fades dispensáveis sem remover informação ou alterar a conclusão lógica. Áudio possui controles independentes e nunca é a única confirmação de uma ação.

## Biblioteca visual

- Resumo textual permanente da projeção relevante.
- Falha do Phaser não bloqueia operações convencionais.
- Seleção e validade não dependem apenas de cor.
- Drag preciso não pode ser o único caminho para ação essencial.
- Entrar e sair de Construção preserva foco e hierarquia de Back/Escape.
- Overlays não devem cobrir a superfície principal nem capturar interação invisível.

## Preferências

`experience.preferences.v1` contém movimento, alto contraste e tamanho de texto em valores estritos. Ausência ou valor desconhecido usa defaults seguros. Preferências fazem parte do backup sem criar uma segunda fonte de verdade.

## Checklist automática

- axe ou verificação equivalente nas rotas convencionais;
- navegação completa por teclado;
- foco após erro, abertura e fechamento de disclosure/painel;
- nomes e papéis acessíveis;
- zoom/tamanho de texto sem perda de conteúdo;
- movimento reduzido sem informação perdida;
- testes de regressão dos estados React equivalentes ao canvas.

## Checklist humana aberta

- TalkBack no Moto G06;
- exploração linear e por controles;
- teclado virtual e safe areas;
- leitura de mensagens temporárias;
- contraste e legibilidade física;
- alternativa ao drag em todos os fluxos essenciais;
- áudio e movimento percebidos.

Automação não equivale a conformidade WCAG nem substitui validação humana.
