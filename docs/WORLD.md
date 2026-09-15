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

A superfície atual ainda é uma fixture técnica: piso, paredes, proxies, iluminação simples e um GLB mínimo. Ela não é a Biblioteca final e não define conteúdo, arte ou UX permanentes; a F3 concluiu o contrato técnico de câmera e interação desta fixture.

Identidade, posição da câmera e seleção permanecem efêmeras. Na fixture, a câmera tem framing e limites técnicos explícitos, sem depender do GLB tardio ou persistir estado espacial; pan, wheel e pinch usam o mesmo modelo lógico no plano X/Z, com zoom focal e midpoint de pinch ancorados dentro desses limites. A seleção por canvas só ocorre no `pointerup` de uma candidatura de tap única que não excedeu `8` CSS px, não entrou em pinch e não foi interrompida; tap vazio limpa a seleção. Isso não define a câmera, as áreas de toque ou a ergonomia final da Biblioteca. F4 fechou o contrato experimental de assets (autoria substituível, normalização antes do runtime, materiais PBR relevantes, lifecycle experimental e custo medido), sem criar pipeline 3D formal, catálogo ou assets finais. A fixture continua descartável; persistência espacial ainda não existe e será tratada somente nas fases autorizadas. F5 é a próxima fase para performance e validação Android física.

A caixa do mundo é a área efetiva do `world-host` dentro do layout React, não uma estimativa da janela. O shell preserva as safe areas e reserva o dock fixo; Three recebe somente a dimensão observada da sua caixa. Portrait, landscape e resize mantêm a mesma montagem, seleção e exploração lógica quando os bounds permitem; transição inválida aguarda dimensão válida e interrompe somente gesto que estivesse ativo. F3-F1 confirmou este contrato por regressão técnica, build e E2E; a validação humana ampla da F3 no Moto G06 foi positiva para orientação, toque/pinch, lifecycle e fluidez. O fix posterior dos bounds foi validado tecnicamente, sem revalidação física específica; isso foi aceito como limitação não bloqueante do fechamento, não como prova física inexistente.

R3F não foi aprovado e só poderá ser reconsiderado diante de um problema concreto de integração. WebGPU não é o baseline. Babylon.js, PlayCanvas e Godot não serão testados ou migrados preventivamente; alternativas só retornam diante de evidência estrutural que justifique reabrir a decisão.

A aprovação da F1 estabelece a viabilidade da base Three.js. Não conclui a FUNDAÇÃO inteira nem aprova o mundo real, performance de cenas complexas, TalkBack ou temperatura de longo prazo.
