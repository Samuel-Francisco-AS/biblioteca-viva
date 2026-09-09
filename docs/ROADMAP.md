# Roadmap

> Atualizado em 2026-09-09.

## Baseline concluído

- Aplicativo convencional funcional, local-first, com Dexie v8 e backup v6 somente para dados convencionais.
- Mundo anterior, Phaser e contratos espaciais legados removidos pelo WORLD RESET.
- **F0 — Definição da Fundação concluída.**
- **F1 — Three.js Foundation Spike concluída:** Three.js aprovado como renderer da Fundação com host React próprio, `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, interação bidirecional, lifecycle explícito e prova física no Moto G06.
- A cena vigente continua técnica e descartável; a Biblioteca final, o pipeline 3D formal e a persistência espacial ainda não existem.

## FUNDAÇÃO

```text
F0 ✅
F1 ✅
F2 ✅
F3 ▶ PRÓXIMA
F4 ⏳
F5 ⏳
F6 ⏳
```

### F2 — Integração e endurecimento da Fundação Three.js — concluída

Integração e endurecimento da Fundação Three.js, consolidando limites React/runtime, lifecycle, recuperação, organização interna e contratos estáveis. F2-B definiu a falha terminal pública e o fallback React; F2-C consolidou ownership da montagem; F2-D1 tornou falhas estruturais de render/resize terminais e impede render incidental durante pausa; F2-D2 definiu `webglcontextlost` como falha terminal e torna restoration tardia inerte; F2-E endureceu viewport/orientation/input contra dimensões transitórias, callbacks tardios e interrupções de Pointer Events, sem calibrar a ergonomia. F2-F executou a regressão consolidada, build web, E2E e Android técnico sem detectar regressão material.

F2 está tecnicamente concluída. Uma validação humana física curta no Moto G06 é recomendada para as alterações estruturais de lifecycle, context loss, resize e input, sem reabrir o fechamento técnico. Câmera e interação finais continuam em F3.

### F3 — Câmera e interação mobile — próxima autorizada

Refinar câmera ortográfica/2.5D, pan, zoom, pinch, limites, seleção e ergonomia em tela pequena.

### F4 — Contrato experimental de assets 3D — planejada

Provar escala, eixos, pivôs, materiais, texturas, carregamento, descarregamento e custo de GLTF/GLB sem congelar o pipeline artístico completo.

### F5 — Performance e Android físico — planejada

Aprofundar densidade de cena, frame time, recursos, loading, estabilidade, temperatura e limites iniciais de conteúdo no Moto G06.

### F6 — Acessibilidade e fechamento da FUNDAÇÃO — planejada

Consolidar o contrato entre a superfície 3D e React semântico, executar o gate humano de acessibilidade e fechar a FUNDAÇÃO inteira.

F1 aprovou a viabilidade da base Three.js; não concluiu câmera, interação, assets, performance ou acessibilidade finais.

## Depois da FUNDAÇÃO

1. Formalizar o pipeline de assets 3D a partir da evidência acumulada.
2. Projetar e implementar o primeiro recorte real do novo mundo.
3. Projetar persistência espacial nova somente quando esse recorte demonstrar o que precisa ser salvo.
4. Planejar sistemas maiores em fases próprias.
