# Biblioteca Viva — F0-D: Three.js Foundation Spike Contract

**Data:** 2026-09-08  
**Estado:** F0-D concluída — contrato autorizado para orientar a F1  
**Escopo:** Fundação técnica do novo mundo 3D  
**Candidato primário:** Three.js  

---

## 1. Finalidade

Este contrato define o primeiro spike executável da FUNDAÇÃO do novo mundo da Biblioteca Viva.

A F1 não implementa a Biblioteca final. Seu objetivo é provar, com uma fatia mínima e descartável, que **Three.js pode funcionar como renderer primário do novo mundo** dentro da arquitetura React/Vite/Capacitor existente, com apresentação 3D real ortográfica/2.5D, integração acessível, lifecycle controlável e desempenho viável no Moto G06.

A F1 produz evidência para uma decisão arquitetural posterior. Ela não autoriza arquitetura espacial definitiva, persistência, gameplay, personagens ou produção de conteúdo do mundo.

---

## 2. Autoridades e premissas vigentes

O spike deve respeitar as autoridades documentais ativas do projeto, especialmente:

- `docs/STATUS.md`: o mundo anterior foi removido; a Biblioteca é atualmente um placeholder React; o novo mundo começa do zero.
- `docs/ROADMAP.md`: a Fundação deve definir renderer, limites arquiteturais, prova mínima em Android modesto e critérios de acessibilidade antes do pipeline 3D e da persistência espacial.
- `docs/ARCHITECTURE.md`: React permanece na apresentação; `domain`, `application` e `infrastructure` mantêm suas fronteiras atuais.
- `docs/WORLD.md`: o novo mundo será 3D real com apresentação ortográfica/2.5D e não herda contratos espaciais da implementação encerrada.
- `docs/ACCESSIBILITY.md`: funções essenciais não podem depender exclusivamente de áudio, animação, gesto preciso ou cor.
- `docs/PERFORMANCE.md` e `docs/RISKS.md`: desempenho 3D em Android modesto permanece risco aberto e deve ser provado fisicamente.
- `docs/ASSET_PIPELINE.md`: assets externos exigem procedência e validação; o pipeline 3D formal ainda não existe.
- `docs/decisions/ADR-008-world-reset.md`: Phaser e os contratos espaciais anteriores foram encerrados; renderer, pipeline e persistência do novo mundo devem nascer de decisões novas.

O checkout, os testes e o estado Git continuam sendo evidência superior a suposições documentais sobre implementação.

---

## 3. Decisões congeladas para a F1

### 3.1 Stack experimental

A primeira implementação deve usar:

- **Three.js direto**;
- `WebGLRenderer` como backend inicial;
- `OrthographicCamera`;
- `GLTFLoader` para provar ingestão de GLTF/GLB;
- um host React próprio para montar e desmontar o runtime;
- TypeScript conforme o baseline atual do projeto.

### 3.2 Fora da F1

Não usar na primeira prova:

- React Three Fiber (R3F);
- WebGPU como requisito ou backend principal;
- Babylon.js;
- PlayCanvas;
- Godot;
- qualquer segundo renderer em paralelo.

R3F poderá ser avaliado futuramente somente se a integração direta React ↔ Three.js demonstrar complexidade concreta que ele resolva. WebGPU poderá ser explorado depois que o baseline WebGL2 estiver tecnicamente aprovado e somente como trabalho separado.

### 3.3 Escolha reversível

Three.js é o candidato primário, não uma escolha irrevogável. Ele só deve ser abandonado se a F1 produzir evidência de bloqueio estrutural após uma tentativa razoável e limitada de correção/otimização.

Não criar implementações concorrentes preventivamente.

---

## 4. Limites arquiteturais

A integração deve preservar conceitualmente a seguinte direção:

```text
React / LibraryPage
        ↓
World Host
        ↓
Three World Runtime
        ↓
Three.js
```

### 4.1 React

React continua responsável por:

