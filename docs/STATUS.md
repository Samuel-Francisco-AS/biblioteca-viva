# STATUS — Biblioteca Viva

> Última atualização: 2026-07-31
> Atualizar este arquivo ao começar e ao encerrar cada bloco relevante.

## Estado executivo

- **Fase:** aplicativo pessoal utilizável;
- **bloco concluído:** Bloco 5 — Integridade, backup e segurança inicial (checkpoint físico pendente);
- **prompt concluído:** Prompt 10 — backup, restauração, recuperação e endurecimento, validado no navegador em 2026-07-31;
- **implementação concluída:** Blocos 4 e 5;
- **trabalho atual:** checkpoint físico do G5 no Moto G06;
- **gate:** G3 aprovado por Sam em 2026-07-29; G4 permanece aberto por uso real prolongado e G5 permanece aberto pelo checkpoint físico;
- **versão:** `0.2.0-alpha.1`, marco do domínio, aplicação e persistência validados;
- **repositório:** Git inicializado;
- **branch ativa:** `main`;
- **APK:** APK diagnóstico interno do Prompt 6 validado no Moto G06 com Android 15, em `android/app/build/outputs/apk/debug/app-debug.apk`, SHA-256 `dec455d72ccba0eaf0b652d9c388097d53678da069bf3f78af73c3c90843c210`;
- **release Android:** ainda não existe APK release assinado nem artefato Android público;
- **plataforma alvo:** Android, com versão web para desenvolvimento;
- **aparelho principal de testes:** Moto G06, como referência primária de validação, sem restringir a compatibilidade;
- **compatibilidade:** diferentes celulares Android, proporções de tela, densidades e áreas seguras;
- **estado geral:** G0 a G3 aprovados; Prompts 7 a 10 e as implementações dos Blocos 4 e 5 concluídos; G4 e G5 permanecem abertos.

## Decisões já aprovadas

- uso pessoal real + qualidade de portfólio;
- experiência visual e sonora pertence ao núcleo;
- TypeScript estrito, React, Vite, Phaser, Capacitor, Dexie e Zod;
- arquitetura local-first e modular monolith;
- apenas livros no protótipo;
- uma sala, uma estante, uma bibliotecária e uma criatura;
- APK debug cedo e APK release assinado ao final;
- conta, backend e sincronização fora do protótipo.
- nome provisório “Biblioteca Viva” mantido;
- primeiro ciclo emocional de `PRODUCT.md` aprovado;
- biblioteca em visão superior, com referências gerais em Pokémon FireRed e Stardew Valley, sem copiar assets ou identidade;
- orientação principal em retrato, com layout responsivo para diferentes dispositivos Android;
- Moto G06 como aparelho principal de testes, não como alvo exclusivo;
- critérios de sucesso do protótipo e conjunto documental inicial aprovados;
- música ambiente discreta, som de interface, confirmação de cadastro, reação da estante e conclusão ou desbloqueio, com controles separados para música e efeitos.
- testes físicos concentrados em gates que envolvam Android, persistência nativa, toque, desempenho ou release; G2 será a primeira validação física obrigatória;
- “Ajustes” mantido como rótulo compacto deliberado para a seção e rota `/configuracoes`, cujo título completo é “Configurações”.

## Encerramento do G0

- [x] confirmar ou manter o nome provisório “Biblioteca Viva”;
- [x] aprovar o fluxo emocional descrito em `PRODUCT.md`;
- [x] definir referência visual inicial;
- [x] definir lista mínima de sons;
- [x] escolher e registrar o aparelho Android principal de testes;
- [x] confirmar critérios de sucesso do protótipo;
- [x] decidir orientação principal do APK como retrato;
- [x] aprovar o conjunto documental inicial.

## Trabalho atual

Executar o checkpoint físico do G5 no Moto G06. Depois dele, o próximo trabalho será o Prompt 11; ele ainda não foi iniciado.

## Bloqueios

Nenhum bloqueio técnico identificado.

## Última evidência de validação

