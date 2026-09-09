# ADR-009 — Three.js como renderer da Fundação

- **Estado:** aceita
- **Data:** 2026-09-09
- **Complementa:** ADR-008

## Contexto

O WORLD RESET encerrou Phaser e os contratos espaciais anteriores sem escolher o renderer sucessor. A F0 selecionou Three.js como candidato primário e contratou uma F1 capaz de provar navegador, Android modesto, lifecycle, acessibilidade estrutural, interação React ↔ renderer e carregamento GLTF/GLB em 3D real ortográfico/2.5D.

## Decisão

- aprovar Three.js como renderer da Fundação do novo mundo;
- integrar o renderer por host React próprio na linha `React → WorldHost → ThreeWorldRuntime → Three.js`;
- manter `WebGLRenderer` como baseline vigente, com `OrthographicCamera` e GLTF/GLB;
- manter o runtime na camada de apresentação/experiência, isolado de `domain`, `application`, Dexie e backup;
- manter React responsável pela superfície semântica e pelo fallback;
- não introduzir R3F sem problema concreto que justifique sua adoção;
- não adotar WebGPU como baseline nem implementar Babylon.js, PlayCanvas ou Godot preventivamente;
- não criar persistência espacial nesta decisão.

Alternativas só serão reconsideradas se evidência estrutural futura justificar reabrir a decisão.

## Evidência

F1-A a F1-F passaram os gates técnicos T1–T6 e produziram builds web e Android, testes automatizados, fixture GLB real, cena mínima observável, pan, pinch, picking, highlight, ponte bidirecional React ↔ Three, lifecycle explícito e disposal. Dez ciclos automatizados e dez ciclos físicos de saída e retorno mantiveram uma única cena funcional, sem degradação ou duplicação observável.

No Moto G06, o APK abriu e renderizou piso, paredes, proxies e fixture sem crash ou artefato relevante. A cena simples de 46 meshes e 546 triângulos estabilizou em aproximadamente 60 FPS, com quedas breves de aproximadamente 53–57 FPS na primeira interação e recuperação rápida. Pan, pinch, picking e os controles React `Anterior`/`Próximo` passaram. Background/resume passou enquanto o processo permaneceu vivo; após encerramento pelo Android sob pressão de memória, o aplicativo reiniciou de forma limpa e sem corrupção. O teste curto não revelou comportamento térmico anormal perceptível.

## Consequências

- F2 pode endurecer a integração existente, os limites React/runtime, lifecycle, recuperação, organização e contratos;
- F3 pode refinar câmera e input;
- F4 pode iniciar o contrato experimental de assets;
- F5 aprofundará performance e Android físico;
- F6 fechará acessibilidade e a FUNDAÇÃO;
- renderers alternativos não serão implementados em paralelo.

## Limitações

- a aprovação da viabilidade Three.js não conclui a FUNDAÇÃO inteira; F2–F6 permanecem futuras;
- a cena da F1 é mínima e não é o mundo da Biblioteca;
- aproximadamente 60 FPS nessa cena não define budget, não é requisito permanente e não garante o produto completo;
- câmera final, interação final, pipeline 3D formal/definitivo, persistência espacial e budget artístico permanecem futuros;
- performance final de cenas complexas não foi aprovada;
- TalkBack humano não foi executado e a temperatura de longo prazo não foi testada;
- R3F e WebGPU não estão aprovados.
