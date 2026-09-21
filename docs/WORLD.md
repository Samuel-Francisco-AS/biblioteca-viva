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

Identidade, posição da câmera e seleção permanecem efêmeras. Na fixture, a câmera tem framing e limites técnicos explícitos, sem depender do GLB tardio ou persistir estado espacial; pan, wheel e pinch usam o mesmo modelo lógico no plano X/Z, com zoom focal e midpoint de pinch ancorados dentro desses limites. A seleção por canvas só ocorre no `pointerup` de uma candidatura de tap única que não excedeu `8` CSS px, não entrou em pinch e não foi interrompida; tap vazio limpa a seleção. Isso não define a câmera, as áreas de toque ou a ergonomia final da Biblioteca. F4 fechou a evidência experimental de assets e P3D-A formalizou o contrato produtivo v1 (fonte editável, normalização antes do runtime, materiais relevantes e custo medido), sem criar asset, ingestão, catálogo ou `AssetManager`. F5 validou no Moto G06 um envelope físico observado, sem encontrar teto ou criar budget permanente. F6 concluiu tecnicamente a fronteira acessível React ↔ Three, mas não aprovou TalkBack humano. A fixture continua descartável; o mundo real e a persistência espacial ainda não existem.

## Biblioteca Funcional Primeiro

BF-0 aprovou construir primeiro uma Biblioteca funcional com conteúdo procedural/provisório em TypeScript/Three.js. Esse caminho pode representar visualmente um tipo de modelo sem depender de GLB; não promove a fixture F1, os cenários diagnósticos F5 ou qualquer fixture F4 à arquitetura produtiva. React continua a superfície semântica das funções essenciais: seleção visual é complementar e nunca o único caminho de operação.

A identidade lógica futura é independente da representação visual e distingue: o tipo de modelo estável, a instância desse tipo no mundo e, quando aplicável, o ID do registro convencional associado. Esta distinção é um contrato de significado, não cria schema, tipo TypeScript, tabela, backup, posição persistida ou contrato espacial. A posição e demais estado espacial produtivo continuam inexistentes; contratos anteriores não retornam.

P3D-B1 preserva o candidato `bookshelf` e a sua proveniência. P3D-B2–F estão adiados e só retomam se a ingestão ou substituição por assets GLB definitivos se tornar necessária. BF-1 é o próximo planejamento e será decomposto antes de qualquer implementação. A dívida de TalkBack continua bloqueante para o fechamento do primeiro recorte real: prever remediação e validações físicas incrementais no Moto G06, sem impor budgets preventivos.

A caixa do mundo é a área efetiva do `world-host` dentro do layout React, não uma estimativa da janela. O shell preserva as safe areas e reserva o dock fixo; Three recebe somente a dimensão observada da sua caixa. Portrait, landscape e resize mantêm a mesma montagem, seleção e exploração lógica quando os bounds permitem; transição inválida aguarda dimensão válida e interrompe somente gesto que estivesse ativo. F3-F1 confirmou este contrato por regressão técnica, build e E2E; a validação humana ampla da F3 no Moto G06 foi positiva para orientação, toque/pinch, lifecycle e fluidez. O fix posterior dos bounds foi validado tecnicamente, sem revalidação física específica; isso foi aceito como limitação não bloqueante do fechamento, não como prova física inexistente.

R3F não foi aprovado e só poderá ser reconsiderado diante de um problema concreto de integração. WebGPU não é o baseline. Babylon.js, PlayCanvas e Godot não serão testados ou migrados preventivamente; alternativas só retornam diante de evidência estrutural que justifique reabrir a decisão.

A FUNDAÇÃO estabelece a base técnica/arquitetural Three.js e sua fronteira semântica React. Ela não aprova o mundo real, performance de cenas complexas, TalkBack, acessibilidade humana Android ou temperatura de longo prazo. A validação assistiva humana permanece obrigatória antes do fechamento do primeiro recorte real e de beta/release aplicável.
