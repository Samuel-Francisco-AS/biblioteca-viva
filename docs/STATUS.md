# Estado atual

> Referência documental: 2026-09-13.

## Produto

- O aplicativo convencional está funcional com os seis tipos de registro e operação local-first, sem conta, backend, sincronização, nuvem ou analytics.
- React, Dexie v8, backup v6, Capacitor, Vite, Vitest e Playwright permanecem ativos; Dexie e backup contêm somente dados convencionais.

## Mundo

- **F0, F1, F2 e F3 — Câmera e interação mobile — estão concluídas. F4 — Contrato experimental de assets 3D — está em andamento.** Three.js está aprovado como renderer da Fundação do novo mundo.
- A linha ativa é `React → WorldHost → ThreeWorldRuntime → Three.js`, com `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, lifecycle explícito, integração React ↔ Three e Android/Capacitor.
- F3 consolidou `CameraNavigation` runtime-only como autoridade de `targetX`, `targetZ` e `zoom`; framing e bounds dependem de projeção, viewport e zoom. Pan, wheel focal e pinch focal navegam no plano X/Z; tap elegível só faz picking no `pointerup`, e o layout entrega ao runtime somente o `world-host` real observado. Resize/orientação preservam exploração e seleção quando possível e cancelam somente o gesto ativo.
- A correção final dos bounds substituiu o AABB da projeção por uma região convexa válida de centros de câmera, preservando na viewport um patch do piso técnico de largura e altura equivalentes a 15% dos spans projetados, limitado pelo espaço disponível. Ela não alterou `CameraNavigation`, gestos, lifecycle ou renderer.
- A validação humana ampla da F3 no Moto G06 foi positiva: abertura, framing, pan, tap/seleção, pinch, pinch → pan, zoom, rotação, background/resume e fluidez permaneceram funcionais, sem crash, travamento ou regressão funcional perceptível; o FPS ficou aproximadamente em 60 ou muito próximo durante interações e rotação. Isto é evidência humana da fixture técnica, não benchmark nem garantia do mundo final.
- A correção final dos bounds passou por regressão dirigida e novo build Android, mas não recebeu revalidação física específica no Moto G06. Essa ausência é risco residual aceito e não bloqueia o encerramento da F3; haverá nova validação física nas fases posteriores conforme necessário.
- A auditoria F4-A1 confirmou um único caminho de fixture GLB técnico, importado pelo build e carregado por `GLTFLoader` dentro de `ThreeWorldRuntime`; a montagem é dona do modelo e o libera com a cena. Não há cache, unload com runtime vivo, registry de runtime ou asset manager. Esse caminho F1 é evidência de baseline, não arquitetura de asset management permanente.
- F4-A foi concluída: a auditoria e o contrato experimental preservam GLTF/GLB no runtime e exigirão fonte editável e procedência em cada prova futura. O preflight técnico confirmou que Blender 3.3.21 executa via CLI, salva `.blend`, exporta GLB 2.0 e reimporta o arquivo produzido; o gate humano no Fedora confirmou viewport e operações básicas utilizáveis, sem crash, travamento, tela preta, corrupção visual, flickering ou lentidão persistente relevante. Blender 3.3.21 está aprovado somente como ferramenta experimental de autoria durante F4; continua substituível, não é dependência do projeto nem ferramenta definitiva do Pipeline 3D.
- F4-B foi concluída experimentalmente: quatro GLBs normalizados de fontes externas com proveniência suficiente foram carregados pelo `GLTFLoader` instalado e têm roots sem scale, rotação ou offset corretivos, chão no `Y=0` e dimensões Three `[largura, altura, profundidade]`. O mapeamento observado é Blender `X →` Three `X`, Blender `Y →` Three `-Z` e Blender `Z →` Three `Y`; Azrael também foi carregado no diagnóstico com nove meshes sob root lógico, mas não entrou no checkout porque a licença/proveniência local disponível não é suficiente. O contrato continua experimental, não formaliza frente visual/funcional nem Pipeline 3D definitivo.
- F4-D1 auditou loading, ownership e disposal sem alterar produção ou assets. O fixture F1 ainda é possuído somente pela montagem terminal; `disposeObjectTree()` deduplica geometry/material/texture por árvore e remove sua raiz. Não há unload com host vivo, token de intenção ou abort no baseline. O contrato D1 separa semanticamente host, root, owner e loading, exige um único owner após attach, unload idempotente que preserva o host e descarte de sucesso tardio já não desejado. D2 provará isso em harness isolado, antes de qualquer mudança no runtime.
- A cena atual é um spike técnico com fixture, não a Biblioteca final nem arquitetura permanente de conteúdo. Não existe persistência espacial, pipeline 3D formal, catálogo real, `PlacedObject`, `WorldStructureState` ou tabela espacial.
- R3F e WebGPU não estão aprovados; renderers alternativos só voltam a ser considerados diante de evidência estrutural futura.

## Validações abertas

- TalkBack completo e auditoria humana de tecnologias assistivas permanecem pendentes para F6 ou gate humano específico.
- R-09 foi parcialmente mitigado pela evidência da cena mínima no Moto G06, mas permanece ativo para densidade, assets, iluminação, personagens e mundo real.
- Teste térmico prolongado e performance de cenas complexas permanecem futuros.

## Próximo trabalho

**F4 — Contrato experimental de assets 3D está em andamento. F4-A, F4-B, F4-C e F4-D1 estão concluídas experimentalmente.** D1 auditou o ownership real e definiu apenas o contrato mínimo para a prova; não houve alteração de runtime ou asset. F4-D2 — Load → attach → unload mantendo o host vivo — é o próximo checkpoint, sem iniciar pipeline definitivo, Biblioteca real ou persistência espacial.

```text
F0 ✅
F1 ✅
F2 ✅
F3 ✅ CONCLUÍDA
F4 ▶ EM ANDAMENTO
  F4-A ✅ CONCLUÍDA
    A1 ✅ auditoria do caminho atual
    A2 ✅ contrato experimental v0
    A3 ✅ preflight técnico + humano
  F4-B ✅ CONCLUÍDA
  F4-C ✅ CONCLUÍDA
    C1 ✅ inventário e diagnóstico
    C2 ✅ contrato técnico mínimo experimental
    C3 ✅ prova automatizada GLB → GLTFLoader/Three
    C4 ✅ preparação temporária do gate visual
    C5 ✅ gate visual humano
    C6 ✅ consolidação e limpeza
  F4-D ▶ EM ANDAMENTO
    D1 ✅ auditoria e contrato experimental de loading/unload/ownership
    D2 ▶ PRÓXIMA — load → attach → unload com host vivo
    D3 ⏳ repetição, dois assets e idempotência
    D4 ⏳ abandono, callbacks tardios e erro
  F4-E ⏳
  F4-F ⏳
F5 ⏳
F6 ⏳
```
