# STATUS — Biblioteca Viva

> Última atualização: 2026-07-30
> Atualizar este arquivo ao começar e ao encerrar cada bloco relevante.

## Estado executivo

- **Fase:** aplicativo pessoal utilizável;
- **bloco concluído:** Bloco 3 — Domínio, casos de uso e persistência;
- **prompt concluído:** Prompt 7 — cadastro e edição validados no navegador em 2026-07-30;
- **bloco atual:** Bloco 4 — Aplicativo pessoal utilizável;
- **próximo trabalho:** Prompt 8 — Coleção, detalhes, progresso, notas e citações;
- **gate:** G3 aprovado por Sam em 2026-07-29; G4 permanece aberto;
- **versão:** `0.2.0-alpha.1`, marco do domínio, aplicação e persistência validados;
- **repositório:** Git inicializado;
- **branch ativa:** `main`;
- **APK:** APK diagnóstico interno do Prompt 6 validado no Moto G06 com Android 15, em `android/app/build/outputs/apk/debug/app-debug.apk`, SHA-256 `dec455d72ccba0eaf0b652d9c388097d53678da069bf3f78af73c3c90843c210`;
- **release Android:** ainda não existe APK release assinado nem artefato Android público;
- **plataforma alvo:** Android, com versão web para desenvolvimento;
- **aparelho principal de testes:** Moto G06, como referência primária de validação, sem restringir a compatibilidade;
- **compatibilidade:** diferentes celulares Android, proporções de tela, densidades e áreas seguras;
- **estado geral:** G0 a G3 aprovados; Prompt 7 concluído após 160 testes automatizados e validação humana no navegador; Bloco 4 continua em andamento e G4 permanece aberto.

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

Executar o Prompt 8 — Coleção, detalhes, progresso, notas e citações, sem antecipar busca, filtros ou Phaser. O Gate G4 permanece aberto.

## Bloqueios

Nenhum bloqueio técnico identificado.

## Última evidência de validação

Em 2026-07-30, Sam validou o Prompt 7 no navegador. O cadastro aceitou uma data histórica de início, salvou e redirecionou para um detalhe válido; a recarga do detalhe recuperou o registro persistido; e a edição carregou os dados salvos. Progresso, status e data de início permaneceram desabilitados na edição com explicação textual, conforme o contrato bibliográfico vigente. O diagnóstico do IndexedDB confirmou ao menos um registro em `libraryEntries` e sua atividade em `activities`. A Coleção ainda não lista livros porque essa implementação pertence ao Prompt 8. A instalação e validação deste APK no Moto G06 foram deliberadamente transferidas para um checkpoint posterior do Bloco 4 para evitar instalações repetidas; isso é uma decisão operacional, não defeito ou falha. O Prompt 7 está concluído, a versão permanece `0.2.0-alpha.1` e o Gate G4 continua aberto.

Em 2026-07-29, o Prompt 7 implementou cadastro e edição bibliográfica de livros por casos de uso, formulário React compartilhado e acessível, proteção contra envio duplicado, rotas internas de edição e detalhe mínimo e remoção da escrita diagnóstica temporária. A revisão anterior à validação manual corrigiu a semântica das datas reais de leitura: `startedAt` e `completedAt` podem anteceder a criação do registro, enquanto a conclusão não pode anteceder o início. O formato persistente não mudou. Formatação, lint, typecheck, 160 testes e build web passaram. Naquele encerramento técnico, a validação manual ainda estava pendente e G4 não foi aprovado.

Em 2026-07-29, Sam aprovou o Gate G3 e encerrou o Bloco 3. Os 140 testes automatizados, build web, sincronização Android, migração v1 → v2 e transações passaram. No navegador, o livro diagnóstico persistiu após recarga e reabertura do servidor e foi compartilhado corretamente entre duas abas da mesma origem. No Moto G06 com Android 15, o banco `biblioteca-viva` abriu na versão 2; livro, atividade e metadata mantiveram suas contagens após reabertura, reinício do aparelho e instalação de outro APK diagnóstico por cima. `navigator.storage.persist()` retornou `denied` sem bloquear o uso. Nenhum defeito bloqueador foi encontrado. O APK era interno e não existe APK release assinado.

Em 2026-07-29, o Prompt 5 implementou sete portas, seis comandos de escrita, duas consultas, atividades mínimas e erros públicos sem adapters concretos. Os 40 novos testes da aplicação rodaram em Node; junto aos 61 testes do domínio e oito React, os 109 testes passaram. A ordem de persistência e publicação e os cenários de falha foram validados com fakes exclusivos dos testes. O resultado aguarda revisão humana e não aprova G3, que depende do Prompt 6 e das provas de persistência.

Em 2026-07-29, o Prompt 4 implementou `LibraryEntry`/`BookEntry`, status e transições, progresso, notas, citações, erros tipados, schemas Zod e seis eventos sem persistência. Os 61 testes do domínio rodaram em Node sem DOM; junto aos oito testes React, os 69 testes passaram. Formatação, lint, typecheck, build web, sincronização Android e verificações Git também foram executados. O resultado aguarda revisão humana e não aprova o Gate G3, que depende dos Prompts 5 e 6 e dos testes de persistência.

Em 2026-07-28, o Prompt 2 foi concluído e validado: os oito testes automatizados, lint, typecheck, formatação e build passaram; Sam navegou manualmente pelas cinco rotas, testou dimensões móveis no modo responsivo, confirmou as navegações inferior e lateral, Tab, Enter, foco visível, link de salto e ausência de overflow horizontal. O G1 foi aprovado. A validação física não ocorreu e foi transferida para o G2, quando deverá ser feita com o primeiro APK Android.

Em 2026-07-28, o Prompt 3 integrou Capacitor 8.4.2, gerou e sincronizou `android/` e produziu um APK debug real com o Gradle Wrapper (`BUILD SUCCESSFUL`). Sam instalou o APK em um Moto G06 com Android 15 e validou primeira abertura sem tela branca, toque e navegação nas cinco áreas, indicação da opção ativa, histórico e encerramento pelo botão Voltar, minimizar/restaurar, remoção pelos recentes e reabertura, safe areas e ausência de overflow horizontal. Nenhum defeito bloqueador foi encontrado; Sam aprovou o G2 e concluiu o Bloco 2. Ainda não existe APK release assinado.
