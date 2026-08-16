# Registro de decisões

Decisões não são apagadas quando substituídas. Altere o status para `substituída` e referencie a decisão nova.

## Formato

- **ID**;
- **data**;
- **status:** proposta, aceita, substituída ou rejeitada;
- **contexto**;
- **decisão**;
- **consequências**.

---

## D-001 — Aplicativo pessoal com qualidade de portfólio

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** não existe perspectiva concreta de produto comercial agora, mas a base deve permitir evolução futura.

**Decisão:** construir um aplicativo real de uso pessoal, visual e sonoro, documentado como portfólio, sem backend no protótipo.

**Consequências:** confiabilidade e UX prática têm o mesmo peso da apresentação; escala comercial não justifica complexidade antecipada.

## D-002 — Stack híbrida web-first

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** TypeScript estrito, React, Vite, Phaser 3 e Capacitor.

**Consequências:** React cuida do app; Phaser da biblioteca; uma base gera web e Android.

## D-003 — Modular monolith em um repositório e pacote

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** um repositório e um pacote no protótipo, com camadas lógicas.

**Consequências:** sem monorepo, microserviços ou pacotes internos antes de necessidade real.

## D-004 — Phaser como view especializada

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** Phaser recebe projeção pronta, renderiza e emite interações tipadas. Não acessa banco nem decide marcos.

**Consequências:** coleção continua funcional sem cena; React e Phaser podem ser testados separadamente.

## D-005 — Persistência inicial com Dexie atrás de portas

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** Dexie/IndexedDB no protótipo; repositórios isolam tecnologia.

**Consequências:** backup e migrações são obrigatórios; SQLite será avaliado por gatilhos verificáveis.

## D-006 — Capacitor e APK cedo

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** criar APK debug no Bloco 2, antes do domínio completo.

**Consequências:** riscos de WebView, Android Studio, safe areas e ciclo de vida aparecem cedo.

## D-007 — Som como serviço desacoplado

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** React e Phaser emitem intenções; um `AudioPort` controla reprodução e preferências.

**Consequências:** sem chamadas de áudio espalhadas ou duplicadas.

## D-008 — Conteúdo orientado a dados

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** diálogos, marcos, recompensas, salas e assets usam IDs, schemas, manifests e fallback.

**Consequências:** adicionar conteúdo não exige alterar motor central.

## D-009 — Somente livros no protótipo

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** a união discriminada prevê expansão, mas apenas `BookEntry` será implementado até G11.

**Consequências:** filmes, séries e estudos permanecem no backlog pós-protótipo.

## D-010 — Progresso sem punição

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** sem streak obrigatória, degradação, culpa ou perda por ausência.

**Consequências:** retorno é acolhedor; abandono é status válido; recompensas refletem ações sem coerção.

## D-011 — Backup antes do polimento final

- **Data:** 2026-07-28
- **Status:** aceita

**Decisão:** exportação, restauração e migrações entram no Bloco 5, antes da sala visual completa.

**Consequências:** dados têm prioridade sobre acabamento.

## D-012 — Decisões aprovadas no Gate G0

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o encerramento do Gate G0 exigia consolidar as definições humanas que orientam o protótipo antes da fundação técnica.

**Decisão:** manter o nome provisório “Biblioteca Viva”; aprovar o primeiro ciclo emocional de `PRODUCT.md`, seus critérios de sucesso e o conjunto documental inicial; adotar uma biblioteca em visão superior, com referências gerais em Pokémon FireRed e Stardew Valley, sem copiar assets ou identidade dessas obras; usar retrato como orientação principal; adotar o Moto G06 como referência primária de testes, sem torná-lo alvo exclusivo; e incluir música ambiente discreta, som de interface, confirmação de cadastro, reação da estante e conclusão ou desbloqueio, com controles separados para música e efeitos.

**Consequências:** o Gate G0 está aprovado e o Bloco 1 pode começar pelo Prompt 1. A interface deve usar layout responsivo, respeitar safe areas e ser testada em diferentes dimensões, proporções e densidades de tela. O aplicativo deve permanecer compatível com diferentes celulares Android; o Moto G06 é um dispositivo principal de validação, não uma restrição de compatibilidade.

## D-013 — Fundação técnica mínima na raiz

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o Prompt 1 precisa tornar o repositório executável sem antecipar a arquitetura ou reformatar a documentação existente.

**Decisão:** manter um único pacote npm privado na raiz, com React 19, Vite 8 e TypeScript 6 estrito; separar as configurações TypeScript de aplicação, ferramentas Node e testes; usar ESLint 10 com configuração flat, Prettier limitado a código e arquivos técnicos, e Vitest 4 com Testing Library e jsdom. Não criar alias enquanto os imports relativos permanecerem simples.

**Consequências:** a fundação pode ser executada, testada e gerada como build web; a documentação Markdown fica fora do formatador automático; camadas e aliases serão adicionados somente quando houver uso concreto. A versão `0.0.0` identifica o pacote privado ainda não lançado e não representa uma release do produto.

## D-014 — Roteamento e navegação responsiva do shell

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o Prompt 2 requer cinco áreas navegáveis e uma adaptação responsiva sem duplicar sistemas de navegação nem antecipar funcionalidades.

