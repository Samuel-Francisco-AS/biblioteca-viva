# Plano de refinamento pós-protótipo

> Início da fase: 2026-08-13
> Estado: R1 e R2 tecnicamente concluídos; R3 é o próximo trabalho e não foi iniciado
> Base: primeira rodada integrada de uso físico realizada por Sam no Moto G06

## 1. Função e limites

Este é o documento operacional das rodadas posteriores à implementação técnica dos Prompts 1–19. `EXECUTION_PLAN.md` permanece como registro histórico do plano original de construção; nenhuma tarefa abaixo deve ser apresentada como parte retroativa daqueles prompts, nem numerada automaticamente como “Prompt 20”.

Esta fase corrige atritos observados no protótipo funcional e prepara uma revisão extensa de apresentação. Cada implementação futura deve preservar dependências para dentro, dados persistidos como fonte de verdade, transações e eventos pós-commit, TypeScript estrito, acessibilidade e limites de privacidade. Conta, backend, sincronização, CMS, outros tipos de mídia e múltiplas salas continuam fora do escopo.

O registro desta observação é evidência parcial: não aprova automaticamente G4, G7, G8, G9 ou G10. G11 não foi iniciado.

## 2. Primeira rodada integrada no Moto G06

Em 2026-08-13, Sam realizou uma rodada integrada de uso real no Moto G06.

### Comportamentos confirmados

- cadastro, modificação e exclusão de livros funcionaram;
- criação de notas e de citações funcionou;
- a estante reagiu à coleção;
- efeito sonoro e música ambiente funcionaram;
- volume e mute funcionaram;
- o backup foi exportado para o local escolhido;
- a desinstalação removeu os dados locais como esperado;
- a reinstalação iniciou sem os dados anteriores;
- a importação/restauração funcionou e os dados foram restaurados corretamente;
- a primeira conclusão de livro disparou o efeito sonoro;
- o primeiro marco de conclusão foi registrado;
- a luminária de leitura apareceu após o primeiro livro concluído.

### Achados transversais

- **Movimento reduzido:** a política técnica atual deixa os personagens completamente estáticos. No aparelho, isso transmitiu sensação de cena congelada. É uma questão de UX para a rodada visual; não autoriza mudança imediata da preferência.
- **Layout e densidade:** há informação simultânea, cartões, caixas, bordas e textos em excesso; a hierarquia é fraca, a Biblioteca visual ocupa área secundária, e a tela inicial é dominada pela alternativa textual e controles. A aparência permanece estrutural/provisória e sem identidade suficiente. A resposta será redesign amplo, não ajustes cosméticos isolados.
- **Estante:** a projeção atual usa dois grupos visuais para 1–4 livros, cinco para 5–14 e compressão acima disso. Foi pouco intuitiva para coleções pequenas. O refinamento deve inicialmente preferir correspondência 1:1 para os primeiros livros; coleções maiores podem continuar comprimidas por desempenho.
- **Notas e citações:** criar funciona, mas a utilidade fica limitada sem editar, excluir e compartilhar cada tipo.
- **Áudio:** foi percebido pequeno atraso no efeito sonoro ao navegar de outra aba para `Biblioteca`. Tratar como defeito funcional a investigar, sem alterar previamente a arquitetura.

## 3. Regras aprovadas para implementação futura

### 3.1 Progresso dirige início e conclusão

Ao atualizar um livro planejado para `currentPage > 0`, a implementação futura deve mudá-lo para `in_progress`. Se ainda não houver data de início, deve registrá-la conforme a política temporal do domínio, sem exigir a ação separada “Iniciar leitura”.

Quando `totalPages` for conhecido e `currentPage == totalPages`, o livro deve mudar automaticamente para `completed` e reutilizar exatamente a cadeia existente:

```text
progresso
→ domínio
→ persistência
→ evento de conclusão
→ milestone
→ áudio
→ diálogo
→ projeção
→ feedback React
```

Não deve existir uma segunda implementação de conclusão; o marco permanece idempotente. Sem `totalPages`, progresso pode iniciar a leitura, porcentagem não é calculada e conclusão automática não ocorre. Nenhum total será inventado. Regras de `paused` e `abandoned` não serão ampliadas sem nova decisão.

### 3.2 Primeira apresentação do progresso

No detalhe de livro com total conhecido, mostrar porcentagem concluída, páginas lidas, total, páginas restantes e barra horizontal. Não usar gráfico de rosquinha nesta etapa.

