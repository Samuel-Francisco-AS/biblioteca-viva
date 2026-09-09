# Estado atual

> Referência documental: 2026-09-09.

## Produto

- O aplicativo convencional está funcional com os seis tipos de registro e operação local-first, sem conta, backend, sincronização, nuvem ou analytics.
- React, Dexie v8, backup v6, Capacitor, Vite, Vitest e Playwright permanecem ativos; Dexie e backup contêm somente dados convencionais.

## Mundo

- **F0, F1 e F2 estão concluídas. A F2 foi encerrada após gates técnicos e revalidação física curta no Moto G06. Three.js está aprovado como renderer da Fundação do novo mundo.**
- A linha ativa é `React → WorldHost → ThreeWorldRuntime → Three.js`, com `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, lifecycle explícito, integração React ↔ Three e Android/Capacitor.
- A direção permanece 3D real com apresentação ortográfica/2.5D. A cena atual é um spike técnico com fixture, não a Biblioteca final nem arquitetura permanente de conteúdo.
- A F1 provou renderização, interação, lifecycle, observabilidade e viabilidade física no Moto G06. Ela não conclui a FUNDAÇÃO inteira nem garante desempenho do mundo completo.
- Não existe persistência espacial nem pipeline 3D formal. Câmera, interação, assets e budget artístico definitivos permanecem futuros.
- R3F e WebGPU não estão aprovados; renderers alternativos só voltam a ser considerados diante de evidência estrutural futura.

## Validações abertas

- TalkBack completo e auditoria humana de tecnologias assistivas permanecem pendentes para F6 ou gate humano específico.
- R-09 está parcialmente mitigado pela cena mínima a aproximadamente 60 FPS no Moto G06, mas permanece ativo para densidade, assets, iluminação, personagens e mundo real.
- Teste térmico prolongado e performance de cenas complexas permanecem futuros.

## Próximo trabalho

**F2 concluída — Integração e endurecimento da Fundação Three.js:** a fronteira `WorldRuntime`, ownership por montagem, terminalidade `failed`, política de context loss, descarte de callbacks tardios e segurança de viewport/input foram consolidados sem regressão detectada nos gates completos web, E2E e Android técnico. A revalidação humana física curta no Moto G06 confirmou background/resume, alinhamento do canvas com React, seleção/highlight e controles React sincronizados, pan, pinch, seleção por toque e rotação/orientação, sem crash, travamento, degradação sustentada, perda de interação ou dessincronização React ↔ Three. As quedas transitórias observadas de FPS em orientação e em extremos rápidos de zoom são não bloqueantes e não têm causalidade atribuída à F2 sem evidência.

```text
F0 ✅
F1 ✅
F2 ✅
F3 ▶ PRÓXIMA
F4 ⏳
F5 ⏳
F6 ⏳
```

**Próximo trabalho — F3:** câmera e interação mobile. Ergonomia final de câmera, zoom, pinch, seleção e safe areas continua fora da F2.