Em 2026-07-31, o Prompt 10 foi concluído e validado no navegador. Backup JSON v1, SHA-256 canônico, limite de 10 MiB, inspeção sem escrita, `replace` exclusivo, backup de segurança e substituição transacional foram verificados. A restauração em origem isolada recuperou 4 livros, 1 nota, 2 citações e 21 atividades; Coleção e Arquivo consultaram os dados restaurados e a persistência sobreviveu à recarga e reabertura. Arquivo adulterado foi rejeitado sem alteração e a origem HTTP insegura recebeu orientação sem alegação de perda. A suíte automatizada passou com 256 testes em 22 arquivos. A implementação do Bloco 5 está concluída, mas G5 permanece aberto até a restauração física em instalação limpa no Moto G06; G4 segue aberto por uso real prolongado. A versão permanece `0.2.0-alpha.1` e o Prompt 11 não foi iniciado.

Em 2026-07-30, Sam validou o Prompt 9 no navegador. Busca por título e autor, normalização de caixa, espaços e acentos, filtros e combinações, as três ordenações, total desconhecido, estado sem resultado e limpeza dos controles funcionaram. A URL preservou os controles ao abrir livro, retornar e recarregar. O Arquivo global, pesquisas por conteúdo, livro e autor e o retorno Arquivo → livro → Arquivo preservaram a busca. O layout funcionou a partir de 320 px sem overflow horizontal aparente. Com 223 testes automatizados aprovados, o Prompt 9 e a implementação prevista do Bloco 4 estão concluídos.

O Gate G4 permanece aberto até cadastrar e manter ao menos dez livros reais, usar o aplicativo por alguns dias e confirmar que o uso normal dispensa console ou ferramentas de desenvolvimento. Essas pendências são não bloqueadoras para validar o Bloco 5. O checkpoint físico no Moto G06 foi transferido por decisão operacional para o encerramento do Bloco 5, junto à validação de backup, restauração e fluxos de arquivo; isso não representa defeito. A versão continua `0.2.0-alpha.1` e o Prompt 10 aguarda validação humana.

No encerramento técnico anterior, o Prompt 9 implementou busca normalizada por título e autor, filtro pelos cinco status reais e ordenação visual por atualização, título ou progresso. Os controles vivem na URL e são preservados ao abrir um livro e retornar. A rota Arquivo reúne notas e citações, pesquisa conteúdo e livro relacionado e preserva sua busca na navegação. Coleção e Arquivo carregam seus conjuntos uma vez e derivam resultados em memória; o Arquivo usa três consultas globais paralelas e um mapa por ID, sem N+1. A prova automatizada inclui 100 livros e a suíte completa passou com 223 testes. Não houve alteração de schema, migração, dependência ou versão.

Em 2026-07-30, Sam validou o Prompt 8 no navegador com registros reais já existentes no IndexedDB. Coleção, detalhes e edição bibliográfica funcionaram; progresso zero, intermediário e no limite foi aceito, enquanto valores negativos ou acima do total foram rejeitados. Conclusão, bloqueio de progresso no livro concluído, retomada, pausa e abandono funcionaram. Notas e citações com página válida ou sem página persistiram e atualizaram o histórico sem reload global; página de citação acima do total foi rejeitada. As alterações sobreviveram à atualização da página. O layout foi validado em 320 × 915 sem overflow horizontal aparente, inclusive com cartões, textos longos, formulários, rolagem e navegação inferior fixa utilizáveis. O teste físico no Moto G06 foi adiado por decisão operacional para o encerramento do Bloco 5; isso não representa falha. O Prompt 8 está concluído, a versão continua `0.2.0-alpha.1` e G4 permanece aberto.

No encerramento técnico do mesmo dia, o Prompt 8 substituiu os placeholders por uma Coleção real e um detalhe completo, ambos conectados à camada de aplicação. Progresso, transições de status, conclusão, retomada, notas e citações atualizam a interface local sem recarga global. Foram acrescentadas consultas por livro para notas e citações, com filtragem e ordenação no adapter Dexie, sem mudança de schema ou migração. Não foi implementado arquivamento porque o domínio ainda não possui política, campo persistente ou caso de uso aprovado. As 186 verificações automatizadas, formatação, lint, typecheck, build web, sincronização Android e APK debug passaram antes da validação humana.

