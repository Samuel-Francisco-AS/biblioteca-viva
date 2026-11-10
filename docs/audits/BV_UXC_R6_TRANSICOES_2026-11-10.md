# BV-UXC R6 — transição de saída, preparação e entrada com prontidão real

Data: 10/11/2026. PR #49 (draft, **sem merge**).
Solicitação do proprietário: animações de transição mais longas, reação visual antes do trabalho de navegação e encerramento da transição somente quando a nova tela estiver pronta. R5 foi candidata local com ganhos de contagem de operações, porém melhora subjetiva apenas parcial no Moto G06.

## Contrato de apresentação

1. **Toque confirmado:** para navegação interna, o shell inicia sincronamente `data-passage="departing"`, apresentando uma cortina de fantasia sobrenatural. Não há parsing da rota de destino no início da coreografia.
2. **Primeiro quadro:** `schedulePassage()` realiza dois agendamentos RAF, deixando pelo menos uma oportunidade de apresentação do feedback antes de executar o callback de navegação. Este é um agendamento por quadros, não um `setTimeout` cego para disfarçar carga.
3. **Processamento e montagem:** navegação React Router, importação lazy e consultas da tela seguem em paralelo à cortina. A cortina inicia a opacidade em 400 ms e mantém símbolo animado quando necessário. A saída não é interrompida por um commit de URL precoce.
4. **Prontidão:** `signalPassageReady(pathname)` é permitido somente após o conteúdo relevante da rota ter sido confirmado. Biblioteca aguarda runtime pronto ou erro explícito; Arcanário aguarda snapshot do escopo e Suspense da sala; Coleção, Arquivo, Estatísticas e edição/detalhes aguardam suas consultas iniciais (ou estado de erro). Rotas sem carga explícita aguardam a montagem do componente lazy.
5. **Entrada:** após sinal de prontidão **e** abertura mínima de 560 ms, `data-passage="arriving"` dispara fade-out de 440 ms. O fallback de limpeza de 540 ms só começa depois da prontidão, não é um timeout que libera uma tela ainda carregando.
6. **Interrupção:** nova intenção cancela callbacks antigos por ID; cleanup do shell cancela pendências; botões de navegação modificados continuam a funcionar sem interceptação. Reutilizar o clique no mesmo React Router Link preserva `to`, `state`, `replace`, URL relativa e semântica da rota, sem duplicar o feedback.
7. **Acessibilidade:** movimento reduzido elimina a animação prolongada e os RAFs de espera. A cortina é decorativa, `aria-hidden`, sem capturar foco ou gestos; botão Voltar e falhas são preservados. A recuperação de erro libera a entrada para mostrar a mensagem de falha.

A coreografia é **intencionalmente mais longa** (aprox. 1 segundo em rotas rápidas, possivelmente mais em rotas lentas). Esse é um trade-off explícito solicitado pelo proprietário, **não** uma melhoria de latência de CPU nem de input-to-photon comprovada. A animação usa apenas opacidade e transformações da cortina/sigilo; não remodela WebGL, não altera Dexie nem modifica assets GLB.

## Arquivos principais

- `src/app/interactionContinuity.ts` — estado de passagem, RAF pintado, prontidão, liberação, cancelamento e movimento reduzido.
- `src/App.tsx` — interceptação de links internos para executar seu próprio clique React Router após apresentação; vínculo da cortina à rota, recuperação e onAnimationEnd.
- `src/app/PrimaryDock.tsx` e `src/pages.tsx` — dock e portal 3D participam do mesmo ciclo.
- `src/features/arcanarium/ArcanariumPage.tsx` — prontidão da sala após snapshot/Suspense; erro explícito também libera o destino.
- `CollectionPage`, `ArchivePage`, `StatisticsPage`, `EntryDetailPage` e `EditEntryPage` — prontidão das consultas iniciais.
- `src/styles-atelier.css` — dobra 400 ms, estado de espera persistente e desdobramento 440 ms com símbolo animado.
- `src/app/interactionContinuity.test.ts` e `src/App.test.tsx` — novos casos de coordenação por quadros, destino obsoleto, loading, cancelamento e redução de movimento.

### Limites honestos de prontidão

Prontidão significa que a **camada da rota e as consultas declaradas** terminaram, não que todos os widgets/subcomponentes tenham terminado qualquer trabalho em segundo plano. Em algumas salas do Arcanário, carregamentos próprios posteriores à montagem do módulo podem continuar. Não foram criados novos contratos de prontidão para toda operação interna de formulário, duelo, imagens ou comandos; seria perigoso afirmar conclusão global sem instrumentação desses fluxos.

Não foi alterado o feedback contextual de seleção dos habitantes (picking R4) nem os comandos de gravação: retardar arbitrariamente esses handlers seria uma possível regressão de responsividade. Esta intervenção envolve **transições de navegação**. O gargalo físico do WebView/CPU e o E2E 3D da R5 continuam dívidas independentes.

## Validação e gate Moto G06

**Código remoto e testes escritos, ainda não executados nesta sessão.** Sem `npm ci`, Vitest, lint/formato, build, E2E ou ADB executados por esta edição; não se deve declarar PASS antes de rodar localmente. Não foi criado APK neste ambiente remoto. PR continua draft; `main` intacta e GitHub Actions não acionado.

1. Instalar **APK normal atualizado** sem limpar dados. Comparar saída e entrada entre Biblioteca, Coleção, Arquivo, Resumo, Configurações, Arcanário e suas salas. Testar destino com acervo vazio e populado.
2. Observar que o toque mostra a saída antes da mudança de tela; tela rápida deve ter coreografia completa, tela lenta deve manter sigilo até conteúdo efetivamente visível.
3. Entrar em registro e formulário com consulta atrasada; nenhuma cortina deve abrir sobre texto de carregamento desses fluxos.
4. Repetir seleção rápida de destinos, botão Voltar e clique modificado no navegador; verificar que não há navegação antiga atrasada, cliques duplicados, tela encoberta indefinidamente ou foco perdido.
5. Usar movimento reduzido, segundo plano/retorno, teclado e rotação; verificar se o fallback ocorre somente após prontidão.
6. Repetir toques de personagens, objetos, diálogos e duel/arena; confirmar que R4/R5 e dados não regrediram. Verificar se ainda há congelamento do próprio sigilo (evidência de CPU/JS bloqueando renderização, não solucionada por CSS).

Após sincronizar branch:
```bash
git fetch origin
git switch feat/bv-ux-touch-continuity-2026-11-09
git pull --ff-only origin feat/bv-ux-touch-continuity-2026-11-09
npm ci
npx vitest run src/app/interactionContinuity.test.ts src/App.test.tsx src/app/PrimaryDock.test.tsx
npm run format:check
npm run lint
npm run android:build:debug
```

Não realizar merge antes do gate.
