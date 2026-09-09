# Estado atual

> Referência documental: 2026-09-09.

## Produto

- O aplicativo convencional está funcional com os seis tipos de registro e operação local-first, sem conta, backend, sincronização, nuvem ou analytics.
- React, Dexie v8, backup v6, Capacitor, Vite, Vitest e Playwright permanecem ativos; Dexie e backup contêm somente dados convencionais.

## Mundo

- **F0 e F1 estão concluídas. Three.js está aprovado como renderer da Fundação do novo mundo.**
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

**F2-B concluída — fronteira pública React ↔ runtime:** `WorldRuntime` agora formaliza falha terminal tipada; `WorldHost` descarta a instância e limpa o estado efêmero antes do fallback. A instância montada/viva por host é limitada a uma.

**Próximo trabalho — F2-C em diante:** endurecer lifecycle, recuperação e organização interna da Fundação Three.js. Não iniciar F3–F6 nem a Biblioteca real antes do escopo correspondente.