- montagem e desmontagem da superfície;
- shell e navegação do aplicativo;
- estados semânticos e acessíveis da interface;
- apresentação de diagnóstico quando autorizada;
- ponte mínima de seleção com o runtime experimental.

### 4.2 Runtime Three.js

O runtime do spike pode ser browser-aware e depender de Three.js, mas deve ficar isolado da lógica convencional do produto. Ele é responsável por:

- renderer;
- cena;
- câmera;
- loop de renderização;
- input espacial;
- raycast/picking;
- carregamento do fixture 3D;
- resize;
- pause/resume;
- disposal de recursos;
- métricas técnicas do renderer.

### 4.3 Fronteiras proibidas

Durante a F1:

- `domain` não conhece Three.js;
- `application` não conhece Three.js;
- Three.js não acessa Dexie;
- React não passa a acessar Dexie diretamente;
- não nasce entidade de domínio espacial;
- não nasce porta de persistência espacial;
- não há alteração de schema Dexie;
- não há alteração do formato de backup por causa do mundo.

O estado de seleção usado no spike é experimental e efêmero. Pode existir apenas na ponte React/runtime e desaparece ao desmontar a cena.

---

## 5. Cena padrão da F1

A cena deve ser propositalmente pequena, técnica e descartável. Ela não define a arte final da Biblioteca.

### 5.1 Conteúdo mínimo

A cena deve conter:

- um piso simples;
- quatro segmentos de parede ou proxies equivalentes que permitam leitura de pequeno cômodo;
- de 3 a 5 proxies de mobiliário/objetos distintos;
- **pelo menos um modelo GLB/GLTF carregado via `GLTFLoader`**;
- um conjunto repetido de objetos simples suficiente para levar a cena a aproximadamente **25–50 objetos visíveis**;
- iluminação ambiente/hemisférica simples;
- uma luz direcional simples.

### 5.2 Asset de prova

O GLB/GLTF deve ser apenas um fixture técnico.

Preferências, em ordem:

1. asset simples criado/gerado para o próprio spike;
2. sample permissivo com autoria, origem e licença registradas;
3. outro asset somente se sua procedência estiver clara.

Não iniciar ainda o pipeline formal de produção 3D.

### 5.3 Sombras e efeitos

O benchmark base deve manter efeitos caros fora da equação sempre que não forem necessários para provar a fundação.

Baseline recomendado:

- sombras em tempo real **desligadas**;
- sem pós-processamento;
- sem partículas;
- sem animação complexa;
- sem física.

Uma variante com sombra só pode ser medida depois e deve ser identificada como variante, nunca misturada ao baseline.

### 5.4 Direção visual

A cena deve demonstrar:

- 3D real;
- câmera ortográfica;
- leitura 2.5D;
- chão e paredes simultaneamente legíveis;
- profundidade clara em tela mobile.

Ângulo, iluminação, escala e materiais utilizados na F1 **não se tornam autoridade artística**.

---

## 6. Câmera e input

### 6.1 Câmera

Usar `OrthographicCamera` com enquadramento inclinado apropriado à leitura 2.5D.

A prova deve incluir:

- enquadramento inicial previsível;
- pan;
- zoom com limites;
- atualização do frustum em resize/orientation;
- preservação de uma leitura útil em viewport mobile.

### 6.2 Desktop

A prova pode oferecer:

- drag para pan;
- wheel para zoom;
- clique para seleção.

### 6.3 Touch/mobile

A prova deve oferecer:

- arrasto para pan;
- pinch para zoom;
- toque para seleção;
- limiar que reduza a confusão entre toque e gesto de pan;
- tratamento de `pointercancel`/interrupções equivalentes;
- respeito às safe areas do shell existente.

Não implementar arraste de móveis, construção, edição espacial ou gestos de gameplay.

### 6.4 Picking

A seleção espacial deve ser realizada por mecanismo apropriado do Three.js, como `Raycaster` ou equivalente justificável.

Ao selecionar um objeto:

