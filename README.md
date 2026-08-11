# Biblioteca Viva

Biblioteca Viva é um aplicativo local-first para registrar livros, progresso, notas e citações em uma biblioteca virtual reativa. O protótipo combina uma interface React acessível com uma sala Phaser complementar, áudio local e persistência offline.

## Estado

A versão permanece `0.2.0-alpha.1`. Prompts 4–19 possuem implementação técnica; G0–G3, G5 e G6 estão aprovados. G4 e G7–G10 continuam abertos e dependem do checkpoint humano integrado. Não existe release pública, APK assinado ou publicação em loja.

O projeto suporta somente livros, uma sala, uma estante, uma bibliotecária e uma criatura. Conta, backend, sincronização e outros tipos de mídia estão fora do protótipo.

## Stack e arquitetura

- TypeScript estrito, React 19 e Vite 8;
- Phaser 3 carregado somente ao entrar na Biblioteca;
- Dexie/IndexedDB schema v3, validado nas fronteiras;
- backup JSON v2, com leitura retrocompatível de v1;
- Web Audio nativo atrás de uma porta de aplicação;
- Capacitor 8 para Android;
- Vitest, Testing Library e Playwright Chromium;
- GitHub Actions para checks web.

```text
React → Application → Domain → Ports → Infrastructure

IndexedDB → queries → LibraryProjectionService → React host → Phaser

use case → transação → commit → event bus → marco/diálogo/áudio
```

React e Phaser não acessam Dexie. Phaser recebe uma projeção resumida e emite interações tipadas; regras e dados persistentes permanecem nas camadas internas. Consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Dados e privacidade

Os dados ficam no IndexedDB da origem web ou da WebView Android. Não há conta, analytics, CDN, envio automático ou criptografia própria. Backups são JSON legível e saem do aplicativo somente por ação explícita. Nunca use dados pessoais em fixtures, logs, screenshots ou issues públicas. Consulte [docs/PRIVACY.md](docs/PRIVACY.md) e [docs/SECURITY.md](docs/SECURITY.md).

## Desenvolvimento

Requisito: Node.js `^20.19.0` ou `>=22.12.0`.

```bash
npm ci
npm run dev
```

Abra a URL indicada pelo Vite. O diagnóstico técnico aparece apenas em desenvolvimento ou no modo interno explícito.

## Testes e build web

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run build
npm run performance:report
```

`performance:report` lê o manifesto do build existente e confirma que Phaser continua uma entrada dinâmica.

Para E2E, instale o Chromium uma vez e execute a suíte. O Playwright inicia e encerra `vite preview` automaticamente na porta 4173:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Em Linux/CI, `npx playwright install --with-deps chromium` também instala dependências do sistema. `npm run test:e2e:ui` é opcional para investigação local. Os testes limpam somente o IndexedDB da origem controlada do preview por protocolo do Chromium; não existe rota de reset no produto.

## Android

Requisitos: Android SDK, JDK compatível e variáveis locais descritas em [docs/ANDROID_RELEASE.md](docs/ANDROID_RELEASE.md).

```bash
npm run android:sync
npm run android:build:debug
```

O APK debug fica em `android/app/build/outputs/apk/debug/app-debug.apk` e é ignorado pelo Git. `android:build:diagnostics` gera um APK interno no mesmo caminho; não é release público. A CI inicial valida a aplicação web. O build Android continua obrigatório localmente porque adicionar SDK/JDK/Gradle à CI não trouxe benefício proporcional nesta etapa.

## Limitações

- G4 e G7–G10 aguardam validação humana integrada;
- áudio e arte são provisórios;
- música reinicia após pause/resume;
- FPS, memória, TalkBack e 30 minutos de estabilidade precisam do Moto G06;
- Phaser permanece um chunk lazy grande, documentado;
- identidade, ícone/splash final, assinatura e release pertencem ao Bloco 11.

Leia [docs/STATUS.md](docs/STATUS.md) e [AGENTS.md](AGENTS.md) antes de contribuir. A documentação é continuável sem o histórico de conversas.