```text
38% concluído

████████░░░░░░░░░░░░

50 de 132 páginas
82 páginas restantes
```

Porcentagem e páginas restantes são derivadas, não persistidas. A apresentação deve tratar zero e 100%, nunca ultrapassar 100%, funcionar em alto contraste, não depender apenas de cor, possuir texto equivalente e respeitar escala de texto. Para total desconhecido, mostrar a página atual e informar que o total não foi definido, sem porcentagem enganosa. A solução inicial deve permanecer simples por anteceder o redesign.

### 3.3 Restauração e backup de segurança

Em banco vazio:

```text
selecionar backup
→ validar
→ confirmar
→ restaurar
```

Não exigir backup de segurança quando não houver dados atuais. Em banco preenchido, oferecer explicitamente `Criar backup antes de restaurar`, `Continuar sem criar backup` e `Cancelar`. Continuar sem backup exige aviso claro de que os dados atuais serão substituídos. A decisão permanece com o usuário e proteções contra restauração acidental permanecem obrigatórias.

### 3.4 Áudio modular e playlist

A evolução deve permitir:

```text
arquivo de áudio no repositório
→ entrada no manifesto
→ ID na playlist
→ AudioService reproduz sequência
```

O fluxo deve aceitar arquivo compatível com a política técnica, inclusive MP3 quando suportado, registrar a fonte no manifesto, ordenar IDs em playlist e substituir/remover faixas sem modificar React, Phaser ou regras centrais. A primeira versão será uma playlist sequencial declarativa, configurável pelo código, sem editor no aplicativo, streaming ou biblioteca remota. Efeitos sonoros também devem continuar simples de substituir.

## 4. Rodada R1 — Coerência funcional

**Objetivo:** corrigir atritos do uso real antes do redesign.

1. início automático pela atualização do progresso;
2. conclusão automática ao atingir o total, reutilizando a cadeia atual;
3. barra horizontal, porcentagem e páginas restantes;
4. representação mais direta da estante para pequenas coleções;
5. backup de segurança opcional na restauração conforme estado do banco;
6. investigação e correção do delay sonoro ao entrar na Biblioteca.

R1 deve preservar arquitetura em camadas, dados existentes, milestones, backup e acessibilidade. Mudança de schema só poderá ocorrer com migração e teste; nenhuma é presumida por este plano.

Em 2026-08-13, os itens 1–4 foram concluídos tecnicamente como R1-A. Em 2026-08-16, R1-B concluiu os itens 5–6: a aplicação deriva o estado vazio das seis coleções substituídas, sem contar metadata técnica; a interface oferece os três caminhos explícitos quando há dados. A investigação sonora provou que a intenção de rota já precedia e independia do Phaser, mas o backend repetia busca e decodificação do WAV em cada entrada. A música local agora é preparada após unlock e o buffer é reutilizado no lifecycle do backend. A percepção no Moto G06 e a restauração física específica continuam pendentes; nenhum gate foi aprovado.

## 5. Rodada R2 — Utilidade de conteúdo e áudio

1. editar, excluir e compartilhar nota;
2. editar, excluir e compartilhar citação;
3. playlist musical declarativa;
4. suporte simples a várias músicas no manifesto;
5. ordem configurável pelo código;
6. substituição simples de efeitos sonoros.

Excluir anotação exigirá confirmação e consistência transacional conforme a arquitetura. Compartilhamento será explícito e não cria conta ou sincronização. Evitar editor complexo, streaming, backend, biblioteca musical remota, conta, sincronização e CMS.

Em 2026-08-16, os seis itens foram concluídos tecnicamente. `updateNote`/`updateQuote` preservam ID e criação e avançam revisão; `DeleteNote`/`DeleteQuote` removem somente a entidade na transação, mantendo atividades de criação e milestones como fatos históricos. Detalhe e Arquivo reutilizam as mesmas ações acessíveis e atualizam seu estado em memória sem perder a busca. O compartilhamento explícito passa por uma porta pequena e pelo Share já instalado, sem metadata interna ou logs de conteúdo.

`AUDIO_CONFIGURATION` liga manifesto validado a playlists tipadas. A Biblioteca inicia no primeiro cue, avança em ordem pelo término natural real, volta ao início e reinicia no primeiro cue depois de sair da rota. Pause, mute e resume preservam o índice atual, embora a faixa reinicie do começo; callbacks de players antigos são invalidados por geração. O único WAV musical real continua sendo uma playlist válida de um item, enquanto testes com fakes provam múltiplos cues, wrap-around, MP3 no manifesto e troca de efeitos alterando apenas `sources`. Nenhum asset foi inventado.