1. o runtime aplica feedback visual simples no mundo;
2. React recebe a seleção efêmera;
3. uma superfície React apresenta o nome/identificador fictício do objeto.

---

## 7. Prova de acessibilidade e ponte bidirecional

O canvas 3D não deve ser a única superfície semântica da prova.

A F1 deve incluir uma pequena superfície React semântica que:

- descreva que a Biblioteca está exibindo um ambiente 3D experimental;
- informe em texto o objeto atualmente selecionado;
- permita alterar a seleção sem depender de toque preciso no canvas, por exemplo por controle nativo simples como anterior/próximo ou lista equivalente;
- faça a seleção realizada pela UI React refletir novamente no highlight do objeto 3D.

A prova, portanto, deve demonstrar comunicação nos dois sentidos:

```text
Mundo 3D → estado efêmero → React acessível
React acessível → estado efêmero → Mundo 3D
```

Não alegar aprovação TalkBack sem validação humana em aparelho real.

---

## 8. Lifecycle obrigatório

O runtime precisa possuir capacidade explícita equivalente a:

```text
create / mount
start
pause
resume
resize
dispose
```

Os nomes concretos da API podem variar, mas as responsabilidades não.

### 8.1 Abrir Biblioteca

- criar uma única instância do runtime;
- criar um único canvas;
- iniciar um único loop de renderização.

### 8.2 Navegar para outra rota

Ao desmontar a Biblioteca:

- cancelar `requestAnimationFrame`/loop equivalente;
- remover listeners;
- remover observers;
- desmontar controles de input;
- liberar geometrias, materiais, texturas e recursos GPU que pertencem ao runtime;
- liberar renderer/contexto quando apropriado;
- remover o canvas;
- zerar referências que manteriam recursos vivos indevidamente.

### 8.3 Reabrir Biblioteca

- recriar uma única instância limpa;
- não acumular canvas;
- não acumular listeners;
- não executar múltiplos loops em paralelo.

### 8.4 Background/resume

Quando a aplicação/página perde visibilidade:

- pausar trabalho contínuo desnecessário.

Ao recuperar visibilidade:

- retomar de forma previsível;
- não duplicar runtime ou loop;
- preservar somente o estado efêmero necessário à sessão atual.

### 8.5 Repetição de lifecycle

A validação deve repetir pelo menos **10 ciclos Biblioteca → outra rota → Biblioteca** no ambiente automatizável e incluir repetição manual no Android.

---

## 9. Observabilidade

A F1 deve criar instrumentação local suficiente para diagnosticar o renderer sem introduzir analytics.

Registrar, quando tecnicamente disponível:

- FPS;
- frame time;
- `renderer.info.render.calls` ou equivalente;
- triângulos;
- geometries;
- textures;
- número aproximado de objetos/meshes da cena;
- tempo entre entrada na Biblioteca e primeiro frame utilizável;
- tempo de carregamento do GLB/GLTF;
- tamanho do bundle/entrypoints antes e depois da dependência;
- erros WebGL/Three relevantes.

A instrumentação deve ser local, descartável ou claramente diagnóstica. Não enviar telemetria para serviço externo.

### 9.1 Configuração do benchmark

Toda medição deve registrar as condições relevantes, especialmente:

- dispositivo/navegador ou APK;
- resolução/viewport;
- device pixel ratio efetivo;
- antialias ligado/desligado;
- sombras;
- quantidade de objetos;
- versão instalada do Three.js;
- build de desenvolvimento ou produção.

Não comparar medições obtidas com configurações diferentes como se fossem equivalentes.

---

## 10. Budget provisório da F1

O projeto ainda não possui budget definitivo para o mundo 3D. A F1 serve justamente para criar o primeiro baseline.

Ainda assim, para evitar aprovação puramente subjetiva, adota-se o seguinte **piso provisório de viabilidade** para a cena de referência em build de produção no Moto G06:

