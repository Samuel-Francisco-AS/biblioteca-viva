# Biblioteca Viva

> Tudo o que você lê, assiste e aprende passa a habitar a sua biblioteca.

Biblioteca Viva é um aplicativo local-first de registro pessoal em que livros, anotações, citações e progresso alteram uma biblioteca virtual viva. O protótipo será um aplicativo real de uso pessoal e, ao mesmo tempo, uma peça de portfólio com experiência visual e sonora própria.

## Estado atual

Os Gates G0 a G3 estão aprovados e o Bloco 3 foi concluído na versão `0.2.0-alpha.1`. Domínio, casos de uso, Dexie, migrações e persistência web/Android foram validados. O próximo trabalho é o Prompt 7 — Cadastro e edição de livro, no Bloco 4.

## Domínio atual

`src/domain/` expõe uma API pequena para livros, progresso, status, notas, citações, erros, eventos e schemas Zod de fronteira. Os testes dessa camada rodam em Node, sem DOM. Não existem formulários ou acesso de interface ao banco.

## Aplicação atual

`src/application/` coordena o domínio por portas assíncronas para repositórios, transação, relógio, IDs, atividades e eventos. `src/infrastructure/` implementa essas portas com Dexie/IndexedDB e adapters de plataforma; `src/app/createApplication.ts` faz a composição explícita. Configurações mostra um diagnóstico técnico sem conteúdo pessoal no servidor de desenvolvimento e no modo explícito `diagnostics`. O build normal de produção não oferece esse painel.

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

Para gates internos que exigem o painel técnico, use `npm run build:diagnostics`. Esse modo lê `.env.diagnostics`; não é um build normal de produção nem um artefato público.

## Android

Requisitos locais: Node.js 22 ou superior, Android Studio 2025.2.1 ou superior, Android SDK e o JDK fornecido pelo Android Studio. Com `JAVA_HOME` e `ANDROID_HOME` configurados:

```bash
npm install
npm run android:sync
npm run android:build:debug
```

O build debug usa o Gradle Wrapper versionado em `android/gradlew`; não exige Gradle global. `npm run android:open` abre o projeto no Android Studio e `npm run android:run` sincroniza e executa quando houver aparelho conectado. O APK gerado fica em `android/app/build/outputs/apk/debug/app-debug.apk` e é ignorado pelo Git.

`npm run android:build:diagnostics` gera no mesmo caminho um APK debug com o painel habilitado exclusivamente para gates internos. `npm run android:build:debug` continua usando o build normal, sem diagnóstico.

## Distribuição

A primeira distribuição alvo é Android. O APK de depuração foi validado no Gate G2 e o APK diagnóstico interno foi validado no Gate G3; nenhum deles é artefato público. O APK release assinado permanece pendente para o Gate G11.

## Licença

Ainda não definida. Não adicione uma licença sem decisão explícita registrada em `docs/DECISIONS.md`.
