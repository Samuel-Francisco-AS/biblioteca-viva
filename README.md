# Biblioteca Viva

> Tudo o que você lê, assiste e aprende passa a habitar a sua biblioteca.

Biblioteca Viva é um aplicativo local-first de registro pessoal em que livros, anotações, citações e progresso alteram uma biblioteca virtual viva. O protótipo será um aplicativo real de uso pessoal e, ao mesmo tempo, uma peça de portfólio com experiência visual e sonora própria.

## Estado atual

Os Gates G0, G1 e G2 foram aprovados. O Prompt 5 implementou a camada de aplicação e aguarda revisão humana. O Gate G3 permanece aberto; persistência Dexie e composição do Prompt 6 ainda não foram iniciadas.

## Domínio atual

`src/domain/` expõe uma API pequena para livros, progresso, status, notas, citações, erros, eventos e schemas Zod de fronteira. Os testes dessa camada rodam em Node, sem DOM. Ainda não existem formulário, adapters concretos, Dexie ou persistência.

## Aplicação atual

`src/application/` coordena o domínio por portas assíncronas para repositórios, relógio, IDs, atividades e eventos. Os oito casos de uso funcionam em Node com dependências injetadas. Ainda não existem implementações concretas dessas portas, composition root ou persistência.

## Navegação atual

O shell React possui cinco rotas sem funcionalidades de produto:

- `/` — Biblioteca;
- `/colecao` — Coleção;
- `/novo-livro` — Novo livro;
- `/arquivo` — Arquivo;
- `/configuracoes` — Configurações.

No mobile, a navegação fica na parte inferior. A partir de 768 px, a mesma lista passa para uma barra lateral.

Consulte `docs/STATUS.md` antes de qualquer tarefa. Esse arquivo é a fonte rápida para versão, bloco, prompt, gate, branch e pendências atuais.

## Stack aprovada

- TypeScript estrito;
- React e Vite para a aplicação convencional;
- Phaser 3 para a biblioteca visual;
- Capacitor para Android e geração de APK/AAB;
- Dexie sobre IndexedDB como persistência inicial, isolada por portas;
- Zod para validação nas fronteiras;
- Vitest, React Testing Library e Playwright;
- CSS Modules e design tokens;
- serviço de áudio desacoplado.

A decisão completa está em `docs/ARCHITECTURE.md`.

## Ordem de leitura

1. `docs/00_LEIA-ME.md`;
2. `docs/STATUS.md`;
3. `AGENTS.md`;
4. documento específico da tarefa;
5. `docs/EXECUTION_PLAN.md`, quando a tarefa pertencer ao roadmap.

## Comandos

Requisito: Node.js `^20.19.0` ou `>=22.12.0`.

```bash
npm install
npm run dev
```

Validação completa da fundação:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Também estão disponíveis `npm run preview`, `npm run test` e `npm run format`. O formatador limita-se ao código e aos arquivos técnicos explicitamente listados no script; a documentação Markdown não é reformatada em massa.

## Android

Requisitos locais: Node.js 22 ou superior, Android Studio 2025.2.1 ou superior, Android SDK e o JDK fornecido pelo Android Studio. Com `JAVA_HOME` e `ANDROID_HOME` configurados:

```bash
npm install
npm run android:sync
npm run android:build:debug
```

O build debug usa o Gradle Wrapper versionado em `android/gradlew`; não exige Gradle global. `npm run android:open` abre o projeto no Android Studio e `npm run android:run` sincroniza e executa quando houver aparelho conectado. O APK gerado fica em `android/app/build/outputs/apk/debug/app-debug.apk` e é ignorado pelo Git.

## Distribuição

A primeira distribuição alvo é Android. O APK de depuração já é gerado e foi validado fisicamente no Gate G2, mas não é um artefato público. O APK release assinado permanece pendente para o Gate G11.

## Licença

Ainda não definida. Não adicione uma licença sem decisão explícita registrada em `docs/DECISIONS.md`.
