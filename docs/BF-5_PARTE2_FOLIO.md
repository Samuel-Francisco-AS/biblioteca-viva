# BF-5 — Parte 2: Coleção e fólio de leitura

Data: 2026-11-04. Implementação candidata em `feat/bf5-parte2-folio-leitura`, baseada em `origin/main` `f35258cfc58ce62396668013533954950a994c4b`. Checkout inicial limpo; `main` local preservada. Escopo autorizado pelo proprietário: sensibilidade dos cards e reconstrução do detalhe de livros. Relacionada à [issue #24](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/24), cujo escopo mais amplo de seis categorias permanece aberto. **BF-5 aberta; sem merge ou aceite artístico/físico desta candidata.**

## Experiência implementada

A rota ativa continua sendo `EntryDetailPage` → `BookDetailPage`. O livro passa a uma superfície contínua de marfim, tinta e ameixa, com selo de percurso, separadores de latão e cinco grupos: identidade/estado, marcador, notas/citações, imagem e ações secundárias. Não há substituição da Coleção, do mundo ou das outras cinco experiências de registro.

- Identidade compacta: título, autor, porcentagem real e estado editável no cabeçalho. As transições continuam limitadas por `getAllowedStatusTransitions`; conclusão/retomada preservam as regras existentes.
- Marcador integrado: barra sem animação onerosa, páginas lidas/restantes, entrada numérica direta e passos de uma página com alvos de 44px. O total fica visível; “Corrigir total de páginas” abre o editor existente. Campo vazio, frações, negativos e valores acima do total são recusados. O commit do caso de uso antecede a confirmação visual e a atualização da apresentação.
- Notas/citações: uma área cronológica, conteúdo sempre legível, identificação de tipo/página e editor contextual recolhível com seletor de tipo. Alternar o tipo/recolher o editor preserva os dois rascunhos montados. A nota usa `location: {type: "book", page}` já suportado; citação conserva `page` no comando existente. Nenhum campo persistido novo. Ações de edição, compartilhamento textual e exclusão confirmada permanecem nos controles contextuais de cada anotação.
- Organização/favoritos, etiquetas, metadados/avaliação/datas, histórico e cronômetro de sessões ficam em “Ações do livro”. Os painéis recebem o livro atualizado, evitando gravar organização a partir do snapshot antigo do wrapper. Sessões continuam consultadas e persistidas pelos serviços originais. Exclusão do livro mantém confirmação explícita, foco, bloqueio de duplicação e erro público.
- Navegação por links internos, saída da página e Back Android protegem rascunhos não salvos. A prévia possui diálogo nativo acessível, Escape/Back, foco contido pelo navegador e retorno ao acionador. O dock é inerte atrás do diálogo; campos seguem a regra existente de recolhimento do dock com foco e margem inferior do shell.

## Cards: confirmação sem pressão prematura

A inspeção encontrou `data-tap-active` aplicado no `pointerdown` global e camadas `:active` que alteravam fundo/filtro/transformação antes de o navegador decidir entre clique e scroll. Para `.book-card__link`, o início de ponteiro somente registra o gesto; não escreve atributo visual nem pré-ativa a ficha. As regras antigas de pressão/fundo foram retiradas para os cards. A confirmação semântica de `click` (incluindo teclado) aplica somente acento de borda; navegação e haptic usam o mesmo clique confirmado, sem temporizador, bloqueio de scroll ou atraso artificial. Pan/cancelamento não recebem feedback de seleção.

Hover continua condicionado a mouse com hover e foco visível é preservado. Não se alterou o limite de movimento global de 8px nem se atribuiu causa dos engasgos físicos ao CSS sem medição. O E2E usa `Input.dispatchTouchEvent` para confirmar scroll efetivo, estabilidade de background/cor/filtro/transform/borda já no primeiro contato, ausência de navegação e abertura posterior por toque/Enter.

## Exportação real de imagem

`createBookImage` desenha uma composição própria em Canvas 2D, 1080 × 1350 (4:5), com fundo ameixa, fólio, fio de latão e assinatura discreta Biblioteca Viva. Usa `toBlob("image/png")`; a prévia mostra o próprio PNG que será entregue, sem captura da tela e sem recurso externo. Duas composições: resumo com dados reais do livro e uma citação escolhida explicitamente, incluindo página quando existente. Notas pessoais não são fornecidas ao renderer nem oferecidas no seletor.

Textos quebram linhas e reduzem fonte até legibilidade mínima; se não couberem, a interface explica a limitação em vez de cortar conteúdo silenciosamente. A citação pode ter um trecho ajustado apenas para a exportação, com “Atualizar prévia”; não modifica a fonte salva e não refaz o PNG a cada tecla. Título/autor excepcionalmente longos também podem exceder uma placa; permanece uma limitação explícita da composição fixa.

A aplicação oferece `ImageFilesPort`; a infraestrutura implementa a entrega. Nenhum componente importa Capacitor/Dexie/infraestrutura. Foram reutilizados **@capacitor/share 8.0.1**, **@capacitor/filesystem 8.1.2** e **@capacitor/core 8.4.2**, já instalados: zero nova dependência npm/peso de biblioteca adotada.

- Android: PNG binário em caminho único de `Directory.Cache`, URI entregue a `Share.share({files})`, limpeza após encerramento do fluxo; cancelamento é distinto de falha. Não há promessa de que o destinatário recebeu/publicou a imagem.
- Salvamento Android: plugin local `ImageDocument`, separado do backup, usa `ACTION_CREATE_DOCUMENT` e MIME `image/png`; valida nome/payload, escreve em segundo plano, retorna salvo/cancelado/erro e não pede acesso amplo ao armazenamento.
- Browser: `File` PNG com Web Share quando `canShare({files})` permite. Sem suporte/falha, botão “Salvar imagem PNG” permanece disponível e inicia download local. A confirmação diz “entregue ao salvamento”, sem prometer que o usuário concluiu uma interface externa.

Referências verificadas: [Share v8](https://capacitorjs.com/docs/apis/share), [Filesystem v8](https://capacitorjs.com/docs/apis/filesystem) e implementações locais dos plugins. O compartilhamento de arquivos no Android usa cache conforme o contrato oficial. Abertura do chooser, apps destinatários, cancelamento e salvamento SAF ainda precisam de avaliação física.

## CSS e preservação

`book-folio.css` pertence ao componente novo, sem herdar as antigas classes `detail-layout`, `detail-summary` e `entry-detail-sections`. Removidas somente regras dessas classes comprovadamente sem consumidores, além das regras de pressão dos cards. `history-grid` do Arquivo, detalhes genéricos e acabamento das demais telas preservados. Foco, contraste, movimento reduzido e campos usam regras locais; a margem inferior do shell e os insets Android continuam ativos. O fólio mantém o dock recolhido durante `form:focus-within`, prevenindo o retorno entre blur do campo e envio pelo botão.

Sem mudança em domínio, transações, eventos, Dexie v9, backup v6, versão do app, sessões, seis tipos, residência de Three.js, RPG, personagens ou quests. Sem backend, conta, serviço externo ou publicação.

## Verificação e resultados

Gates finais executados: **lint, format:check, typecheck/build, audio:check, performance:report, android:sync, android:build:debug e git diff --check PASS**. A última rodada unitária dirigida teve **50 PASS / 6 arquivos**, cobrindo App, livro, proteção de rascunho, diálogo de imagem, entrega PNG e fronteiras arquiteturais. Nenhum timeout/retry/assert foi afrouxado. Evidências usam apenas conteúdo fictício.

APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`, **5.775.888 bytes**, SHA-256 `e128a44192f1e65da0a9359f29f4f42152e5432c8db7f002adf1126252a51892`. Warnings conhecidos de `flatDir` e chunks >500kB permanecem. O relatório de bundle estático aponta entrypoint JS inicial de aproximadamente 633,5kB; não mede fluidez física. Nenhum APK foi instalado por esta entrega.

Capturas inspecionadas no navegador (não no aparelho): [retrato](evidence/BF-5P2/folio-retrato.png), [paisagem](evidence/BF-5P2/folio-paisagem.png), [PNG resumo](evidence/BF-5P2/resumo-leitura.png) e [PNG citação](evidence/BF-5P2/citacao.png). Capturas full-page incluem o dock fixo na posição do viewport inicial; o conteúdo abaixo dele é alcançado por rolagem. O E2E verifica a margem de largura e o recolhimento durante edição, sem certificar o teclado Android.

A rodada ampla unitária executada durante o trabalho teve **741 PASS / 1 FAIL por timeout de 5s** em 98 arquivos. Falha: `inhabitantAgency` / “enacts autonomous encounters, six mutable pairs, conflict, cooperation and cosmetic repair without collisions”, mesmo nome documentado em R7/R9; a agência não foi alterada. A rodada dirigida posterior (`BookDetailPage`, `inhabitantAgency`, `imageFiles`) teve **43 PASS**. Concorrência com compilação/checks é uma hipótese, não causalidade demonstrada; o amplo não é declarado PASS. Os três testes do diálogo PNG adicionados posteriormente passaram dirigidos.

A primeira rodada E2E teve erros nos testes novos (ordenação do seed e matcher numérico incompatível). Após corrigir as expectativas, **3 E2E PASS em 25,2s**, sem mudar timeout, retries ou assert de produto. Na rodada ampliada posterior, **3 PASS / 4 FAIL em 7 E2E**. Dois FAIL eram um defeito novo da candidata: o dock podia voltar entre blur do campo e clique do botão, encobrindo o envio de nota/citação. O trace mostrou o botão sob o dock e os campos intactos. A correção local usa `form:focus-within` para manter a navegação recolhida também durante foco/acionamento do botão. A rodada seguinte aprovou **2 E2E em 56,5s no conjunto de 3**: fólio completo com páginas/status/notas/citações, reload, paisagem/retrato, PNGs e fallback, e o ciclo principal existente com edição/exclusão/conclusão. O terceiro caso (busca/Arquivo) continuou FAIL e foi tratado separadamente abaixo.

Os outros PASS da ampliada foram cards com scroll CDP/toque/Enter, feedback R7 e rotas inexistentes. `reading-area` FAIL por timeout em `selectA.click()` na lista semântica do mundo, **antes de abrir o livro/chegar ao seletor alterado**. Sem prova de causalidade nova: cenário pertence à família de dívidas de WebGL/seleção, mas o nome do caso e o ponto de falha ficam registrados; nenhum código do runtime foi alterado e o caso não foi repetido nesta triagem.

Busca/Arquivo falhou duas vezes no link `Abrir registro Árvore Azul`, com Arquivo vazio. O teste fazia `page.goto` para criar outro livro imediatamente após clicar em adicionar nota, sem aguardar confirmação da transação. Foi acrescentada uma asserção de persistência visual da nota antes dessa navegação completa, fortalecendo o cenário. Resultado dirigido final: **1 PASS em 13,3s**, com criação/consulta da nota, filtros, ordenação e origem do Arquivo preservados. A evidência confirma a espera correta nesta execução; não demonstra uma causa única para toda a flakiness histórica.

As dívidas [#21](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/21), [#22](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/22) e [#23](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/23) não foram declaradas resolvidas. E2E amplo histórico da main: 21 PASS / 27 FAIL. Esta entrega usa E2E dirigidos; CI global permanece sujeita às dívidas e qualquer falha nova deve ser separada por evidência.

## Limitações e roteiro Moto G06

Sem instalação ou teste físico nesta entrega. Aceite artístico, TalkBack, contraste/tamanho de texto percebidos, vibração, fluidez, teclado Android, rotação e apps destinatários não são inferidos de Playwright/build. O guard de rascunho cobre links, unload e Back Android; Back/Forward do histórico SPA no browser não tem bloqueio transacional do router. Nota preserva seu mecanismo existente de edição de conteúdo; a página associada na criação é mantida, sem novo contrato de edição de localização.

1. Na Coleção, rolar começando sobre fichas, inverter direção e interromper gestos: observar ausência de mudança de cor e avaliar os engasgos relatados. Tocar para abrir e repetir com teclado/TalkBack.
2. No livro, reconhecer título/autor/estado/%; pausar/retomar, digitar página, usar ± e salvar. Tentar vazio, fração e acima do total. Conferir confirmação e reabrir para comprovar persistência. Corrigir o total no editor secundário.
3. Criar nota e citação com/sem página; alternar/recolher o editor mantendo rascunho. Sair com rascunho e cancelar descarte. Editar/excluir anotação pelos controles contextuais.
4. Abrir resumo/citação em imagem; ajustar um trecho sem alterar a citação salva. Compartilhar para um app real, cancelar, salvar em pasta pelo seletor e abrir os PNGs fora da Biblioteca Viva. Confirmar que nenhuma nota privada aparece automaticamente.
5. Abrir favoritos/etiquetas, metadados e sessões; registrar e reabrir histórico sem alteração das estruturas. Cancelar a exclusão do livro.
6. Repetir em paisagem, teclado aberto, texto ampliado, alto contraste, movimento reduzido, TalkBack e segundo plano/retorno. Rolar até o último controle e conferir dock/barras de sistema.

BF-5 continua aberta para revisão artística e gate físico do proprietário. Não fechar #24 nem realizar merge automaticamente.