- **30 FPS sustentados como piso esperado** durante interação normal com a cena base;
- **45–60 FPS como faixa desejável**, sem obrigação de atingir 60 FPS constantes;
- ausência de travamentos recorrentes perceptíveis, congelamentos prolongados ou crashes;
- estabilidade após múltiplos ciclos de abrir/sair/reabrir e background/resume.

O relatório deve registrar FPS e frame time reais. O valor de 30 FPS não é budget artístico definitivo e poderá ser recalibrado a partir da evidência física.

### 10.1 Falha de desempenho

Se a cena base ficar abaixo do piso de forma consistente, é autorizada **uma rodada curta e explicitamente registrada de otimização da fundação**, limitada a causas plausíveis como:

- pixel ratio excessivo;
- lifecycle incorreto;
- recursos duplicados;
- geometria/material desnecessariamente duplicado;
- configuração inadequada do renderer;
- erro óbvio de draw calls;
- carregamento ou atualização por frame desnecessários.

Essa rodada não autoriza reduzir artificialmente a prova a um Hello World inútil nem introduzir uma arquitetura nova.

Se, mesmo após correção razoável, a cena mínima continuar estruturalmente inadequada no Moto G06, Three.js deve ser considerado **não aprovado** e a próxima alternativa poderá ser estudada de forma sequencial.

---

## 11. Gates técnicos

### Gate T1 — checkout e dependência

- worktree inicial inspecionada;
- alterações preexistentes preservadas;
- Three.js adicionado pela forma normal do projeto;
- versão exata e impacto no lockfile registrados;
- nenhuma segunda engine 3D adicionada.

### Gate T2 — web/runtime

- Biblioteca monta uma única cena;
- câmera ortográfica funcional;
- cena 3D real visível;
- GLB/GLTF carregado;
- pan/zoom/picking funcionam;
- ponte React ↔ Three funciona;
- resize funciona;
- console sem erros relevantes.

### Gate T3 — lifecycle

- unmount limpa runtime;
- remount não duplica canvas, listeners ou loops;
- background/resume funciona;
- recursos Three pertencentes ao runtime são descartados explicitamente.

### Gate T4 — acessibilidade estrutural

- superfície React semântica existe;
- estado selecionado aparece em texto;
- seleção pode ser alterada por controle React nativo sem gesto preciso no canvas;
- alteração pela UI reflete no mundo;
- fluxo convencional do app não perde sua semântica existente.

### Gate T5 — regressão convencional

