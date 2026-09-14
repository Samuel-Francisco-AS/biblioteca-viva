# Biblioteca Viva

Biblioteca Viva é um aplicativo local-first para registrar livros, filmes, séries, estudos, atividades físicas e trabalho. O produto oferece criação, edição, progresso, notas, citações, etiquetas, favoritos, sessões, histórico, estatísticas, arquivo, preferências e backup local.

O aplicativo convencional está funcional. A rota Biblioteca hospeda a Fundação Three.js aprovada na F1, isolada por um World Host React; a cena atual continua sendo uma fixture técnica, não a Biblioteca final.

F0, F1, F2 e F3 — Câmera e interação mobile — da FUNDAÇÃO do novo mundo estão concluídos. O novo mundo continua definido como uma experiência 3D real com apresentação ortográfica/2.5D. **Three.js está aprovado como renderer da Fundação**, usando integração direta com React, `WebGLRenderer`, `OrthographicCamera` e GLTF/GLB. **F4 — Contrato experimental de assets 3D está em andamento**: F4-A/B/C/D e F4-E1/E2 estão concluídas experimentalmente. E1/E2 mediram o corpus e escolheram para E3/E4 uma única variante de resolução de texturas de Poly Haven, ainda sem modificar asset/runtime nem adotar compressão; F4-E5, F4-F e F5–F6 permanecem futuros. A FUNDAÇÃO inteira ainda não está concluída.

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