**Decisão:** usar React Router DOM `7.18.1` em modo declarativo SPA, com uma única tabela tipada de rotas; usar o mesmo elemento `nav` como barra inferior no mobile e barra lateral a partir de 768 px; e manter design tokens e estilos do shell em CSS simples global enquanto a apresentação ainda é pequena.

**Consequências:** caminhos, títulos e links são definidos em um só lugar; a rota ativa recebe `aria-current`, contraste e sublinhado; safe areas e altura dinâmica são tratadas por CSS; e componentes ou CSS Modules só serão separados quando responsabilidades reais justificarem. O `npm audit` atual informa um advisory alto do React Router ligado ao modo RSC, não usado por este SPA; a dependência deve ser atualizada assim que existir uma versão corrigida compatível, sem habilitar RSC ou ações de servidor antes disso.

## D-015 — Testes físicos concentrados em gates decisivos

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o isolamento entre dispositivos imposto pelo roteador exige um túnel HTTPS Cloudflare para acessar pelo smartphone o servidor web de desenvolvimento. O shell já pode ser validado com dimensões móveis no modo responsivo do navegador e por teclado.

**Decisão:** concentrar testes físicos nos gates de maior valor, especialmente quando envolverem Android, persistência nativa, toque, desempenho ou release. No shell, usar “Ajustes” como rótulo compacto deliberado da seção cuja rota é `/configuracoes` e cujo título completo é “Configurações”.

**Consequências:** o Gate G1 pode ser aprovado sem teste físico pelo navegador; o Gate G2, por meio do APK Android, será a primeira validação física obrigatória. G2, G3, G6, G9 e G11 são os principais pontos de teste em smartphone.

## D-016 — Capacitor 8 e identidade Android provisória estável

- **Data:** 2026-07-28
- **Status:** aceita

**Contexto:** o Prompt 3 exige uma versão estável compatível com Node 24, Vite, React, JDK 21 e o ambiente Android instalado, além de comportamento explícito para o botão Voltar.

**Decisão:** instalar versões estáveis exatas `@capacitor/core`, `@capacitor/cli` e `@capacitor/android` `8.4.2`, com o plugin oficial `@capacitor/app` `8.1.1`; usar configuração TypeScript, `appId` provisório estável `com.samuelfrancisco.bibliotecaviva`, `appName` “Biblioteca Viva” e `webDir` `dist`. O plugin App existe somente para o botão Voltar e o ciclo básico futuro: em rota interna usa o histórico ou retorna à Biblioteca quando não houver entrada anterior; na raiz encerra sem confirmação. Não bloquear orientação neste prompt.

**Consequências:** Node 24.18.0 atende ao requisito oficial Node 22+, Android Studio 2026.1.2 supera o mínimo 2025.2.1 e o scaffold usa JDK 21, SDK 36 e API mínima 24. O mesmo build Vite serve web e Android; `android/` e seu Gradle Wrapper são versionados, enquanto builds, APKs, propriedades locais e chaves permanecem ignorados. A orientação principal aprovada continua retrato, mas o manifesto gerado permite rotação até decisão posterior.

## D-017 — Domínio inicial de livros e Zod nas fronteiras

- **Data:** 2026-07-29
- **Status:** aceita; política de início/conclusão exclusivamente explícita substituída por D-040

**Contexto:** o Prompt 4 exige regras puras antes de formulários, casos de uso ou banco. O modelo conceitual anterior listava estados e campos sem fluxo atual equivalente.

**Decisão:** instalar Zod `4.4.3` como dependência exata para validar dados `unknown` nas fronteiras e produzir entradas tipadas. Zod valida estrutura, tipos e normalização textual segura; factories e operações continuam responsáveis por invariantes do domínio, inclusive relações entre progresso, total, status, datas e revisão. O domínio usa somente `planned`, `in_progress`, `paused`, `completed` e `abandoned`; `not_started` é absorvido por `planned`, e `archived` aguarda uma política própria. Avaliações são inteiros de 1 a 5. Chegar à última página não conclui automaticamente; conclusão é explícita e idempotente quando repetida.

**Consequências:** `LibraryEntry` aceita somente `BookEntry` no protótipo; tags, favorite, location e exclusão lógica ficam fora do contrato atual. Reabrir um concluído exige transição para `in_progress` antes de reduzir progresso. Eventos omitem conteúdo pessoal e ainda não possuem bus ou persistência. Zod não torna entidades válidas por si só nem passa a ser dependência das regras internas.

## D-018 — Portas e ordem dos efeitos da aplicação

- **Data:** 2026-07-29
- **Status:** aceita

**Contexto:** o Prompt 5 precisa coordenar o domínio sem escolher armazenamento. `AddQuote` exige persistência própria, embora o plano original cite apenas `NoteRepository`.

**Decisão:** definir portas assíncronas pequenas para `LibraryEntryRepository`, `NoteRepository`, `QuoteRepository`, `ActivityRepository`, `IdGenerator`, `Clock` e `ApplicationEventBus`. `QuoteRepository` permanece separado porque `Quote` é entidade explícita e escondê-la em `NoteRepository` criaria um contrato falso; não haverá superporta genérica de anotações. Casos de escrita seguem validação, carga, domínio, persistência da entidade, atividade e evento. A publicação ocorre somente depois das gravações obrigatórias. Nenhuma implementação concreta ou regra de ordenação de lista é escolhida; `ListBookEntries` preserva a ordem fornecida pelo repositório.

