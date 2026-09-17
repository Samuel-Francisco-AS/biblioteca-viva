# Biblioteca Viva

Biblioteca Viva é um aplicativo local-first para registrar livros, filmes, séries, estudos, atividades físicas e trabalho. O produto oferece criação, edição, progresso, notas, citações, etiquetas, favoritos, sessões, histórico, estatísticas, arquivo, preferências e backup local.

O aplicativo convencional está funcional. A rota Biblioteca hospeda a Fundação Three.js aprovada na F1, isolada por um World Host React; a cena atual continua sendo uma fixture técnica, não a Biblioteca final.

F0–F6 da FUNDAÇÃO do novo mundo estão concluídas no plano técnico/arquitetural. O novo mundo continua definido como uma experiência 3D real com apresentação ortográfica/2.5D. **Three.js está aprovado como renderer da Fundação**, usando integração direta com React, `WebGLRenderer`, `OrthographicCamera` e GLTF/GLB. **P3D-A formalizou o Pipeline 3D v1**: GLB autocontido, fonte editável rastreável, normalização antes do runtime, materiais relevantes e métricas sem hard budgets; isso ainda não cria asset, loader produtivo, `AssetManager` ou mundo final. **F5 consolidou no Moto G06 um envelope físico observado e guardrails de remedição, sem criar hard budgets. F6 fechou a fronteira técnica de acessibilidade React ↔ Three.** TalkBack e a validação humana assistiva no Android não foram aprovados: são dívida obrigatória antes do fechamento do primeiro recorte real e de qualquer beta/release dependente dessa experiência. O próximo trabalho é P3D-B, o primeiro asset canônico ponta a ponta.

React Three Fiber (R3F), WebGPU e renderers alternativos não fazem parte do baseline aprovado. Só serão reconsiderados diante de um problema estrutural concreto. A persistência espacial continua futura.

O baseline atual usa React, Dexie, Vite, Vitest, Playwright, Capacitor e Android. Não existem conta, backend, sincronização, nuvem, social ou analytics.

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
npm run test:e2e
```

Para Android:

```bash
npm run android:sync
npm run android:build:debug
```

O APK debug esperado é `android/app/build/outputs/apk/debug/app-debug.apk`. Build isolado não comprova instalação, acessibilidade, áudio ou desempenho em aparelho real; a evidência física identificada deve ser registrada separadamente.

Comece a documentação em [`docs/README.md`](docs/README.md).
