# Arquitetura

```text
presentation (React) -> application -> domain
infrastructure -------> application ports
```

- `domain` contém entidades, invariantes, transições, erros e regras puras.
- `application` coordena casos de uso, transações e portas.
- `infrastructure` implementa persistência, plataforma, arquivos e áudio.
- React apresenta shell, navegação, fluxos convencionais e a experiência do mundo.

Domain não importa React, Dexie, Capacitor, DOM ou browser. React não acessa Dexie diretamente. Entradas externas são validadas nas fronteiras e eventos são publicados somente depois do commit.

O composition root monta repositórios Dexie, casos de uso, serviços de backup, preferências, áudio e integrações de plataforma.

## Fundação 3D

Three.js é o renderer aprovado da Fundação do novo mundo. A linha ativa é:

```text
presentation / React
        ↓
WorldHost
        ↓
ThreeWorldRuntime
        ↓
Three.js
```

- `LibraryPage` descreve a experiência e preserva as ações convencionais;
- `WorldHost` pertence à apresentação, carrega o runtime sob demanda, mantém no máximo uma instância montada/viva por vez e faz a ponte de seleção, diagnóstico e falha terminal tipada com React;
- `ThreeWorldRuntime` pertence à camada de apresentação/experiência, depende de browser/DOM e concentra `WebGLRenderer`, cena, `OrthographicCamera`, GLTF/GLB, input, picking, highlight, loop, resize, pause/resume, visibilidade, métricas e disposal; uma falha estrutural de render, resize ou `webglcontextlost` leva a instância de uso único ao estado terminal `failed`, libera a montagem e emite uma única falha tipada ao host;
- React permanece responsável pela superfície semântica e pelo fallback, sem importar Three.js;
- a fronteira `WorldRuntime` expõe somente descritores selecionáveis, diagnóstico efêmero e uma falha terminal segura para UI/log; não expõe tipos ou detalhes de Three.js;
- cada montagem do runtime possui um agrupamento interno único que detém renderer, canvas, cena, câmera, interação, RAF, observers/listeners e recursos da cena; `ResizeObserver` é o caminho primário de viewport e `window.resize` é seu fallback, ambos registrados uma vez e removidos pela mesma montagem; dimensões não finitas ou não positivas apenas aguardam o próximo viewport válido, sem fabricar frustum, renderer ou frame, e callbacks tardios após terminalidade são inertes; durante `paused`, resize e callback de fixture atualizam somente o estado necessário, sem frame incidental;
- `ThreeWorldInteraction` continua sendo o único owner de Pointer Events, capture, wheel, picking e highlight: cancelamento/perda de capture, pausa e terminalidade limpam pointers ativos defensivamente; a transição de pinch para um pointer continua como pan limpo, sem transformar o fim do pinch em seleção;
- os listeners do canvas para `webglcontextlost` e `webglcontextrestored` pertencem à montagem, são registrados uma vez e removidos antes de renderer/canvas; `mount()` interrompido, `dispose()` e falha terminal convergem para a mesma liberação idempotente;
- a política vigente para perda de contexto é terminal: `webglcontextlost` previne o default, encerra a montagem e deixa React apresentar o fallback `{ code: "unavailable" }`; `webglcontextrestored` não retoma nem reconstrói a instância descartada, que só pode ser substituída pelo ciclo normal do host/rota;
- o carregamento do fixture por `GLTFLoader` não possui abort explícito neste baseline; após `failed` ou `disposed`, callback tardio descarta e libera o modelo sem alterar estado, renderizar ou reativar o runtime. Erro normal de carregamento do fixture continua recuperável;
- `domain` e `application` não conhecem Three.js; o runtime não acessa Dexie, backup nem portas de persistência;
- não existe entidade, tabela, porta ou backup espacial; seleção e câmera atuais são efêmeras.

O baseline vigente usa Three.js direto, `WebGLRenderer`, `OrthographicCamera` e GLTF/GLB. R3F não foi adotado e WebGPU não substitui o baseline WebGL. Alternativas não serão implementadas em paralelo e só serão reabertas diante de evidência estrutural futura.

A cena técnica da F1 prova o runtime, mas não constitui arquitetura permanente de conteúdo, câmera final, interação final, pipeline de assets ou mundo real da Biblioteca.