**Consequências:** adapters, UUID real, relógio real, Dexie e composition root ficam para o Prompt 6. Antes dele, escrita da entidade e atividade não é atômica: falha posterior é reportada por código específico, mas não desfaz gravação anterior. Os futuros adapters Dexie deverão fornecer transação para dados persistentes. Atividades e eventos guardam IDs e metadados mínimos, nunca título, autor ou conteúdo de anotação.

## D-019 — Persistência Dexie, transações e adapters de plataforma

- **Data:** 2026-07-29
- **Status:** aceita

**Contexto:** o Prompt 6 precisa materializar as portas sem vazar IndexedDB para aplicação, domínio ou React e provar migrações e rollback em Node.

**Decisão:** usar Dexie `4.4.4` sobre o banco estável `biblioteca-viva` e `fake-indexeddb` `6.2.5` somente em desenvolvimento/testes. O schema possui tabelas próprias para `libraryEntries`, `notes`, `quotes`, `activities`, `settings` e `metadata`; Quote permanece própria por corresponder à porta já aprovada. A listagem de livros usa a ordem técnica determinística `createdAt` crescente e `id` como desempate, sem definir a ordenação futura da interface. Registros externos são validados ao ler.

`ApplicationTransactionRunner` delimita uma unidade que confirma entidade/anotação e atividade juntas. O `LocalEventBus` publica somente após o commit; sua falha é reportada sem alegar rollback dos dados confirmados e sem outbox nesta etapa. Clock usa `Date` apenas no adapter, IDs usam `crypto.randomUUID`, e `navigator.storage.persist` fica atrás de uma abstração que retorna `unsupported`, `granted`, `denied` ou `error` sem bloquear o aplicativo.

**Consequências:** a versão 1 do banco contém as quatro tabelas operacionais e a versão 2 acrescenta configurações/metadados com marcador técnico idempotente. Dexie não vaza pelas portas. Armazenamento persistente é uma solicitação, não garantia; IndexedDB não é criptografado pelo app. Exclusão, arquivamento, outbox e backup continuam adiados.

## D-020 — Consulta em memória e Arquivo de anotações

- **Data:** 2026-07-30
- **Status:** aceita

**Contexto:** o Prompt 9 precisa consultar aproximadamente 100 livros e algumas centenas de anotações sem introduzir busca full-text, paginação, cache global ou N+1.

**Decisão:** carregar cada conjunto uma vez por montagem e derivar busca, filtro e ordenação em memória; guardar controles consultáveis em parâmetros de URL; definir Arquivo como consulta global de notas e citações, não como arquivamento de livros; e compor anotações com um mapa dos livros carregados em lote.

**Consequências:** digitação não consulta IndexedDB, escolhas visuais não alteram domínio ou ordem persistida, a sessão pode ser restaurada pelos links e não há mudança de schema. A estratégia será reavaliada somente com medição de degradação ou volume que justifique busca textual avançada.

## D-021 — Backup v1, replace-only e endurecimento inicial

- **Data:** 2026-07-30
- **Status:** aceita

**Contexto:** o Prompt 10 precisa recuperar dados pessoais sem conta, nuvem, migração de schema ou falsa promessa de segurança.

**Decisão:** exportar `libraryEntries`, `notes`, `quotes`, `activities` e `settings` em JSON v1 estrito; excluir `metadata` técnico; usar SHA-256 sobre JSON canônico como detector não criptográfico; aceitar somente `replace`, precedido por backup de segurança em base não vazia; entregar por Web Share quando suportado e Blob/download como fallback, sem plugin Capacitor novo. Adotar CSP por meta tag e Error Boundary sem limpeza automática.

**Consequências:** mescla fica fora por não haver política segura para IDs, revisões, remoções, atividades e preferências. O arquivo é legível e sua guarda é externa. Não há mudança do banco v2, dependência ou permissão Android; o WebView permanece para validação humana do G5.

## D-022 — Phaser 3 lazy e host React proprietário

- **Data:** 2026-07-31
- **Status:** aceita

**Contexto:** o Prompt 11 introduz a estrutura visual sem permitir que um motor de cena se torne dono da aplicação de dados ou do carregamento inicial.

**Decisão:** instalar `phaser` `3.90.0`, a última versão publicada da linha 3, como única dependência nova. Carregar o módulo apenas por `import()` ao montar a área Biblioteca. Um host React isolado possui o container, a instância, observação de tamanho, pausa/retomada por visibilidade, destruição e fallback; contratos mínimos permanecem livres de Phaser, Dexie e entidades persistidas. O diagnóstico é injetável e renderizado somente em desenvolvimento. Não adicionar plugin Capacitor nem permissão Android neste prompt.

**Consequências:** a Coleção segue como acesso convencional aos dados pessoais mesmo em falha de Canvas/WebGL. A cena inicial contém apenas geometria/texto estrutural e não recebe projeção de livros nem emite interação de produto; essa ponte continua reservada ao Prompt 12.

## D-023 — Zod sem JIT sob CSP estrita

