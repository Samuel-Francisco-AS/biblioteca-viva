# Mundo

O mundo anterior foi encerrado pelo WORLD RESET e não constitui fundação futura. Phaser, `PlacedObject`, `WorldStructureState`, grid 32 e os contratos W3-A permanecem mortos.

O novo mundo será criado do zero, será o único mundo ativo e seguirá 3D real com apresentação ortográfica/2.5D.

## Estado da Fundação

A F1 provou o runtime e aprovou Three.js como renderer da Fundação, com integração direta por host React próprio:

- `WebGLRenderer` como baseline vigente;
- `OrthographicCamera`;
- GLTF/GLB;
- ponte React ↔ Three;
- lifecycle explícito;
- Android/Capacitor.

A superfície atual ainda é uma fixture técnica: piso, paredes, proxies, iluminação simples e um GLB mínimo. Ela não é a Biblioteca final e não define conteúdo, arte, câmera, interação ou UX permanentes.

Identidade, posição da câmera e seleção permanecem efêmeras. O pipeline 3D formal e a persistência espacial ainda não existem e serão tratados somente nas fases autorizadas.

R3F não foi aprovado e só poderá ser reconsiderado diante de um problema concreto de integração. WebGPU não é o baseline. Babylon.js, PlayCanvas e Godot não serão testados ou migrados preventivamente; alternativas só retornam diante de evidência estrutural que justifique reabrir a decisão.

A aprovação da F1 estabelece a viabilidade da base Three.js. Não conclui a FUNDAÇÃO inteira nem aprova o mundo real, performance de cenas complexas, TalkBack ou temperatura de longo prazo.
