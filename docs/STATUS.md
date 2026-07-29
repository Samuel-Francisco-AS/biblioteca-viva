# STATUS — Biblioteca Viva

> Última atualização: 2026-07-28  
> Atualizar este arquivo ao começar e ao encerrar cada bloco relevante.

## Estado executivo

- **Fase:** domínio, casos de uso e persistência;
- **bloco concluído:** Bloco 2 — Prova Android antecipada;
- **prompt concluído:** Prompt 3 — concluído e validado fisicamente;
- **próximo bloco:** Bloco 3 — Domínio, casos de uso e persistência;
- **próximo trabalho:** Prompt 4 — Modelo de domínio de livros;
- **gate:** G2 aprovado por Sam;
- **versão:** `0.1.0`, marco documental e de pacote após a prova Android;
- **repositório:** Git inicializado;
- **branch ativa:** `main`;
- **APK:** debug validado no Moto G06 com Android 15, em `android/app/build/outputs/apk/debug/app-debug.apk`, SHA-256 `af45ac6ca5641b634560cf54bef60459b27fab0f367cd3d171e6c0a2fe2497fe`;
- **release Android:** ainda não existe APK release assinado nem artefato Android público;
- **plataforma alvo:** Android, com versão web para desenvolvimento;
- **aparelho principal de testes:** Moto G06, como referência primária de validação, sem restringir a compatibilidade;
- **compatibilidade:** diferentes celulares Android, proporções de tela, densidades e áreas seguras;
- **estado geral:** G0, G1 e G2 aprovados; Bloco 2 concluído com APK debug validado fisicamente; funcionalidades reais do produto ainda não iniciadas, e o Bloco 3 é o próximo.

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

Iniciar o Bloco 3 pelo Prompt 4 — Modelo de domínio de livros. Não antecipar os Prompts 5 e 6.

## Bloqueios

Nenhum bloqueio técnico identificado.

## Última evidência de validação

Em 2026-07-28, o Prompt 2 foi concluído e validado: os oito testes automatizados, lint, typecheck, formatação e build passaram; Sam navegou manualmente pelas cinco rotas, testou dimensões móveis no modo responsivo, confirmou as navegações inferior e lateral, Tab, Enter, foco visível, link de salto e ausência de overflow horizontal. O G1 foi aprovado. A validação física não ocorreu e foi transferida para o G2, quando deverá ser feita com o primeiro APK Android.

Em 2026-07-28, o Prompt 3 integrou Capacitor 8.4.2, gerou e sincronizou `android/` e produziu um APK debug real com o Gradle Wrapper (`BUILD SUCCESSFUL`). Sam instalou o APK em um Moto G06 com Android 15 e validou primeira abertura sem tela branca, toque e navegação nas cinco áreas, indicação da opção ativa, histórico e encerramento pelo botão Voltar, minimizar/restaurar, remoção pelos recentes e reabertura, safe areas e ausência de overflow horizontal. Nenhum defeito bloqueador foi encontrado; Sam aprovou o G2 e concluiu o Bloco 2. Ainda não existe APK release assinado.
