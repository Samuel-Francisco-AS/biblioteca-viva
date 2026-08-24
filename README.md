# Biblioteca Viva

Biblioteca Viva é um aplicativo local-first para registrar livros, filmes, séries, estudos, atividades físicas e trabalho. A interface React mantém as funções convencionais e acessíveis; a Biblioteca Phaser é uma visualização complementar, carregada sob demanda.

## Estado

Versão `0.2.0-alpha.1`. Prompts 1–19, R1–R3, P1 e P2 são histórico técnico. G0–G3, G5 e G6 estão aprovados; G4 e G7–G10 permanecem abertos. Não há release pública, APK assinado ou publicação em loja.

O reboot espacial está em W1: um mundo Phaser efêmero com dois espaços neutros conectados, câmera X/Y e pan manual. A implementação técnica corrigida aguarda validação humana no Moto G06. W2 não começou: não há `PlacedObject`, inventário, layout persistido, tabela Dexie, migração ou backup espacial.

## Stack e arquitetura

- TypeScript estrito, React 19 e Vite 8;
- Phaser 3 lazy na Biblioteca;
- Dexie/IndexedDB schema v5, validado nas fronteiras;
- backup JSON v3, leitor retrocompatível de v1/v2;
- Web Audio nativo atrás de uma porta de aplicação;
- Capacitor 8 para Android;
- Vitest, Testing Library e Playwright Chromium.

```text
React → Application → Domain → Ports → Infrastructure

dados persistidos → projeções → React host → Phaser
World/Space/Connection efêmeros W1 → Phaser → câmera efêmera
```

React e Phaser não acessam Dexie. Phaser recebe projeções resumidas e emite interações tipadas; não decide regra de negócio nem é fonte de verdade de layout.

## Desenvolvimento

```bash
npm ci
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run build
npm run performance:report
```

Para E2E, instale Chromium uma vez com `npx playwright install chromium` e execute `npm run test:e2e` após o build. `performance:report` confirma que Phaser continua entrada dinâmica.

## Android

```bash
npm run android:sync
npm run android:build:debug
```

O APK debug fica em `android/app/build/outputs/apk/debug/app-debug.apk`; ele não é release. FPS, conforto de pan, safe areas, TalkBack e estabilidade física exigem validação humana no Moto G06.

## Limitações atuais

- W1 ainda não foi aprovada humanamente;
- paredes W1 são modulares procedurais: o Kit Zero atual não tem peças em escala compatível e será revisto em W5;
- áudio e arte continuam provisórios;
- não há conta, backend, sincronização ou armazenamento remoto.

Leia [docs/STATUS.md](docs/STATUS.md) e [AGENTS.md](AGENTS.md) antes de contribuir.
