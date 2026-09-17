# Biblioteca Viva

Biblioteca Viva é um aplicativo local-first para registrar livros, filmes, séries, estudos, atividades físicas e trabalho. O produto oferece criação, edição, progresso, notas, citações, etiquetas, favoritos, sessões, histórico, estatísticas, arquivo, preferências e backup local.

O aplicativo convencional está funcional. A rota Biblioteca hospeda a Fundação Three.js aprovada na F1, isolada por um World Host React; a cena atual continua sendo uma fixture técnica, não a Biblioteca final.

F0–F5 da FUNDAÇÃO do novo mundo estão concluídas. O novo mundo continua definido como uma experiência 3D real com apresentação ortográfica/2.5D. **Three.js está aprovado como renderer da Fundação**, usando integração direta com React, `WebGLRenderer`, `OrthographicCamera` e GLTF/GLB. **F4 consolidou o contrato experimental de assets 3D**: autoria editável, normalização antes do runtime, materiais PBR relevantes, ownership/lifecycle experimental e custo medido; isso não cria asset/runtime de produção, pipeline produtivo definitivo ou mundo final. **F5 consolidou no Moto G06 um envelope físico observado e guardrails de remedição, sem criar hard budgets. F6 — acessibilidade e fechamento arquitetural — é a próxima fase autorizada.** A FUNDAÇÃO inteira permanece aberta até o encerramento de F6.

React Three Fiber (R3F), WebGPU e renderers alternativos não fazem parte do baseline aprovado. Só serão reconsiderados diante de um problema estrutural concreto. O pipeline 3D formal e a persistência espacial continuam futuros.

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