Em 2026-07-30, Sam validou o Prompt 7 no navegador. O cadastro aceitou uma data histórica de início, salvou e redirecionou para um detalhe válido; a recarga do detalhe recuperou o registro persistido; e a edição carregou os dados salvos. Progresso, status e data de início permaneceram desabilitados na edição com explicação textual, conforme o contrato bibliográfico vigente. O diagnóstico do IndexedDB confirmou ao menos um registro em `libraryEntries` e sua atividade em `activities`. A Coleção ainda não lista livros porque essa implementação pertence ao Prompt 8. A instalação e validação deste APK no Moto G06 foram inicialmente adiadas para evitar instalações repetidas e agora integram o checkpoint do encerramento do Bloco 5; isso é uma decisão operacional, não defeito ou falha. O Prompt 7 está concluído, a versão permanece `0.2.0-alpha.1` e o Gate G4 continua aberto.

Em 2026-07-29, o Prompt 7 implementou cadastro e edição bibliográfica de livros por casos de uso, formulário React compartilhado e acessível, proteção contra envio duplicado, rotas internas de edição e detalhe mínimo e remoção da escrita diagnóstica temporária. A revisão anterior à validação manual corrigiu a semântica das datas reais de leitura: `startedAt` e `completedAt` podem anteceder a criação do registro, enquanto a conclusão não pode anteceder o início. O formato persistente não mudou. Formatação, lint, typecheck, 160 testes e build web passaram. Naquele encerramento técnico, a validação manual ainda estava pendente e G4 não foi aprovado.

Em 2026-07-29, Sam aprovou o Gate G3 e encerrou o Bloco 3. Os 140 testes automatizados, build web, sincronização Android, migração v1 → v2 e transações passaram. No navegador, o livro diagnóstico persistiu após recarga e reabertura do servidor e foi compartilhado corretamente entre duas abas da mesma origem. No Moto G06 com Android 15, o banco `biblioteca-viva` abriu na versão 2; livro, atividade e metadata mantiveram suas contagens após reabertura, reinício do aparelho e instalação de outro APK diagnóstico por cima. `navigator.storage.persist()` retornou `denied` sem bloquear o uso. Nenhum defeito bloqueador foi encontrado. O APK era interno e não existe APK release assinado.

Em 2026-07-29, o Prompt 5 implementou sete portas, seis comandos de escrita, duas consultas, atividades mínimas e erros públicos sem adapters concretos. Os 40 novos testes da aplicação rodaram em Node; junto aos 61 testes do domínio e oito React, os 109 testes passaram. A ordem de persistência e publicação e os cenários de falha foram validados com fakes exclusivos dos testes. O resultado aguarda revisão humana e não aprova G3, que depende do Prompt 6 e das provas de persistência.

Em 2026-07-29, o Prompt 4 implementou `LibraryEntry`/`BookEntry`, status e transições, progresso, notas, citações, erros tipados, schemas Zod e seis eventos sem persistência. Os 61 testes do domínio rodaram em Node sem DOM; junto aos oito testes React, os 69 testes passaram. Formatação, lint, typecheck, build web, sincronização Android e verificações Git também foram executados. O resultado aguarda revisão humana e não aprova o Gate G3, que depende dos Prompts 5 e 6 e dos testes de persistência.

Em 2026-07-28, o Prompt 2 foi concluído e validado: os oito testes automatizados, lint, typecheck, formatação e build passaram; Sam navegou manualmente pelas cinco rotas, testou dimensões móveis no modo responsivo, confirmou as navegações inferior e lateral, Tab, Enter, foco visível, link de salto e ausência de overflow horizontal. O G1 foi aprovado. A validação física não ocorreu e foi transferida para o G2, quando deverá ser feita com o primeiro APK Android.

Em 2026-07-28, o Prompt 3 integrou Capacitor 8.4.2, gerou e sincronizou `android/` e produziu um APK debug real com o Gradle Wrapper (`BUILD SUCCESSFUL`). Sam instalou o APK em um Moto G06 com Android 15 e validou primeira abertura sem tela branca, toque e navegação nas cinco áreas, indicação da opção ativa, histórico e encerramento pelo botão Voltar, minimizar/restaurar, remoção pelos recentes e reabertura, safe areas e ausência de overflow horizontal. Nenhum defeito bloqueador foi encontrado; Sam aprovou o G2 e concluiu o Bloco 2. Ainda não existe APK release assinado.