- **Data:** 2026-07-31
- **Status:** aceita

**Contexto:** a validação manual do Prompt 11 identificou uma violação CSP no chunk principal. Source map temporário localizou `zod@4.4.3`, `v4/core/util.js`, cuja sonda opcional de JIT executa `const F = Function; new F("")`; Zod captura a exceção e usa parser interpretado, mas Firefox ainda registra a tentativa.

**Decisão:** configurar a API oficial `config({ jitless: true })` no entrypoint antes da composição. Manter `script-src 'self'` e não adicionar `unsafe-eval`. Alinhar o fundo CSS do host/canvas a `#d8c5a3`, igual ao `backgroundColor` do Phaser, para evitar a piscada preta trivial durante resize.

**Consequências:** a sonda continua presente no bundle transitivo, mas seu caminho é desativado antes de qualquer parse; não há patch em `node_modules`, alias, troca de versão ou custo de segurança. A validação de schemas perde somente a otimização JIT opcional.

## D-024 — Projeção resumida e determinística da Biblioteca

- **Data:** 2026-07-31
- **Status:** aceita

**Contexto:** o Prompt 12 precisa conectar a coleção persistida à cena sem transferir regras, banco ou conteúdo pessoal para Phaser.

**Decisão:** `LibraryProjectionService` recebe um input serializável mínimo e produz um `LibraryViewModel` imutável. A lotação usa `empty` para 0 livros, `initial` para 1–4, `growing` para 5–14 e `full` para 15 ou mais. Esses estados renderizam, respectivamente, 0, 2, 5 e no máximo 8 grupos de lombadas, inclusive para coleções grandes. O livro recente é o maior `updatedAt`, com ID lexicograficamente crescente como desempate; o marco existe quando há ao menos um status `completed` atual.

**Consequências:** React consulta e possui painel/navegação; Phaser recebe atualizações do modelo na mesma instância e emite uma união de interações mínima. Somente `ShelfSelected` é conectado funcionalmente agora. `LibrarianSelected`, `CreatureSelected` e `HighlightedBookSelected` permanecem contratos sem fluxo de produto até o Prompt 13. Não há plugin ou permissão Android adicional.

## D-025 — Sala procedural pequena e movimento determinístico

- **Data:** 2026-07-31
- **Status:** aceita

**Contexto:** o Prompt 13 precisa tornar a primeira sala reconhecível sem assets próprios licenciados disponíveis e sem antecipar produção artística final.

**Decisão:** usar gráficos procedurais internos com fallback independente para todos os elementos essenciais. A bibliotecária usa deslocamento vertical de quatro unidades lógicas em tween lento; a criatura percorre horizontalmente uma área explícita. Ambos usam fase normalizada, easing senoidal, `yoyo` e repetição infinita. Resize idêntico não reconcilia movimento, resize no mesmo modo apenas remapeia a fase e a troca regular/compacto substitui um único conjunto. O livro recente pode receber uma pulsação discreta; e a iluminação usa círculos translúcidos estáticos. A câmera permanece fixa. React possui e coordena os painéis; Phaser somente desenha, anima estado transitório e emite interações.

**Consequências:** a sala limita-se a aproximadamente 32 display objects, três tweens, sete texturas próprias opcionais e oito grupos de lombadas, inclusive com cem livros. Não há partículas, shader, pós-processamento, física complexa, pathfinding, joystick, áudio, diálogo ramificado ou acesso ao banco. Movimento reduzido conserva a composição estática sem tweens repetitivos.

## D-026 — Entrega nativa explícita de backup no Android

- **Data:** 2026-08-03
- **Status:** aceita

**Contexto:** no Moto G06, Web Share/fallback de download dentro da WebView não abriu uma interface nativa nem produziu arquivo externo localizável, embora a aplicação anunciasse entrega.

**Decisão:** adicionar somente `@capacitor/filesystem` `8.1.2` e `@capacitor/share` `8.0.1`, da mesma versão principal do Capacitor. No Android, escrever o JSON final em UTF-8 em `Directory.Cache`, compartilhar a URI retornada, aguardar o encerramento do fluxo e então remover o temporário. Manter o adapter web independente e não afirmar destino ou salvamento permanente que a API não comprova.

**Consequências:** não há permissão ampla de armazenamento nem pasta privada apresentada como Downloads. Cancelamento é distinguido quando o plugin informa; fechamento da folha exige confirmação manual do arquivo externo. Falha de limpeza posterior é secundária e sanitizada.

## D-027 — Rolagem vertical e seleção curta no canvas

- **Data:** 2026-08-03
- **Status:** aceita

**Contexto:** Phaser 3.90.0 capturava toque por padrão e chamava `preventDefault()`, prendendo o gesto vertical sobre uma área extensa da tela.

**Decisão:** configurar `input.touch.capture: false`, aplicar `touch-action: pan-y` ao host e canvas e reconhecer seleção somente entre `pointerdown` e `pointerup` com deslocamento máximo de 12 px. Arraste, `pointercancel`, saída e destroy cancelam a seleção.

**Consequências:** rolagem vertical volta a pertencer ao navegador; mouse e toques curtos preservam as áreas interativas; um gesto válido emite uma única interação sem delay perceptível.

