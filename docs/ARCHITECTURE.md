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
- `ThreeWorldRuntime` pertence à camada de apresentação/experiência, depende de browser/DOM e concentra `WebGLRenderer`, cena, `OrthographicCamera`, GLTF/GLB, input, picking, highlight, loop, resize, pause/resume, visibilidade, métricas e disposal;
- React permanece responsável pela superfície semântica e pelo fallback, sem importar Three.js;
- a fronteira `WorldRuntime` expõe somente descritores selecionáveis, diagnóstico efêmero e uma falha terminal segura para UI/log; não expõe tipos ou detalhes de Three.js;
- renderer, canvas, loop, observers, listeners, gestos e recursos Three pertencem à instância do runtime;
- `domain` e `application` não conhecem Three.js; o runtime não acessa Dexie, backup nem portas de persistência;
- não existe entidade, tabela, porta ou backup espacial; seleção e câmera atuais são efêmeras.

O baseline vigente usa Three.js direto, `WebGLRenderer`, `OrthographicCamera` e GLTF/GLB. R3F não foi adotado e WebGPU não substitui o baseline WebGL. Alternativas não serão implementadas em paralelo e só serão reabertas diante de evidência estrutural futura.

A cena técnica da F1 prova o runtime, mas não constitui arquitetura permanente de conteúdo, câmera final, interação final, pipeline de assets ou mundo real da Biblioteca.
