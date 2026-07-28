# Biblioteca Viva

> Tudo o que você lê, assiste e aprende passa a habitar a sua biblioteca.

Biblioteca Viva é um aplicativo local-first de registro pessoal em que livros, anotações, citações e progresso alteram uma biblioteca virtual viva. O protótipo será um aplicativo real de uso pessoal e, ao mesmo tempo, uma peça de portfólio com experiência visual e sonora própria.

## Estado atual

O Gate G0 foi aprovado e o projeto está no `BLOCO 1` — Fundação web. O próximo trabalho é o Prompt 1 de `docs/EXECUTION_PLAN.md`, ainda aguardando execução; não existe código executável, build ou APK.

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

Os comandos reais serão registrados aqui após o scaffold. Até lá, não invente scripts nem assuma nomes além dos previstos no plano de execução.

## Distribuição

A primeira distribuição alvo é Android. Um APK de depuração deve existir cedo, no Gate G2. O protótipo termina com APK release assinado e testado no Gate G11.

## Licença

Ainda não definida. Não adicione uma licença sem decisão explícita registrada em `docs/DECISIONS.md`.