## D-028 — Exclusão permanente transacional com confirmação inline

- **Data:** 2026-08-03
- **Status:** aceita

**Contexto:** o detalhe não oferecia exclusão, e chamadas independentes poderiam deixar anotações ou atividades órfãs.

**Decisão:** expor `DeleteBookEntry` pela aplicação e uma única operação de `BookDeletionStore`. O adapter Dexie remove livro, notas, citações e atividades relacionadas na mesma transação. A interface apresenta seção destrutiva separada, título, perdas associadas, cancelamento e confirmação inline acessível.

**Consequências:** React não acessa Dexie, Phaser não recebe exclusão, falhas fazem rollback e mantêm a tela utilizável. Não há evento artificial, migração ou alteração de schema.

## D-029 — Salvar e compartilhar backup são operações distintas

- **Data:** 2026-08-05
- **Status:** aceita

**Contexto:** a folha Share foi validada no Moto G06 e exibiu o JSON, mas não ofereceu gerenciador de arquivos nem escolha explícita de Downloads ou Documentos. Compartilhar não comprova salvamento permanente.

**Decisão:** preservar Cache + Share para “Compartilhar backup” e criar “Salvar backup no dispositivo” com um plugin Capacitor Android local mínimo. O salvamento usa Storage Access Framework com `ACTION_CREATE_DOCUMENT`, `CATEGORY_OPENABLE`, MIME `application/json`, nome sugerido e escrita UTF-8 por `ContentResolver` somente na URI escolhida pelo usuário. Não solicitar permissão ampla nem prometer localização não confirmada.

**Consequências:** save e share têm portas, resultados e mensagens próprios; cancelamento do seletor é normal; o plugin não lê, lista ou apaga arquivos e não expõe URI ao TypeScript. O navegador permanece em Web Share ou Blob/download.

**Evidência posterior:** o fluxo atual de segurança pré-restauração por Share foi validado no Moto G06: cancelar a folha bloqueia a restauração, enquanto compartilhar e confirmar a cópia no Drive permite continuar. Oferecer também “Salvar no dispositivo” para esse backup de segurança pode tornar a experiência mais uniforme no futuro, mas não é falha aberta nem bloqueador do fluxo atual.

## D-030 — Rodinha do mouse pertence à página sobre o canvas

- **Data:** 2026-08-05
- **Status:** aceita

**Contexto:** `touch.capture: false` e `pan-y` resolveram o Android, mas a roda continuava bloqueada quando o cursor estava sobre o canvas porque o Config do Phaser 3.90.0 usa `preventDefaultWheel: true` por padrão.

**Decisão:** configurar `input.mouse.preventDefaultWheel: false`, mantendo mouse habilitado, toque sem captura, `pan-y` e a política de 12 px. Não adicionar listener manual, rolagem simulada ou `preventDefault` na aplicação.

**Consequências:** o navegador processa a roda, enquanto clique, toque, lifecycle, layouts e canvas único continuam no mesmo caminho.

## D-031 — Sala visual dominante é intenção futura

- **Data:** 2026-08-05
- **Status:** aceita como base da revisão R3; ampliada por D-042

**Contexto:** o cartão atual cumpriu a validação estrutural, mas a intenção do produto é dar à sala visual a maior parte da tela inicial.

**Decisão:** avaliar em etapa futura de UX e direção visual uma área principal ou quase inteira para o canvas e painéis sobrepostos semelhantes a bottom sheets, preservando navegação inferior e Coleção convencional.

**Consequências:** esta rodada não implementa fullscreen, bottom sheet, câmera, navegação ou reorganização geral e não antecipa Bloco 7 ou Prompt 14.

## D-032 — Web Audio nativo atrás de AudioPort

- **Data:** 2026-08-06
- **Status:** aceita; fallback procedural sonoro substituído por D-033

**Contexto:** o Prompt 14 precisa de um loop musical, três efeitos curtos, volumes independentes, mute, desbloqueio por gesto e lifecycle web + Capacitor. O repositório não possui assets sonoros finais licenciados. Howler.js ofereceria uma API conveniente e compatibilidade adicional, mas acrescentaria dependência e outro lifecycle sobre capacidades já presentes no Chromium/WebView Android.

**Decisão:** usar Web Audio nativo atrás de `AudioPort`, com um `AudioService` proprietário da intenção musical, handles e preferências, e um `BrowserAudioBackend` substituível. Manter cues em manifesto com IDs/categorias estáveis, lista de fontes intercambiável e fallback procedural interno enquanto não houver arquivos licenciados. Persistir `audio.preferences.v1` na tabela `settings` v2 existente, sem migração. Centralizar gesto, navegação e lifecycle em um hook React; transformar a interação Phaser em intenção somente no host React; e ligar `LibraryEntryCompleted` ao áudio no composition root depois do commit.

**Consequências:** nenhuma dependência, plugin, permissão ou arquivo de mídia foi adicionado. O contexto só nasce após gesto; falhas degradam para síntese ou silêncio; mute e pause interrompem canais; e a música não duplica em retomada/remontagem. Os fallbacks procedurais são provisórios, o loop reinicia após resume e os testes físicos no Moto G06 continuam obrigatórios. Howler.js permanece alternativa futura somente se testes reais demonstrarem lacuna concreta; a troca fica contida no backend atrás da porta.

