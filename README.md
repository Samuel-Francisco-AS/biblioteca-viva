# Biblioteca Viva

Biblioteca Viva é um aplicativo local-first para registrar livros, filmes, séries, estudos, atividades físicas e trabalho. A aplicação convencional e acessível é construída em React; a Biblioteca visual usa Phaser como projeção complementar de um mundo persistente.

## Estado atual

A rodada corretiva W3-A foi encerrada em 2026-09-06 e validada no Moto G06. O produto possui:

- seis tipos de registro, progresso, notas, citações, etiquetas, favoritos e sessões;
- estatísticas e histórico derivados localmente;
- estrutura persistente editável com pisos, paredes, cantos e porta horizontal;
- objetos posicionáveis separados da estrutura;
- progressão estrutural por sessões elegíveis, sem XP, moedas ou streaks;
- banco Dexie no schema v7 e backup no formato v5, com leitura dos formatos v1 a v4;
- aplicação Android via Capacitor e geração de APK debug.

A próxima etapa de produto ainda não foi escolhida. Estantes reativas, livros visuais ligados às atividades, livro aberto manipulável e um leitor em forma de livro são possibilidades registradas, não funcionalidades iniciadas.

## Limitações conhecidas

- A abertura inicial da Biblioteca ainda pode parecer lenta no Moto G06.
- O card de Resumo pode apresentar engasgo perceptível no aparelho.
- Desempenho físico não foi declarado resolvido pela aprovação de R6.
- A auditoria manual completa com TalkBack, a revisão final de áudio e a preparação de release assinado permanecem abertas.
- Não existem conta, backend, sincronização, nuvem, multiplayer, analytics ou porta vertical.

## Documentação

Comece em [`docs/README.md`](docs/README.md). O presente está em [`docs/STATUS.md`](docs/STATUS.md); documentos em `docs/history/` preservam contexto, mas não orientam trabalho novo.

## Verificação técnica

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run wall-assets:check
npm run build
npm run performance:report
npm run test:e2e
```

Para Android:

```bash
npm run android:sync
npm run android:build:debug
```

O APK debug esperado é `android/app/build/outputs/apk/debug/app-debug.apk`. Ele não é release, não é assinado para distribuição e não deve ser instalado automaticamente.
