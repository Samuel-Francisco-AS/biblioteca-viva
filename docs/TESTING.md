# Estratégia de testes

## Objetivo

Comprovar invariantes, integração, experiência essencial e segurança de dados sem confundir automação com validação humana.

## Camadas

- **Domínio:** factories, transições, invariantes e cálculos puros.
- **Aplicação:** casos de uso, ordem transacional, concorrência e erros públicos.
- **Persistência:** schemas, migrações, reabertura, transação e backup.
- **React:** navegação, formulários, estados, foco e alternativas acessíveis.
- **Phaser:** lifecycle, projeção, geometria, input, fallback e depth.
- **E2E:** fluxos públicos com dados fictícios e origem isolada.
- **Android:** build, instalação autorizada, lifecycle, toque, safe areas, dados e percepção física.

## Comandos-base

```bash
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

Instale o Chromium local do Playwright quando necessário com `npx playwright install chromium`.

## Regressões obrigatórias por área

### Dados e backup

- migração da versão anterior e reabertura;
- leitura estrita de estado persistido;
- round-trip do formato atual;
- importação dos formatos suportados;
- checksum inválido, duplicatas, versão futura e limite de tamanho;
- restore transacional e repetido;
- preservação de estrutura, objetos, preferências, sessões, etiquetas e marcos.

### Estrutura e mundo

- catálogo, spans, células, arestas, cantos e porta;
- conflitos de ocupação e revisão;
- blueprint apenas quando ausente;
- inventário e concessões idempotentes;
- transformação, normal topológica, perfis e 31 junções;
- sprite/fallback, depth, hit regions e lifecycle;
- pan, preview, seleção, movimento, giro, guardar e piso.

### Produto e acesso

- seis variantes de registro;
- sessão única, pause/resume/complete e duração por `Clock`;
- filtros, estados vazios e métricas reais;
- foco, teclado, Escape/Back, movimento reduzido e contraste;
- degradação segura quando Phaser ou áudio falham.

## Evidência humana

Somente uma pessoa pode aprovar:

- legibilidade e continuidade artística;
- toque e ergonomia em aparelho real;
- safe areas e teclado virtual;
- TalkBack e leitura auditiva;
- áudio percebido;
- desempenho percebido;
- instalação, atualização e recuperação com dados controlados.

Registre aparelho, versão, build/commit, passos, resultado e ressalvas. Não transforme item não executado em aprovado.

## Dados de teste

Use conteúdo explicitamente fictício. Não copie biblioteca, backup, screenshots ou caminhos pessoais para fixtures, traces, logs ou CI.

## Histórico

O plano cumulativo anterior, com checkpoints e checklists encerrados, está em `history/testing/TEST_PLAN_LEGACY.md`. Ele é evidência histórica, não lista atual de pendências.