## D-033 — WAVs próprios e silêncio como fallback sonoro

- **Data:** 2026-08-07
- **Status:** aceita

**Contexto:** a primeira validação física do Prompt 14 reprovou o drone procedural como música, o timbre dos efeitos, o unlock percebido como dependente do canvas e a ausência de sons na bibliotecária/criatura. A cadeia `AudioPort → AudioService → manifesto → WebAudioBackend` e volumes/lifecycle funcionaram e não devem ser substituídos.

**Decisão:** gerar local e deterministicamente seis WAVs PCM mono com Node padrão: uma progressão harmônica curta e cinco efeitos suaves. O manifesto passa a possuir caminhos reais para música, interface, estante, bibliotecária, criatura e conclusão. Toda falha de arquivo degrada para playback silencioso; remover osciladores audíveis do backend. Capturar o primeiro `pointerdown` em `document` ou `keydown` não modificador, remover os listeners antes de chamar a inicialização idempotente e manter Phaser restrito a interações tipadas.

**Consequências:** o APK cresce aproximadamente 0,8 MiB antes de compressão ZIP, sem dependência, plugin, permissão ou licença externa. WAV favorece geração auditável e substituição simples, mas poderá ser comprimido após aprovação artística. Música ausente nunca volta ao drone. A limitação de reiniciar o loop após resume permanece. Prompt 14 e G7 continuam abertos até nova validação humana.

## D-034 — Checkpoints técnicos e validação humana integrada

- **Data:** 2026-08-10
- **Status:** aceita

**Contexto:** o protótipo já possui ampla cobertura automática e builds Android frequentes. Repetir validações manuais completas a cada prompt tornou-se custo operacional sem benefício proporcional para mudanças locais e reversíveis. A primeira validação humana do Prompt 14 permanece reprovada; sua correção passou tecnicamente, mas ainda não recebeu aprovação humana.

**Decisão:** adotar modo acelerado. Cada prompt continua exigindo testes relevantes, formatação, lint, typecheck, build web, barreiras arquiteturais, verificação Git e Android quando o código for empacotado. Após esses checks e documentação honesta, um commit pode registrar checkpoint técnico sem aprovar prompt ou gate. Validações manuais repetitivas de navegador e Android para G7, G8 e G9 serão acumuladas em checkpoint integrado próximo ao final do protótipo.

**Consequências:** Prompt 14 pode receber checkpoint técnico e o Prompt 15 pode começar, enquanto Prompt 14 e G7 permanecem abertos. O mesmo vale para avanço técnico posterior rumo ao Prompt 16 após revisão automática/documental. Itens manuais não executados continuam pendentes. A política não adia validação em mudanças com risco de perda/corrupção, migração destrutiva, backup/restauração, exclusão de dados ou alteração nativa capaz de impedir a abertura.

## D-035 — Conteúdo local validado e histórico mínimo em settings

- **Data:** 2026-08-10
- **Status:** aceita

**Contexto:** o Prompt 15 precisa retirar falas contextuais do React/Phaser, selecionar conteúdo sem repetição irritante e preparar localização/primeira conclusão sem criar CMS, IA, motor de marcos ou nova versão do banco.

**Decisão:** manter catálogo declarativo validado por Zod em `src/content/`, com `pt-BR` inicial e fallback determinístico próprio, sem biblioteca de internacionalização. `DialogueSelector` permanece puro na aplicação e recebe evento, fatos agregados, histórico e instante. A política usa condições, prioridade, `once`, cooldown, uso menos recente e desempate lexicográfico. `DialogueService` orquestra seleção/localização e `DexieDialogueHistoryRepository` persiste `dialogue.history.v1` na tabela `settings` v2 existente.

**Consequências:** não há schema, migração, dependência, serviço remoto ou acesso Dexie por React/Phaser. O histórico guarda apenas IDs e instantes mínimos, entra no backup por meio de settings e falha de forma degradável. O evento `book.first-completed` e a fala correspondente ficam reutilizáveis pelo Prompt 16, mas nenhum marco, recompensa ou desbloqueio é executado agora. Adicionar fala exige principalmente editar catálogo e locale. Prompt 15 e G7 continuam sem aprovação humana.

## D-036 — Marcos transacionais, schema v3 e backup v2 monotônico

- **Data:** 2026-08-10
- **Status:** aceita

**Contexto:** o Prompt 16 exige histórico auditável, recompensa idempotente, concorrência segura, exclusão sem perda de desbloqueio e restauração compatível. Um único valor em `settings` exigiria read-modify-write concorrente e esconderia registros históricos/recompensas em uma tabela de preferências. Derivar para sempre a primeira conclusão dos livros atuais apagaria o marco ao retomar ou excluir o livro.

**Decisão:** adicionar a tabela `milestones` no schema Dexie v3, com chave primária pelo ID estável e índice `reachedAt`. O `MilestoneEngine` puro avalia definições declarativas; `DexieMilestoneStore` executa dentro da mesma transação da ação/atividade e usa `add` para conceder uma vez. Somente depois do commit são publicados o evento original e `MilestoneReached`. Persistir origem técnica mínima, versão da regra e recompensas, sem FK obrigatória ao livro nem conteúdo pessoal. Usar a luminária de leitura procedural `decoration.reading-lamp` como única recompensa visual.

