## BF-5.6D — pacotes educacionais (candidata)

`EducationalPacksService` coordena porta de pacotes, repositório global e transações; `JsonEducationalPackCodec` valida manifesto/lotes e SHA-256 antes da escrita. Dexie v18 acrescenta registro de instalação separado de cartas/revisões; disponibilidade não altera correção histórica. `LocalPackCatalogue` distribui metadados e conteúdo sob demanda, com pins e cache web opcional somente público. Backup v10 projeta apenas dados privados/revisões referenciadas e recibos reinstaláveis. React abre `/arcanario/pacotes`, usa a aplicação, pagina o Acervo e reutiliza o motor da C; Portal consulta resumo. Nenhum runtime Three/Canvas novo. [ADR-028](decisions/ADR-028-pacotes-educacionais-retencao.md) e [limites/gates](BF-5_6D_PACOTES_OFICIAIS_IMPLEMENTACAO.md).

## BF-5.6C — Provações (candidata)

`domain/provations.ts` contém seleção determinística, transições, DTO sem gabarito antes da confirmação, pontuação e diagnóstico puro. `application/provations.ts` coordena início/comandos com leitura e escrita transacionais pela porta Arcanarium, revisão esperada e persistência antes de avanço. Oficina reutiliza o agregado global de questões. React usa as portas de aplicação e rascunhos privados; não acessa Dexie. Sessões fotografam taxonomia e fixam revisões imutáveis; relatórios distinguem repetições e evidência. UI em fólio natural e radios visíveis; sem mudança de Three/WorldHost. [Contrato completo e limites](decisions/ADR-027-provacao-taxonomia-diagnostico.md).

## BF-5.6B — Oficina e navegação do Arcanário (candidata)

Rota lazy `/arcanario/*`, portal/salas React e cartas SVG/CSS autorais; WorldHost continua residente e pausado fora da Biblioteca, sem novo Canvas. `ArcanariumWorkshop` coordena carta/versão, links de Estudos, decks e mídia em uma transação; eventos após commit. `CardExchange` coordena cópias atômicas e codec estrito na infraestrutura; React não acessa Dexie. Rascunhos privados locais passam por porta própria e validação ao recuperar. [ADR-026](decisions/ADR-026-arcanario-oficina-midias-troca.md), [relatório B](BF-5_6B_OFICINA_COLECOES_IMPLEMENTACAO.md). As descrições da A abaixo são a cronologia da fundação preservada.

## BF-5.6A — fundação do Arcanário em candidata

`domain/arcanarium` define dados semânticos discriminados, versões, seleção de baralhos, classificação, sessões e invariantes puras; não conhece renderer ou armazenamento. `ArcanariumService` coordena a porta `ArcanariumRepository` e transações, revisões esperadas e consultas globais. `DexieArcanariumRepository` valida as linhas; upgrade e restore compartilham `promoteLegacyFlashCards`. Dexie v15 e backup v7 seguem a [ADR-025](decisions/ADR-025-arcanario-fundacao-persistencia.md).

`DexieLibraryEntryRepository` entrega uma projeção canônica dos flashcards aos comandos/componentes existentes, em leitura transacional. Save geral conserva o arquivo legado imutável. Save/DeleteFlashCard escrevem só no acervo/vínculos e atualizam metadados do Estudo; eventos do Estudo saem após commit. Edição global também atualiza e notifica Estudos vinculados após commit. React usa a aplicação para edição e respostas de revisão, sem acessar Dexie. Sessões imutabilizam referências a versões; as respostas são sequenciais e persistidas antes do avanço visual.

Nenhuma Oficina, rota Arcanário, filtro executável, importador de pacotes, motor de questão/combate ou alteração do runtime 3D é implementada. [Evidências e limitações](BF-5_6A_FUNDACAO_IMPLEMENTACAO.md). As descrições anteriores abaixo são cronologia.

