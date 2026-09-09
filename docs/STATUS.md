# Estado atual

> Referência documental: 2026-09-09.

## Produto

- O aplicativo convencional está funcional com os seis tipos de registro e operação local-first, sem conta, backend, sincronização, nuvem ou analytics.
- React, Dexie v8, backup v6, Capacitor, Vite, Vitest e Playwright permanecem ativos; Dexie e backup contêm somente dados convencionais.

## Mundo

- **F0, F1, F2 e F3 — Câmera e interação mobile — estão concluídas.** Three.js está aprovado como renderer da Fundação do novo mundo.
- A linha ativa é `React → WorldHost → ThreeWorldRuntime → Three.js`, com `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, lifecycle explícito, integração React ↔ Three e Android/Capacitor.
- F3 consolidou `CameraNavigation` runtime-only como autoridade de `targetX`, `targetZ` e `zoom`; framing e bounds dependem de projeção, viewport e zoom. Pan, wheel focal e pinch focal navegam no plano X/Z; tap elegível só faz picking no `pointerup`, e o layout entrega ao runtime somente o `world-host` real observado. Resize/orientação preservam exploração e seleção quando possível e cancelam somente o gesto ativo.
- A correção final dos bounds substituiu o AABB da projeção por uma região convexa válida de centros de câmera, preservando na viewport um patch do piso técnico de largura e altura equivalentes a 15% dos spans projetados, limitado pelo espaço disponível. Ela não alterou `CameraNavigation`, gestos, lifecycle ou renderer.
- A validação humana ampla da F3 no Moto G06 foi positiva: abertura, framing, pan, tap/seleção, pinch, pinch → pan, zoom, rotação, background/resume e fluidez permaneceram funcionais, sem crash, travamento ou regressão funcional perceptível; o FPS ficou aproximadamente em 60 ou muito próximo durante interações e rotação. Isto é evidência humana da fixture técnica, não benchmark nem garantia do mundo final.
- A correção final dos bounds passou por regressão dirigida e novo build Android, mas não recebeu revalidação física específica no Moto G06. Essa ausência é risco residual aceito e não bloqueia o encerramento da F3; haverá nova validação física nas fases posteriores conforme necessário.
- A cena atual é um spike técnico com fixture, não a Biblioteca final nem arquitetura permanente de conteúdo. Não existe persistência espacial nem pipeline 3D formal.
- R3F e WebGPU não estão aprovados; renderers alternativos só voltam a ser considerados diante de evidência estrutural futura.

## Validações abertas

- TalkBack completo e auditoria humana de tecnologias assistivas permanecem pendentes para F6 ou gate humano específico.
- R-09 foi parcialmente mitigado pela evidência da cena mínima no Moto G06, mas permanece ativo para densidade, assets, iluminação, personagens e mundo real.
- Teste térmico prolongado e performance de cenas complexas permanecem futuros.

## Próximo trabalho

**F4 — Contrato experimental de assets 3D é a próxima fase autorizada da Fundação.** Ela inicia o aprendizado e a validação experimental de objetos 3D, sem iniciar pipeline definitivo, Biblioteca real ou persistência espacial.

```text
F0 ✅
F1 ✅
F2 ✅
F3 ✅ CONCLUÍDA
F4 ▶ PRÓXIMA
F5 ⏳
F6 ⏳
```