Evoluir o backup para formato v2 incluindo `milestones`, aceitando v1 com seu checksum/estrutura originais. Manter `replace` para livros, notas, citações, atividades e settings, mas aplicar união monotônica por ID aos marcos. Essa exceção estreita refina D-021: uma restauração nunca apaga marco legítimo já presente, restauração repetida é idempotente e v1 em base limpa não inventa recompensa. Importação não publica eventos de conquista.

**Consequências:** bancos v1/v2 migram de forma aditiva para v3 e reabrem preservados; falha de marco aborta a ação antes de qualquer anúncio; eventos equivalentes/concorrentes não duplicam recompensa; recarga e reconstrução apenas leem estado; exclusão/retomada pode zerar o fato atual `hasCompletedBook` sem remover `hasFirstCompletionMilestone` ou a luminária. Há mudança de schema e formato de backup, mas nenhuma dependência, permissão, asset binário ou versão de produto. G7 e G8 continuam abertos até validação humana integrada.

## D-037 — Preferência de experiência única e canvas complementar

- **Data:** 2026-08-10
- **Status:** aceita

**Contexto:** o Prompt 17 precisa combinar `prefers-reduced-motion`, escolha explícita, contraste e escala textual sem duplicar áudio, persistência ou regras dentro de React/Phaser. O canvas já lia media query diretamente apenas na criação, e bibliotecária/criatura não possuíam acionadores React permanentes fora dele.

**Decisão:** persistir `experience.preferences.v1` em `settings` v3, separado de `audio.preferences.v1`, com movimento `system | reduce | normal`, alto contraste booleano e texto `default | large | larger`. `system` é o default. `ExperiencePreferencesService` mantém estado de sessão, persistência e subscribers; a aplicação resolve o valor efetivo com a media query e entrega booleano mínimo ao host. Phaser troca seu plano de movimento na instância existente, sem consultar browser/settings. A Biblioteca mantém uma alternativa React permanente com resumo e equivalentes para estante, bibliotecária, criatura e Coleção.

**Consequências:** não há schema, migração, formato novo de backup, dependência ou plugin. Settings entra automaticamente no backup v2 e validação estrita faz valores inválidos/futuros degradarem para defaults. Alto contraste reutiliza tokens e texto usa escalas controladas; não há tema arbitrário nem zoom do canvas. Leitores de tela operam sobre React, não sobre objetos Phaser. A automação não equivale a conformidade WCAG nem aprovação de G9; G7–G9 continuam abertos.

## D-038 — Diagnóstico próprio e Phaser lazy sem split artificial

- **Data:** 2026-08-11
- **Status:** aceita

**Contexto:** o Prompt 18 precisa provar estabilidade repetida e explicar o aviso de chunk acima de 500 kB sem enumerar internals do navegador ou otimizar por intuição.

**Decisão:** ampliar a central de diagnóstico existente somente em desenvolvimento/build interno para contar recursos que o host, a cena e o `AudioService` possuem; amostrar a cena uma vez por segundo apenas nesse modo; gerar o manifesto Vite; e validar por script que `createPhaserGame` continua dynamic entry. Manter Phaser em um único chunk lazy e os WAVs locais atuais enquanto não houver evidência física de gargalo.

**Consequências:** produção normal não cria painel nem polling; cleanup zera contadores próprios; a prova de 20 ciclos e o manifesto substituem alegações subjetivas. O aviso de 1,22 MB do Phaser permanece visível e documentado, pois split manual não reduziria bytes ou trabalho total ao entrar na Biblioteca. Não há dependência, schema, backup, permissão, asset ou versão nova. G9 permanece aberto.

## D-039 — Playwright Chromium e CI web mínima

- **Data:** 2026-08-11
- **Status:** aceita

**Contexto:** a cobertura unitária/integrada é ampla, mas não provava IndexedDB, navegação, download/upload e recarga no navegador real. G10 também exige instalação reproduzível e CI sem antecipar release Android.

**Decisão:** adicionar `@playwright/test` `1.62.1` fixado, Chromium único, `vite preview` controlado em 4173 e quatro E2E críticos. Isolar cada cenário limpando IndexedDB apenas da origem de teste via CDP, sem endpoint no produto. Configurar GitHub Actions em Ubuntu 24.04/Node 22 com actions oficiais, permissões `contents: read`, `npm ci` e checks web completos. Manter Android debug como barreira local.

**Consequências:** o navegador é instalado explicitamente; traces/resultados são ignorados; fixtures não contêm dados pessoais. CI não possui secrets, keystore, assinatura ou publicação. Android CI poderá ser revista se regressões nativas justificarem o custo. Workflow hospedado depende de push. Prompt 19 e G10 não são aprovados por esta decisão.

## D-040 — Progresso dirige início e conclusão

- **Data:** 2026-08-13
- **Status:** aceita; substitui D-017 somente quanto ao início/conclusão exclusivamente explícitos

**Contexto:** o uso físico no Moto G06 mostrou que exigir ações separadas para iniciar ou concluir uma leitura repete informação já expressa pelo progresso.