Rodar verificação proporcional ao risco, incluindo no mínimo:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run performance:report
npm run test:e2e
```

E, para Android:

```text
npm run android:sync
npm run android:build:debug
```

Também:

```text
git diff --check
git status --short
```

`audio:check` deve ser incluído caso alterações toquem o fluxo geral de build/configuração ou se a suíte normal do projeto exigir seu gate completo.

### Gate T6 — Android técnico

- build web de produção concluído;
- sync Capacitor concluído;
- APK debug gerado;
- nenhuma alegação de desempenho físico baseada apenas no build.

---

## 12. Gate físico obrigatório — Moto G06

A Fundação Three.js **não pode ser considerada aprovada apenas por desktop, Playwright ou APK compilado**.

A validação humana no Moto G06 deve verificar e registrar:

1. instalação/abertura do APK correspondente à F1;
2. entrada na Biblioteca;
3. renderização correta da cena;
4. pan por toque;
5. pinch zoom;
6. seleção por toque;
7. seleção pelo controle React alternativo;
8. navegação para outra rota e retorno à Biblioteca;
9. background/resume;
10. repetição de abertura/fechamento sem degradação evidente;
11. FPS/frame time exibidos pela instrumentação da F1;
12. crashes, congelamentos, artefatos ou falhas gráficas;
13. percepção de responsividade;
14. temperatura/comportamento físico anormal, quando perceptível;
15. validação TalkBack somente se o usuário optar por executá-la neste checkpoint.

TalkBack completo permanece um gate humano e não deve ser declarado aprovado sem teste real. A F1 precisa, no mínimo, provar que a arquitetura preserva uma superfície React semanticamente acessível.

---

## 13. Testes automatizados mínimos do spike

A implementação deve adicionar testes proporcionais, sem transformar a F1 em uma suíte de gameplay inexistente.

Cobrir, quando praticável:

- criação/destruição do runtime;
- idempotência ou proteção contra mount duplicado;
- atualização de resize;
- ponte de seleção runtime → React;
- ponte de seleção React → runtime;
- comportamento de rota: Biblioteca monta e desmonta o viewport;
- E2E garantindo que múltiplas visitas não acumulem canvases;
- fallback/estado textual se a inicialização do renderer falhar.

Testes que dependem de WebGL real não devem ser fingidos por mocks como prova de desempenho. O objetivo do mock é validar contrato e lifecycle; a prova gráfica pertence ao navegador e ao aparelho.

---

## 14. Tratamento de falha do renderer

Se Three.js/WebGL não puder inicializar:

- a aplicação convencional continua utilizável;
- a rota Biblioteca apresenta estado textual compreensível;
- o erro pode ser registrado localmente de forma diagnóstica, sem conteúdo pessoal;
- não entrar em loop infinito de recriação do renderer;
- não quebrar Coleção, Arquivo, Resumo ou Ajustes.

O mundo visual é central ao produto futuro, mas o spike não pode comprometer o aplicativo convencional já funcional.

---

## 15. Proibições explícitas da F1

A F1 **não autoriza**:

- persistência espacial;
- novas tabelas Dexie;
- alteração de schema por causa do mundo;
- alteração de backup por causa do mundo;
- `PlacedObject`;
- `WorldStructureState`;
- grid 32 ou qualquer grid herdado;
- reaproveitamento de código Phaser;
- construção de paredes pelo sistema legado;
- editor de construção;
- inventário espacial;
- progressão espacial;
- rewards/grants espaciais;
- personagens;
- IA;
- diálogos;
- rotinas de NPC;
- pathfinding;
- física;
- sistema de animação de personagem;
- ECS de domínio;
- gameplay;
- pipeline 3D formal;
- catálogo real de assets da Biblioteca;
- materiais/iluminação finais;
- pós-processamento final;
- R3F;
- WebGPU como base;
- segundo renderer para comparação paralela;
- backend, conta, sync, nuvem, analytics ou telemetria.

Também não autoriza commit, push, tag, rebase ou operações destrutivas sem autorização explícita do usuário.

---

## 16. Entregáveis da F1

Ao terminar a implementação, o responsável deve entregar:

### 16.1 Código experimental integrado

Uma única implementação Three.js dentro da rota Biblioteca, respeitando este contrato.

### 16.2 Relatório técnico

O relatório deve conter:

- versão exata do Three.js;
- arquivos criados/alterados;
- arquitetura realmente implementada;
- configuração do renderer;
- descrição da cena;
- asset GLB/GLTF e procedência;
- resultados de lint/typecheck/test/build/E2E;
- resultado Android build;
- métricas desktop;
- métricas Android quando o teste humano for realizado;
- lifecycle verificado;
- comportamento de disposal;
- limitações encontradas;
- qualquer divergência deste contrato;
- `git status --short` final.

### 16.3 Evidência física humana

O responsável técnico não deve inventar essa evidência. O usuário registra o que foi observado no Moto G06; esse registro é incorporado ao fechamento da F1.

---

## 17. Critérios de aprovação da Fundação Three.js

Three.js pode ser promovido de **candidato primário** para **renderer aprovado da fundação** somente quando:

1. todos os gates técnicos aplicáveis passarem;
2. a cena padrão funcionar em produção web;
3. o APK for gerado e executado no Moto G06;
4. lifecycle for estável em mount/unmount e background/resume;
5. não houver regressão significativa no aplicativo convencional;
6. a ponte React ↔ mundo estiver demonstrada;
7. existir caminho React semântico para a interação de prova;
8. GLB/GLTF funcionar sem introduzir pipeline definitivo prematuro;
9. a instrumentação fornecer baseline útil;
10. desempenho físico for considerado viável, usando 30 FPS sustentados como piso provisório da cena base e julgamento humano de responsividade/estabilidade;
11. não houver bloqueio estrutural conhecido que exija reescrita imediata da fundação.

---

## 18. Critérios de não aprovação / abandono

Three.js não deve ser aprovado se ocorrer, de forma estrutural e reproduzível:

- incompatibilidade relevante com Capacitor/Android;
- crash ou perda de contexto recorrente não resolvida em cenário mínimo;
- desempenho persistentemente inviável no Moto G06 após uma rodada curta de correção razoável;
- lifecycle incapaz de desmontar e recriar o runtime de forma limpa;
- integração que force Three.js para dentro de `domain`/`application` ou gere ruptura arquitetural injustificada;
- impossibilidade prática de manter uma superfície React acessível associada às interações essenciais;
- custo de bundle/runtime claramente desproporcional já na prova mínima;
- dependência de hacks frágeis que não sejam aceitáveis como fundação de longo prazo.

Uma falha deve ser diagnosticada e registrada antes de considerar outro renderer. A alternativa seguinte é estudada **sequencialmente**, nunca em paralelo por padrão.

---

## 19. Critério específico para considerar R3F futuramente

R3F não entra na F1.

Um sub-spike de R3F só deve ser considerado se, depois da implementação direta, aparecer evidência concreta de que a ponte React ↔ Three.js está produzindo problemas como:

- sincronização declarativa excessivamente manual;
- grande duplicação de lifecycle;
- composição de cenas difícil de manter;
- sincronização de estado React/Three propensa a bugs;
- quantidade relevante de glue code que R3F eliminaria sem comprometer performance ou ownership do runtime.

A adoção não deve ocorrer apenas porque R3F é popular ou conveniente em demos.

---

## 20. Fechamento documental após a F1

Antes da aprovação física, documentação não deve afirmar que Three.js é a fundação definitiva.

Se a F1 for aprovada, o checkpoint seguinte deve atualizar, conforme aplicável:

- `docs/STATUS.md` — estado presente;
- `docs/ROADMAP.md` — próximo trabalho;
- `docs/ARCHITECTURE.md` — fronteira do novo runtime;
- `docs/WORLD.md` — renderer vigente e estado da fundação;
- `docs/PERFORMANCE.md` — primeiro baseline 3D;
- `docs/ACCESSIBILITY.md` — contrato React ↔ superfície 3D;
- `docs/RISKS.md` — atualizar R-09 conforme a evidência;
- `docs/ASSET_PIPELINE.md` — somente o que tiver sido realmente provado;
- `CHANGELOG.md` — mudança observável, se aplicável;
- `docs/decisions/` — criar a próxima ADR para a fundação aprovada (provavelmente ADR-009, respeitando o índice vigente).

A ADR de fundação deve registrar a evidência da F1 e não apenas preferência teórica.

Se Three.js for reprovado, a documentação deve registrar a reprovação e suas causas sem manter uma implementação paralela abandonada no baseline ativo.

---

## 21. Definição de pronto da F0-D

A F0-D está concluída quando este contrato é aceito como orientação da F1.

Com este contrato, ficam resolvidos:

- candidato primário;
- stack inicial;
- limites arquiteturais;
- cena padrão;
- input;
- lifecycle;
- asset de prova;
- acessibilidade estrutural;
- observabilidade;
- budget provisório;
- gates web/Android;
- gate físico;
- testes mínimos;
- proibições;
- entregáveis;
- critérios de aprovação e abandono;
- condição para avaliar R3F.

Nenhuma decisão adicional do produto é necessária antes de iniciar a F1.

---

## 22. Próximo passo autorizado

**F1 — Three.js Foundation Spike**

Implementar exatamente a prova definida neste contrato, sem expandir o escopo para o primeiro recorte real da Biblioteca.
