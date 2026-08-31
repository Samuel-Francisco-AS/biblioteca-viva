# Biblioteca Viva

Biblioteca Viva é um aplicativo local-first para registrar livros, filmes, séries, estudos, atividades físicas e trabalho. React entrega as operações convencionais e acessíveis; a Biblioteca Phaser é uma projeção complementar carregada sob demanda.

## Estado

W3-A está tecnicamente concluída: a Biblioteca possui estrutura construída pelo usuário, pisos em células, paredes/cantos e porta exclusivamente horizontal, inventário físico e desbloqueios por sessões elegíveis. Dexie está no schema v7 e backup no formato v5, compatível com v1–v4. A validação física/artística, TalkBack, safe areas e desempenho percebido no Moto G06 continuam humanas e pendentes.

Estantes reativas, livros visuais vinculados a atividades, livro aberto manipulável e leitor em forma de livro são próximos slices W3; não estão implementados.

## Arquitetura

```text
dados Dexie → Application/Domain → LibraryViewModel → React host → Phaser
WorldStructureState (células/arestas) ── separado de ── PlacedObject
```

React e Phaser não acessam Dexie. Phaser não decide regras de construção ou progressão: consome projeções e emite interações tipadas. Há uma cena e um canvas; previews, seleção, pan e realces são efêmeros.

## Desenvolvimento

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

Para E2E local, instale Chromium uma vez com `npx playwright install chromium`.

## Android

```bash
npm run android:sync
npm run android:build:debug
```

O APK debug esperado é `android/app/build/outputs/apk/debug/app-debug.apk`. Ele não é release nem é instalado automaticamente. Consulte `docs/TEST_PLAN.md` para a checklist Moto G06.

Leia `AGENTS.md` e `docs/STATUS.md` antes de contribuir.