## 6. Rodada R3 — UX/Layout v2 — Glow-up geral

Esta é uma revisão extensa da apresentação, não pequeno polimento. A auditoria de 2026-08-16 confirma que o shell é mobile-first e semanticamente sólido, mas a linguagem visual ainda é estrutural: `styles.css` concentra tokens claros e regras de todas as rotas; `content-card` envolve quase todo bloco; o detalhe empilha resumo, progresso, status, dois formulários, histórico e exclusão em sete superfícies; Configurações empilha experiência, áudio, dados, exportação e restauração. A navegação inferior usa cinco colunas estáveis e vira lateral em `48rem`, enquanto grades/controles mudam em `36rem`.

Na Biblioteca, `pages.tsx` renderiza introdução e `LibraryTextAlternative` antes de `LibraryVisualHost`; o host fica em `16:9`, mínimo de `12rem`, portanto o texto domina em retrato. `LibraryShelfPanel` e `LibraryCharacterPanel` entram no fluxo como novos cartões, não como camada contextual. A cena possui layouts puros compacto/regular em `sceneLayout.ts`, paleta procedural própria em `roomConfig.ts`, quatro zonas interativas e budget/lifecycle já testados. Reduced motion atualmente zera os três tweens contínuos, deixando a composição inteiramente estática. Esses fatos explicam a densidade, a desconexão React–Phaser e a sensação de congelamento; não autorizam alterar comportamento nesta auditoria.

R3 terá somente as duas entregas futuras abaixo.

### R3-A — Sistema visual + aplicativo convencional

**Arquivos/componentes principais:** `src/styles.css`; shell, header, navegação, avisos e rotas em `src/App.tsx`/`src/routes.ts`; `CollectionPage`, `BookDetailPage`, `BookForm`/`EntryEditorPages`, `AnnotationForms`/`AnnotationActions`, `ArchivePage`, `SettingsPage`, Error Boundary e estados convencionais associados.

**Responsabilidades:** introduzir tokens v2 sem fixar hexadecimais como aprovação visual; formar tema escuro coerente com famílias de fundo noturno, madeira, verdes profundos, âmbar/dourado, texto, foco, erro e alto contraste; reduzir caixas/bordas e usar tipografia, ritmo e agrupamento para hierarquia; revisar shell/navegação/safe areas; transformar Coleção, detalhe, formulários, Arquivo e Configurações sem mudar seus casos de uso. Loading, vazio, erro, sucesso e confirmação devem compartilhar padrões visuais reais, sem abstração sem consumidor.

**Dependências e ordem:** começar pelos tokens e primitivas já consumidas (`button`, campos, headings, feedback, superfícies), depois shell/navegação, páginas de consulta, detalhe/anotações, editores e Configurações. Preservar os contratos e o estado local/URL atuais; R3-A não depende de mudar domínio, aplicação, Dexie, backup, Phaser ou assets.

**Riscos:** contraste insuficiente no tema escuro; excesso de redução de bordas apagar agrupamentos; cinco destinos apertados em 320 px/texto ampliado; regressão de foco em confirmações; formulários e restauração perderem clareza; CSS global gerar efeito cruzado; desktop lateral divergir do mobile principal.

**Testes provavelmente afetados:** `App.test.tsx`, `pages.test.tsx`, testes de Collection/BookDetail/EntryEditor/Archive/Settings/AnnotationActions, `accessibilityArchitecture.test.ts`, `presentationArchitecture.test.ts` e E2E críticos. Acrescentar verificações estruturais de estados, navegação, foco e atributos de experiência; validar visualmente 320 × 915, 360 × 640 e desktop sem substituir prova humana.

**Preservações obrigatórias:** rotas e Voltar; parâmetros de busca/filtro; CRUD e compartilhamento; progressão/marcos; backup/restauração; labels, headings, `aria-live`, erros associados, teclado, foco, touch target de 44 px; alto contraste, três escalas de texto, reduced motion, safe areas e conteúdo utilizável sem áudio/canvas.

**Critérios técnicos de conclusão:** todas as rotas convencionais usam o sistema v2 de forma coerente; densidade e superfícies redundantes são reduzidas sem perda semântica; nenhum overflow em larguras-alvo e texto ampliado; estados/confirmações distinguíveis sem depender de cor; automação integral verde e documentação atualizada. Aprovação estética, contraste humano e TalkBack continuam gates humanos.

