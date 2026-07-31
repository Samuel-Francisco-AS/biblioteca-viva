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
- **Status:** aceita

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

Use `templates/ADR_TEMPLATE.md` para novas decisões.

## D-021 — Backup v1, replace-only e endurecimento inicial

- **Data:** 2026-07-30
- **Status:** aceita

**Contexto:** o Prompt 10 precisa recuperar dados pessoais sem conta, nuvem, migração de schema ou falsa promessa de segurança.

**Decisão:** exportar `libraryEntries`, `notes`, `quotes`, `activities` e `settings` em JSON v1 estrito; excluir `metadata` técnico; usar SHA-256 sobre JSON canônico como detector não criptográfico; aceitar somente `replace`, precedido por backup de segurança em base não vazia; entregar por Web Share quando suportado e Blob/download como fallback, sem plugin Capacitor novo. Adotar CSP por meta tag e Error Boundary sem limpeza automática.

**Consequências:** mescla fica fora por não haver política segura para IDs, revisões, remoções, atividades e preferências. O arquivo é legível e sua guarda é externa. Não há mudança do banco v2, dependência ou permissão Android; o WebView permanece para validação humana do G5.