> **R5E:** `inhabitantPresence` é controlador local de materiais FX e luz, criado/descartado por `inhabitantVisuals` e atualizado pelo RAF existente. Não escreve bones, posição, yaw, reservas ou persistência. Hover de Ytha é geometria/clip com clearance visual; agência e colisões continuam no mesmo plano/envelope 0,92 m. [Contrato artístico/técnico](audits/BV_RECUPERACAO_R5E.md).

> **R5 — candidata em implementação (07/11/2026):** R5A–D candidatas publicadas na [PR draft #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40), sobre main `7100ff6` integrada com R4. Quatro GLBs remodelados, skins reais, oito clips reconstruídos, sockets explícitos e descarte de Skeleton. 950 unitários PASS; E2E dirigido 0/2 após correção de preparação, sem retries; APK debug gerado; aceite artístico individual/Moto G06 pendentes, assento/F2B/F2C não entregues, CI remota omitida por cota. Recuperação integral aberta. [Relatório vigente](audits/BV_RECUPERACAO_R5.md) · [Pipeline](INHABITANT_ART_PIPELINE.md). Notas abaixo preservam a cronologia.

> **R4 — candidata de 07/11/2026:** main base `d5eb469` integra PRs #32–#38 e aceites físicos dirigidos R2/R3/segurança. R4A–D implementadas na PR draft #39; gates estáticos, 935 unitários, web e APK debug locais PASS. Dados/sessões separados, diagnóstico opt-in e integridade v6 reforçada. Playwright dirigido **3 PASS/1 FAIL** (seleção R2 por deadline, causa não atribuída); sem aprovação física R4 ou CI global verde. [Autoridade canônica e evidências](audits/BV_RECUPERACAO_R4.md). BF-5.5 parcial; R5, F2B/F2C e BF-5.5G não iniciadas. Notas anteriores são cronologia.

> **R3C — lifecycle (07/11/2026):** montagem invalida RAFs cancelados por geração e possui no máximo um agendamento; descarte terminal inclui Line/Points e perde o contexto WebGL após remover listeners. Pausa de aba/background mantém a instância e seus recursos. Context restoration não revive instância terminal. [Evidências e limites de retenção](audits/BV_RECUPERACAO_R3.md#r3c--bv-15).

> **R3B — contrato de composição (07/11/2026):** `AgencyEnvironment` fornece obstáculos/oportunidades readonly a cada `InhabitantAgency.update`. Runtime atualiza livro pessoal antes de amostrar essas entradas e compartilha poses pós-agência entre visuais. Catálogo autoral em `inhabitantActivities`; agência continua única autoridade de movimento, `InteractionCoordinator` única autoridade de reservas e livro pessoal conserva root/capa/devolução. [Estrutura, evidências e limites](audits/BV_RECUPERACAO_R3.md#r3b--bv-10).

## BF-5 — Atlas clássico projetado

`ClassicAtlas` substitui integralmente o rig/poses de `BodyStudy` e `atlasMotion`. Seis WebPs locais, decodificação antecipada e dissolução entre duas camadas por opacidade CSS; timers de permanência/transição, sem RAF contínuo ou engine nova. Observers/visibilidade/preferências/pausa cancelam o ciclo e callbacks obsoletos. Metadados e cálculo metabólico permanecem na superfície semântica do fólio, fora das imagens. [ADR-022](decisions/ADR-022-atlas-classico-projetado.md). A descrição de rig na Parte 2F abaixo foi substituída.

## BF-5 Parte 2F — Empreitadas, atlas e estrelas

`SaveEndeavor` coordena leitura/revisão/transação do agregado `WorkEntry.plan?`, validado por regras puras do domínio. Sem React→Dexie, tabelas espaciais ou projeção de tarefas. Dexie v14 aditiva e backup v6 compartilham validação estrita. `BodyStudy` compõe gravuras SVG originais distintas com hierarquia articulada; RAF, observer/visibilidade/preferências pertencem à apresentação e são liberados no cleanup. `StarRating` compartilha semântica nativa; `PersistedRating` coordena feedback provisório e recuperação. Comandos existentes atualizam a nota única; Canvas desenha estrelas geométricas da nota persistida, incluindo opção de ocultação. [ADR-021](decisions/ADR-021-empreitadas-atlas-avaliacoes.md).

# BF-5 Parte 2E — controles, mídia e composição (2026-11-04)

`src/ui/BVPicker.tsx` mantém seletores/calendário na top layer DOM, com valores/validação convencionais e Back exclusivo da superfície superior. `RecordCoverEditor` acessa a porta generalizada de mídia, nunca Dexie. Dexie v13 conserva a tabela `media` v12 e amplia ownership para livros, com backup v6 validado. `BVShareComposer` coordena estado/PNG/entrega; adaptadores de livro/cinema fornecem somente conteúdo explicitamente compartilhável, e `renderSharePlate` desenha em Canvas 2D independente da tela. [ADR-019](decisions/ADR-019-controles-internos-capas-atelie.md).

A [ADR-020](decisions/ADR-020-baralhos-e-cartas-globais.md) é recomendação para futuro subsistema de cartas, sem implementação/migração ou contrato espacial novo. Fronteiras de domínio/aplicação/infraestrutura e os seis tipos/renderer permanecem vigentes.

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

- `LibraryPage` descreve a experiência e preserva as ações convencionais; seu layout reutiliza o contrato global de `env(safe-area-inset-*)`, enquanto o padding de `app-content` reserva o dock fixo. Nem safe areas, header, dock ou breakpoints são repassados ao runtime;
- `WorldHost` pertence à apresentação, carrega o runtime sob demanda, mantém no máximo uma instância montada/viva por vez e faz a ponte de seleção, diagnóstico e falha terminal tipada com React;
- `ThreeWorldRuntime` pertence à camada de apresentação/experiência, depende de browser/DOM e concentra `WebGLRenderer`, cena, `OrthographicCamera`, GLTF/GLB, input, picking, highlight, loop, resize, pause/resume, visibilidade, métricas e disposal; uma falha estrutural de render, resize ou `webglcontextlost` leva a instância de uso único ao estado terminal `failed`, libera a montagem e emite uma única falha tipada ao host;
- React permanece responsável pela superfície semântica e pelo fallback, sem importar Three.js;
- a fronteira semântica sobrevivente é `React semântico ↔ estado efêmero ↔ ThreeWorldRuntime → Three.js`; F6 concluiu esse contrato tecnicamente, sem declarar TalkBack ou acessibilidade humana Android aprovados;
- a fronteira `WorldRuntime` expõe somente descritores selecionáveis, diagnóstico efêmero e uma falha terminal segura para UI/log; não expõe tipos ou detalhes de Three.js;
- cada montagem do runtime possui um agrupamento interno único que detém renderer, canvas, cena, câmera, interação, RAF, observers/listeners e recursos da cena; `ResizeObserver` é o caminho primário de viewport e `window.resize` é seu fallback, ambos registrados uma vez e removidos pela mesma montagem. O runtime mede apenas o bounding rect efetivo do `world-host`; dimensões não finitas, não positivas ou não representáveis aguardam o próximo viewport válido, sem fabricar frustum, renderer ou frame, e callbacks tardios após terminalidade são inertes. Mudança de geometria válida ou viewport transitório invalida só o gesto ativo antes de aplicar o novo viewport; durante `paused`, resize e callback de fixture atualizam somente o estado necessário, sem frame incidental;
- `ThreeWorldInteraction` continua sendo o único owner de Pointer Events, capture, wheel, picking e highlight. Uma candidatura de tap é explicitamente ligada ao primeiro `pointerId` e sua elegibilidade só decresce: exceder `8` CSS px, segundo pointer/pinch, wheel com pointer ativo, cancelamento/perda de capture, pausa, disposal ou terminalidade a invalidam sem reabilitação. O primeiro evento além do slop reposiciona a origem do pan; nenhum Raycaster ocorre antes do `pointerup` elegível. A transição de pinch para um pointer continua como pan limpo, sem transformar o fim do pinch em seleção;
- a `OrthographicCamera` pertence à montagem de `ThreeWorldRuntime` e reflete o `CameraNavigation` runtime-only, única fonte de `targetX`, `targetZ` e `zoom`; `ThreeWorldInteraction` continua dona de Pointer Events, wheel e pinch, mas converte coordenadas pelo bounding rect atual e pede operações mínimas ao modelo em vez de mutar a câmera. `cameraMath` deriva framing/bounds da fixture e resolve screen space no plano X/Z: pan usa a diferença entre pontos sucessivos, wheel preserva sua âncora e pinch mapeia o ponto do midpoint anterior para o atual enquanto aplica a razão de distância. O clamp usa região convexa válida de centros de câmera, preservando patch mínimo projetado do piso em vez dos cantos vazios do AABB. O target Y é fixo em `1.1`; resize preserva foco lógico/seleção salvo clamp matematicamente necessário, GLB tardio não é fonte de framing e React não possui estado de câmera. Tap confirmado faz picking pela câmera e bounding rect atuais; tap vazio limpa a seleção;
- os listeners do canvas para `webglcontextlost` e `webglcontextrestored` pertencem à montagem, são registrados uma vez e removidos antes de renderer/canvas; `mount()` interrompido, `dispose()` e falha terminal convergem para a mesma liberação idempotente;
- a política vigente para perda de contexto é terminal: `webglcontextlost` previne o default, encerra a montagem e deixa React apresentar o fallback `{ code: "unavailable" }`; `webglcontextrestored` não retoma nem reconstrói a instância descartada, que só pode ser substituída pelo ciclo normal do host/rota;
- o carregamento do fixture por `GLTFLoader` não possui abort explícito neste baseline; após `failed` ou `disposed`, callback tardio descarta e libera o modelo sem alterar estado, renderizar ou reativar o runtime. Erro normal de carregamento do fixture continua recuperável;
- `domain` e `application` não conhecem Three.js; o runtime não acessa Dexie, backup nem portas de persistência;
- não existe entidade, tabela, porta ou backup espacial; seleção e câmera atuais são efêmeras.

O baseline vigente usa Three.js direto, `WebGLRenderer`, `OrthographicCamera` e GLTF/GLB. R3F não foi adotado e WebGPU não substitui o baseline WebGL. Alternativas não serão implementadas em paralelo e só serão reabertas diante de evidência estrutural futura.

A cena técnica da F1 prova o runtime e a F3 concluiu seu contrato de câmera/interação, mas ela não constitui arquitetura permanente de conteúdo, UX do mundo real ou Biblioteca final. A ADR-010 definiu o contrato documental do Pipeline 3D v1; ingestão produtiva, `AssetManager`/cache, catálogo e persistência espacial continuam fora da arquitetura implementada.

## Reconciliação e diagnóstico R4

A página consulta catálogo/anotações na ativação e sessão+registro por ID nos eventos pós-commit de sessão, em fila limitada ao lifecycle da instância ativa. Snapshots imutáveis usam igualdade estrutural de objetos plain, sem serialização de catálogo. Registro alterado ainda reprojeta catálogo; registro igual conserva a identidade do snapshot.

WorldHost mantém inputs de construção independentes dos metadados: IDs/modelos/ordem dos seis tipos, título/autor dos livros e identidades/vínculos/categorias de pergaminhos. Metadados sem consumidor 3D permanecem atuais no React; não provocam remount. Acrescentar um consumidor visual desses campos exige revisar `worldSceneIdentity`, seus testes e reconciliação; não preservar um estado visual obsoleto. Inserção/exclusão/mudança física ainda usa descarte e montagem pelo único owner; runtime nunca consulta Dexie.

Diagnóstico assina somente com painel aberto. Probe limitada de CPU/long tasks segue assinatura, pausa e descarte; inventário amplo periódico depende de consumidor. Datasets baratos de lifecycle permanecem. GPU/apresentação não são inferidas do relógio CPU. [Métricas e limites](audits/BV_RECUPERACAO_R4.md).