### R3-B — Biblioteca protagonista + acabamento integrado

**Arquivos/componentes principais:** `src/pages.tsx`; `LibraryVisualHost`, `LibraryTextAlternative`, `LibraryShelfPanel`, `LibraryCharacterPanel`, `libraryPresentation` e contracts; `InitialLibraryScene`, `sceneLayout`, `roomConfig`, `motionLifecycle`/`motionPolicy`, projeção/manifests; estilos da Biblioteca em `styles.css`; integração do shell em `App.tsx`.

**Responsabilidades:** colocar sala/canvas como primeiro plano e reservar no retrato uma altura útil entre header e navegação; transformar introdução em informação curta/overlay contextual; manter resumo e ações React equivalentes em uma alternativa recolhível ou secundária semanticamente presente; apresentar estante/personagens em painel inferior ou camada equivalente com foco/fechamento corretos; alinhar superfícies e iluminação React à sala; tratar vazio, loading e falha do canvas sem bloquear Coleção.

**Dependências e ordem:** parte do sistema visual de R3-A e preserva `LibraryViewModel`, as interações tipadas e a instância lazy única. Primeiro definir layout responsivo do host e ordem DOM; depois camada contextual e retorno de foco; em seguida ajustar os layouts procedurais/paleta da cena; por fim reconciliar motion, fallback e acabamento. Não levar entidades, títulos privados desnecessários ou regras de negócio ao Phaser.

**Reduced motion futuro:** manter zero loops contínuos quando reduzido, mas usar estados visuais estáticos intencionais e feedback discreto disparado somente por interação/mudança: poses alternativas, iluminação/ênfase imediata e transições finitas quando aceitáveis. Nada depende de animação; nenhuma pulsação, caminhada ou idle contínuo volta no modo reduzido. A solução deve parecer responsiva sem simular atividade permanente.

**Riscos:** canvas dominante competir com navegação/safe area/teclado; overlay esconder alternativa ou quebrar ordem de foco; bottom sheet sem contenção/restauração adequadas; recriar Phaser em resize/layout; aumentar display objects/tweens ou bundle; contraste divergente entre CSS e WebGL; texto ampliado encobrir a sala; reduced motion voltar a parecer congelado ou reintroduzir movimento contínuo.

**Testes provavelmente afetados:** `pages.test.tsx`, `LibraryVisualHost.test.tsx`, arquitetura/projeção/layout/manifest/tap/motion da Biblioteca, App/accessibility, prova de 20 ciclos, performance report e E2E principal. Manter testes de uma instância/canvas, import tardio, resize, pause/resume, cleanup, interação por toque/arraste, foco após painel, alternativa operável e falha do canvas; acrescentar matriz de host retrato/desktop e estados reduzidos discretos sem WebGL real quando possível.

**Preservações obrigatórias:** React continua estrutura acessível e fonte das ações; Phaser continua view lazy especializada; alternativa convencional permanece completa; Coleção acessível sem jogar; estante, bibliotecária, criatura, luminária, projeção limitada, privacidade, áudio independente da cena, touch/scroll, lifecycle, offline e budget visual permanecem válidos.

**Critérios técnicos de conclusão:** canvas é protagonista em retrato sem remover header/navegação/alternativa; painéis contextuais têm semântica, fechamento e retorno de foco previsíveis; loading/vazio/falha mantêm ações equivalentes; layout compacto/regular e texto ampliado não sobrepõem conteúdo; reduced motion comunica estado/resposta sem loops; Phaser segue lazy, com uma instância/canvas e budget coerente; suíte, E2E, build/performance e Android debug verdes. Aparência, conforto de movimento e uso físico ainda exigem validação humana.

## 7. Checkpoint integrado posterior

Não se exige validação física a cada microalteração. Automação proporcional ao escopo continua obrigatória durante R1–R3. Depois das três rodadas, um novo checkpoint integrado Android deve verificar:

- regressões de CRUD;
- início e conclusão automáticos;
- barra percentual e estados sem total;
- estante;
- notas, citações e compartilhamento;
- playlist e áudio, inclusive delay;
- backup e restauração;
- milestone e luminária;
- novo layout e tema escuro;
- responsividade e acessibilidade;
- lifecycle e desempenho.

Somente depois desse checkpoint devem ser avaliados explicitamente os gates ainda abertos e a preparação para G11. Observações parciais não fecham gates.