**Decisão:** ao atualizar um livro `planned` para `currentPage > 0`, mudar automaticamente para `in_progress` e registrar início pela política temporal do domínio quando ausente. Com `totalPages` conhecido e `currentPage == totalPages`, mudar automaticamente para `completed` reutilizando a cadeia existente de domínio, transação, evento, marco idempotente, áudio, diálogo, projeção e feedback React. Sem total, permitir início por progresso, mas não calcular porcentagem nem concluir automaticamente. Não ampliar `paused` ou `abandoned`.

**Consequências:** R1-A implementou a decisão sem criar um segundo caminho de conclusão nem persistir porcentagem. A barra e páginas restantes são derivadas; `UpdateBookProgress` e a conclusão explícita compartilham a mesma operação de persistência, milestone e publicação pós-commit.

## D-041 — Refinamento separado do plano original

- **Data:** 2026-08-13
- **Status:** aceita

**Contexto:** os Prompts 1–19 foram tecnicamente implementados, e o primeiro uso integrado revelou trabalho posterior que não fazia parte do plano original.

**Decisão:** preservar `EXECUTION_PLAN.md` como histórico dos 11 blocos e 19 prompts e usar `REFINEMENT_PLAN.md` como documento operacional de R1, R2, R3 e do checkpoint posterior. Não criar retroativamente “Prompt 20”.

**Consequências:** roadmap e status distinguem implementação técnica, refinamento e aprovação de gate. A observação de 2026-08-13 não aprova G4 ou G7–G10, e G11 continua não iniciado.

## D-042 — UX/Layout v2 e tema escuro coerente

- **Data:** 2026-08-13
- **Status:** aceita; amplia D-031

**Contexto:** no Moto G06, excesso de superfícies e texto, hierarquia fraca e canvas secundário confirmaram que a apresentação estrutural não atende ao produto final. Movimento reduzido totalmente estático também pareceu congelamento.

**Decisão:** realizar em R3 um redesign amplo com redução agressiva de densidade, Biblioteca visual protagonista e tema escuro baseado em sistema coerente de superfícies, iluminação, texto, foco, estados e contraste. Evoluir a sala dominante prevista em D-031 com informação progressiva e painéis contextuais, preservando navegação inferior e alternativa React acessível sem dominância visual.

**Consequências:** não é troca cosmética de cores nem autorização para remover semântica, teclado, leitor de tela, alto contraste, escala textual, touch targets ou redução de movimento. Paleta final e solução de painéis dependem da rodada visual e de validação posterior.

## D-043 — Estado relevante da restauração e preparação musical pós-gesto

- **Data:** 2026-08-16
- **Status:** aceita

**Contexto:** o fluxo antigo sabia internamente se o snapshot estava vazio, mas a UI sempre apresentava backup de segurança obrigatório. A investigação do atraso sonoro mostrou que `LibraryEntered` já era independente do Phaser, enquanto o backend repetia fetch e decode do mesmo WAV em cada retorno.

**Decisão:** considerar funcionalmente vazio somente o destino sem livros, notas, citações, atividades, settings ou milestones; metadata técnica fica fora. Revalidar antes do replace e exigir estratégia explícita se dados surgirem após a inspeção. Em destino preenchido, permitir backup existente, confirmação adicional sem backup ou cancelamento. No áudio, preparar apenas a música local depois do unlock e cachear buffers por source durante o lifecycle do backend, limpando-os no dispose.

**Consequências:** não há schema, flag persistida, formato de backup, dependência, plugin, permissão, asset, timer ou autoplay novo. Settings e milestones contam porque seriam substituídos/perdidos segundo suas políticas reais; milestones continuam unidos monotonicamente. A primeira decodificação permitida ainda possui custo e a latência percebida no Moto G06 permanece evidência humana pendente.

## D-044 — Anotações mutáveis com histórico preservado e playlist sequencial

- **Data:** 2026-08-16
- **Status:** aceita

**Contexto:** R2 precisa editar/excluir/compartilhar notas e citações sem mudar schema nem duplicar criação, e permitir múltiplas músicas sem acoplar nomes de arquivo à apresentação. As atividades existentes registram somente criação e não são chaves estrangeiras obrigatórias. O backend de áudio não informava término natural ao serviço.

**Decisão:** editar preserva ID, livro e criação, incrementa revisão e não publica evento/marco de criação. Excluir remove somente a entidade após confirmação; atividades de criação e milestones permanecem como fatos históricos. Compartilhamento explícito usa uma porta da aplicação e o Share existente, com texto humano mínimo. Para áudio, validar manifesto e playlists ordenadas por cue ID; avançar pelo `completed` real do playback, proteger callbacks por geração e reiniciar no primeiro item ao sair da Biblioteca. Pause/mute preservam o índice, sem persistir offset.

**Consequências:** não há schema, migração, formato de backup, dependência, plugin, permissão, asset ou versão nova. Arquivo e detalhe atualizam estado local após commit sem N+1. Um asset musical forma playlist válida de um item; múltiplos itens e MP3 são provados por configurações de teste. Não existem shuffle, crossfade, streaming, posição persistida ou timer de duração.

Use `templates/ADR_TEMPLATE.md` para novas decisões.
