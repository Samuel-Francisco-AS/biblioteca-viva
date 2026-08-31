# W3-A-R — Plano corretivo pós-auditoria

> Projeto: Biblioteca Viva
>
> Revisão: 3 — plano fracionado após a auditoria W3-A-R0
>
> Data: 2026-08-31
>
> Estado: R0 concluído tecnicamente e pendente de aceite humano; R1 não autorizado
> Substitui, para novas execuções, o plano pré-auditoria `W3-A_RODADA_CORRETIVA_PLANO_E_PROMPT.md`.

## 1. Decisão executiva

A auditoria demonstrou que a planta canônica **já é uma sala fechada no modelo lógico**. Ela contém 120 células de piso, 44 arestas de perímetro e 44 arestas estruturais correspondentes, sem lacunas, sobreposições ou duplicidades.

Portanto, esta revisão:

- elimina a antiga etapa de reconstrução do blueprint, grants e migração;
- preserva schema v7, backup v5, inventário e construções existentes;
- concentra a correção visual no contrato dos assets, no compositor usado em produção e nos metadados duplicados;
- concentra a correção de uso na máquina de estados, na interação direta com o mapa e na UI mobile;
- divide a troca dos cantos em especificação técnica, produção artística humana e integração controlada;
- exige autorização humana nominal entre todas as atividades.

O objetivo de produto permanece:

> Uma sala deve parecer uma sala e uma casa deve parecer uma casa: paredes, cantos e porta formam uma construção contínua, sem vãos, desalinhamentos, sobreposições acidentais ou aparência de peças de Lego soltas. Durante a edição, o mapa continua sendo a superfície principal.

## 2. Fatos comprovados por R0

| Área | Evidência consolidada | Consequência para o plano |
|---|---|---|
| Planta canônica | 12×10, 120 células, 44 arestas esperadas e 44 cobertas, um ciclo fechado | não reconstruir blueprint nem grants |
| Cantos | os quatro PNGs têm um braço entre 30 e 91 px menor que o span declarado | refazer somente `ne`, `nw`, `se` e `sw` |
| Retas | os seis assets retos têm comprimentos longitudinais corretos de 300, 600 e 1200 px | mantê-los como matrizes geométricas |
| Porta | conteúdo longitudinal de 1200 px correto; offset visual de −1 célula | manter os dois PNGs inicialmente e corrigir uma vez no compositor/metadado |
| Runtime | `WorldStructureState → structureRenderPlan → WALL_ASSETS → SpatialWorldScene` | corrigir o pipeline realmente usado |
| Código histórico | `wallComposition.ts` não participa do runtime atual | não implementar a solução no caminho morto |
| Metadados | sprite e hit area consultam catálogos distintos | estabelecer uma única autoridade visual |
| Identidade | `blueprintVersion=1` também permanece em construções editadas; não há fingerprint | criar classificador normalizado sem mudar schema |
| UI | “Peças colocadas” é permanente; seleção e movimento podem coexistir | tornar estados mutuamente exclusivos e lista sob demanda |
| Mobile | painel pode ocupar cerca de 81% de 320×640 e interceptar o mapa | limitar overlays e testar oclusão real |
| Navegação | Android Back pode encerrar o app sem fechar subestados da construção | unificar a hierarquia de Back/Escape |

## 3. Nova sequência de gates

| Gate | Entrega exclusiva | Estado inicial | Autoriza alterar assets de produção? |
|---|---|---|---|
| W3-A-R0 | auditoria e causa-raiz | concluído tecnicamente; aceite humano pendente | não |
| W3-A-R1 | perímetro puro, porta lógica e identidade canônica | bloqueado por aceite de R0 | não |
| W3-A-R2-A | contrato de arte, gabaritos e validador | bloqueado por aceite de R1 | não |
| Produção artística | quatro novos cantos candidatos | bloqueada por aceite de R2-A | não; candidatos ficam fora dos caminhos ativos |
| W3-A-R2-B | validação e integração dos quatro cantos aprovados | bloqueado por aceite humano dos candidatos | **sim, somente aqui** |
| W3-A-R3 | compositor real, metadado único, porta e hit areas | bloqueado por aceite de R2-B | não refaz arte |
| W3-A-R4 | máquina de estados e interação mapa/editor | bloqueado por aceite de R3 | não |
| W3-A-R5 | responsividade, aparência e acessibilidade | bloqueado por aceite de R4 | não |
| W3-A-R6 | regressão integrada, documentação e APK debug | bloqueado por aceite de R5 | não |
| Gate físico final | validação humana no Moto G06 | bloqueado por R6 | não |

Nenhum prompt deste documento autoriza o gate seguinte. A expressão “continue” não substitui a autorização nominal indicada ao fim de cada gate.

## 4. Regra específica para os quatro cantos

Os cantos antigos **não devem ser sobrescritos manualmente antes de R2-B**.

1. R2-A mede o contrato real e gera gabaritos imutáveis.
2. Luna e o usuário produzem somente quatro candidatos, usando os gabaritos e as retas como referências obrigatórias.
3. O usuário inspeciona os candidatos fora do runtime.
4. R2-B valida os arquivos sem esticar, recortar ou reposicionar a arte para fazê-la “passar”.
5. Apenas os candidatos aprovados substituem os arquivos de fonte e de runtime, pelo pipeline determinístico do projeto.
6. O histórico Git/checkpoint anterior é a forma de recuperação; não criar cópias soltas como `old`, `backup` ou `final2` dentro do repositório.

Trocar somente a cópia runtime é proibido: uma regeneração posterior poderia restaurar o defeito a partir de `art-source`. Os nomes e IDs existentes devem permanecer estáveis, salvo impedimento técnico comprovado e nova autorização.

## 5. Protocolo comum de autorização, cota e recuperação

### Antes de cada atividade

1. Abrir uma sessão nova do Codex e enviar somente o prompt do gate autorizado.
2. Confirmar que o relatório anterior foi aceito pelo usuário.
3. Ler `AGENTS.md`, `docs/W3_A_CORRECTION_LOG.md`, `docs/STATUS.md`, `docs/ROADMAP.md` e apenas os documentos técnicos necessários ao escopo.
4. Registrar `git status --short`, commit-base e diff relevante antes de editar.
5. Comparar a worktree com o inventário de R0. A worktree já estava suja; não exigir limpeza e não atribuir mudanças preexistentes ao gate atual.
6. Parar se houver alteração preexistente sobreposta que não possa ser preservada com segurança.

### Durante cada atividade

- não usar subagentes;
- não fazer commit, push, tag, rebase, reset, release ou mudança de versão;
- não antecipar arquivos ou comportamento de gate posterior;
- executar testes focados antes da matriz ampla;
- manter a aplicação compilável sempre que possível;
- registrar decisões e evidências em `docs/W3_A_CORRECTION_LOG.md`;
- não alegar validação física, TalkBack ou Android real sem execução humana registrada.

### Protocolo de cota baixa

Ao perceber aviso de cota, contexto insuficiente ou risco de interrupção, o agente deve:

1. não começar uma alteração transversal nova;
2. concluir ou reverter apenas a unidade local em andamento, sem apagar trabalho preexistente;
3. executar o teste focado possível e `git diff --check`;
4. atualizar o log com `concluído`, `incompleto` e `não iniciado`;
5. listar exatamente os arquivos tocados e o primeiro passo seguro para retomada;
6. parar sem iniciar o gate seguinte.

### Relatório obrigatório de cada gate

- resultado e decisão técnica;
- arquivos alterados;
- testes executados, um por linha, com resultado;
- checks não executados e motivo;
- `git diff --check` e `git status --short`;
- riscos e pendências;
- declaração explícita de que o gate seguinte não foi iniciado;
- frase final: `Aguardo autorização humana nominal para <próximo gate>`.

## 6. Modelos sugeridos

| Atividade | Modelo sugerido | Observação |
|---|---|---|
| R1 | GPT-5.6 Sol High | contrato lógico pequeno, mas sensível a dados |
| R2-A | GPT-5.6 Sol High | medições e contrato de junção exigem rigor visual/técnico |
| Produção dos cantos | Luna com ferramenta de imagem | uma orientação por vez, com gabarito anexado |
| R2-B | GPT-5.6 Sol High | integração curta, validação estrita e preservação do pipeline |
| R3 | GPT-5.6 Sol High | maior risco técnico da rodada; compositor e hit testing |
| R4 | GPT-5.6 Sol High | transições de estado e regressões de interação |
| R5 | GPT-5.6 Sol High | CSS, viewport real, acessibilidade e E2E |
| R6 | GPT-5.6 Terra High se tudo estiver verde; Sol High se houver falhas | R6 deve ser majoritariamente mecânico |

O ganho de cota vem principalmente do escopo fechado e da sessão nova por gate, não de pedir ao mesmo agente que implemente tudo em uma única rodada.

---

# Prompt W3-A-R1 — Perímetro, porta lógica e identidade

```text
AUTORIZAÇÃO EXCLUSIVA

Execute somente W3-A-R1 da Biblioteca Viva. Esta mensagem não autoriza R2-A, produção ou troca de PNGs, compositor, UI, migração, schema, backup, blueprint ou grants.

PRÉ-CONDIÇÕES

1. O usuário aceitou nominalmente o relatório técnico de W3-A-R0.
2. Leia AGENTS.md, docs/W3_A_CORRECTION_LOG.md, docs/STATUS.md, docs/ROADMAP.md e os arquivos reais apontados pelo log para geometria e persistência.
3. Inspecione git status, commit-base e diff antes de editar. Preserve toda mudança preexistente de R0.
4. Não use subagentes. Não faça commit.

FATOS DE PARTIDA QUE DEVEM SER PRESERVADOS

- O blueprint v1 possui piso 12×10, 120 células, perímetro de 44 arestas e cobertura estrutural exata de 44 arestas.
- A planta canônica é logicamente fechada; o defeito visto é principalmente visual e de interface.
- Layouts editados podem ser abertos. O analisador não deve transformar fechamento global em requisito para salvar toda construção.
- blueprintVersion=1 não prova que uma construção continua canônica.

OBJETIVO

Criar somente regras puras e testes capazes de:

1. derivar o perímetro de um conjunto arbitrário de células de piso;
2. comparar esse perímetro com as arestas ocupadas pelos placements;
3. reportar, sem mutar o estado, arestas ausentes, extras e duplicadas, componentes e fechamento;
4. formalizar a semântica lógica da porta;
5. classificar com segurança um estado como canonical-v1, modified-v1 ou future/unknown.

CONTRATO DO ANALISADOR

- trabalhar com formas retangulares, côncavas, múltiplos componentes e buracos;
- ser determinístico e independente da ordem de células/placements;
- produzir chaves/ordenação normalizadas e resultados estáveis;
- separar diagnóstico de perímetro de validação de edição;
- não depender de Phaser, DOM, PNG, alpha bounds, offsets ou pivôs;
- provar em teste que o blueprint atual tem 120 células, 44 arestas esperadas e diferenças vazias.

SEMÂNTICA DA PORTA

- porta horizontal ocupa quatro arestas estruturais nos estados open e closed;
- closed não expõe aresta passável;
- open expõe somente as duas arestas centrais como passagem;
- estado visual não altera os planos estruturais externos;
- corrija passableEdges de forma pura e cubra a regra por testes, mesmo que ainda não exista consumidor runtime;
- não crie porta vertical.

IDENTIDADE NORMALIZADA

- implemente uma assinatura/representação canônica pura; não persista hash;
- ignore timestamps, revision e IDs de instância que não mudem a geometria;
- inclua floorCells e, para cada placement, definitionId, anchor, orientation e state relevantes;
- normalize ordem e serialização;
- canonical-v1 significa igualdade completa com a assinatura explícita do blueprint v1;
- qualquer divergência conhecida em versão 1 significa modified-v1;
- versão superior/desconhecida significa future/unknown e nunca deve ser sobrescrita automaticamente;
- não use apenas contagens, bounds ou blueprintVersion para classificar.

ESCOPO AUTORIZADO

- funções e tipos puros na camada já responsável por estruturas;
- correção lógica de passableEdges;
- testes unitários e adaptações mecânicas mínimas necessárias para tipos/build;
- documentação estritamente ligada a R1.

PROIBIDO

- alterar constantes do blueprint, inventário, grants ou milestones;
- migrar ou regravar WorldStructureState existente;
- alterar schema Dexie ou formatos de backup;
- tocar PNG, wallAssets, SpatialWorldScene, constructionInput, React ou CSS;
- mover regras entre camadas numa refatoração global;
- implementar R2-A.

VALIDAÇÃO

- execute os testes focados do analisador, porta e classificador;
- execute format:check, lint e typecheck conforme os scripts existentes;
- execute git diff --check;
- não rode E2E, Android ou APK, salvo necessidade inesperada e justificada.

REGISTRO E PARADA

Atualize somente R1 em docs/W3_A_CORRECTION_LOG.md e os índices documentais exigidos pelas regras do projeto. Preserve a história de R0. Marque R1 como tecnicamente concluído e aguardando aceite humano somente se todos os critérios passarem.

PARE OBRIGATORIAMENTE. Não inicie R2-A. Entregue o relatório obrigatório e aguarde autorização humana nominal.
```

## Aceite humano de R1

Confirmar que:

- o teste reproduz exatamente 120/44/0/0/0 para a planta canônica;
- uma construção modificada não é classificada como canônica;
- nenhuma construção persistida foi regravada;
- a porta aberta só torna passáveis as duas arestas centrais;
- nenhum arquivo visual foi tocado.

Autorização seguinte:

> Aceito W3-A-R1 e autorizo exclusivamente W3-A-R2-A.

---

# Prompt W3-A-R2-A — Contrato de arte e gabaritos

```text
AUTORIZAÇÃO EXCLUSIVA

Execute somente W3-A-R2-A. Esta mensagem autoriza medir, especificar, criar gabaritos e reforçar o validador de assets. Não autoriza substituir nenhum PNG ativo, alterar o compositor, corrigir a porta runtime, alterar dados ou iniciar R2-B.

PRÉ-CONDIÇÕES

1. W3-A-R1 foi aceita nominalmente pelo usuário.
2. Leia AGENTS.md, docs/W3_A_CORRECTION_LOG.md, ART_DIRECTION, ASSET_SPEC, ASSET_REGISTRY e o script real de processamento/validação de paredes.
3. Localize pelo catálogo real as cópias source-of-truth e runtime dos 12 PNGs.
4. Inspecione status/diff e preserve mudanças preexistentes.
5. Não use subagentes. Não faça commit.

OBJETIVO

Produzir um contrato geométrico executável para que quatro novos cantos encaixem exatamente nas seis paredes retas existentes. Os seis segmentos retos são as matrizes obrigatórias de escala, espessura, perspectiva, iluminação e planos de junção.

ESCOPO AUTORIZADO

1. Corrigir o check para medir o alpha bounding box no canvas original, antes de trim.
2. Relatar por asset: canvas, bbox com offset, padding, eixo longitudinal, span lógico, planos externos de junção e tolerância.
3. Definir um sistema de coordenadas inequívoco para os quatro cantos ne/nw/se/sw.
4. Criar gabaritos determinísticos para cada orientação, preferencialmente com:
   - canvas e transparência finais;
   - caixas e eixos de referência;
   - área permitida para alpha;
   - planos de encontro dos dois braços;
   - vértice lógico e origem visual;
   - áreas proibidas e margens;
   - legenda fora da imagem de produção ou em arquivo auxiliar.
5. Produzir uma montagem diagnóstica que combine cada gabarito com os segmentos retos correspondentes, sem substituir assets ativos.
6. Documentar formatos, perfil de cor, alpha, nomes, pastas de candidatos e procedimento de inspeção.

REGRAS DO CONTRATO

- cada braço representa exatamente quatro células e alcança o mesmo plano usado pela reta longa de 1200 px;
- as retas de 1, 2 e 4 células devem compartilhar o mesmo perfil transversal e planos compatíveis;
- o gabarito não pode depender de esticar a arte no runtime;
- padding, crop, origin e join planes devem ser explícitos, não inferidos visualmente;
- a tolerância geométrica deve ser definida em pixels e não pode esconder lacunas perceptíveis;
- a porta open/closed deve ser medida, mas não redesenhada nem integrada neste gate;
- não alterar CELL_SIZE, câmera ou piso para compensar PNG defeituoso.
- se a validação estrita for um novo gate de produção, mantenha-a em modo de relatório para os cantos legados durante R2-A e torne o sucesso obrigatório somente em R2-B; não deixe a matriz comum permanentemente vermelha durante a transição.

ARTEFATOS DE SAÍDA

- quatro gabaritos orientados;
- uma especificação legível por humano e máquina sempre que o projeto já suportar esse padrão;
- relatório do validador com bbox original correto;
- montagens de inspeção fora dos caminhos ativos;
- instruções exatas para a produção artística e para R2-B.

PROIBIDO

- sobrescrever qualquer wall-corner-*.png de art-source ou runtime;
- gerar a arte final;
- alterar WALL_ASSETS, structureRenderPlan, SpatialWorldScene ou constructionInput;
- alterar blueprint, schema, backup, inventário, UI ou CSS;
- aceitar o canto antigo como correto apenas porque o check legado passa;
- iniciar R2-B.

VALIDAÇÃO

- execute o check de assets atualizado contra os 12 PNGs e registre os quatro cantos antigos como não conformes ao novo contrato, sem quebrar silenciosamente tarefas não relacionadas;
- teste o parser/medidor com bbox deslocado para provar que o offset original não é perdido;
- valide formatos, links e montagens;
- execute testes focados, format:check, lint/typecheck se os arquivos afetados exigirem e git diff --check.

REGISTRO E PARADA

Atualize R2-A em docs/W3_A_CORRECTION_LOG.md. Informe os caminhos exatos dos gabaritos e da pasta onde os candidatos humanos deverão ser colocados. Marque os assets antigos como ativos e os novos como ainda inexistentes.

PARE OBRIGATORIAMENTE. Não substitua PNGs, não altere o runtime e não inicie R2-B.
```

## Aceite humano de R2-A

O usuário deve abrir os quatro gabaritos e as montagens e confirmar que:

- as quatro orientações estão nomeadas e espelhadas corretamente;
- cada braço chega ao plano da reta correspondente;
- não há instrução contraditória de crop, padding ou transparência;
- os assets antigos continuam ativos e recuperáveis.

Autorização da etapa artística:

> Aceito W3-A-R2-A e autorizo exclusivamente a produção de quatro cantos candidatos, sem integração ao projeto.

---

# Prompt de produção artística — Quatro cantos candidatos

Este prompt é para Luna/ferramenta de imagem, não para o Codex integrar arquivos. Deve ser executado **uma orientação por vez**, anexando o gabarito daquela orientação e as duas paredes retas de referência.

```text
Crie somente um candidato para o canto estrutural [NE/NW/SE/SW] da Biblioteca Viva.

REFERÊNCIAS OBRIGATÓRIAS ANEXADAS

1. gabarito técnico [caminho/nome produzido em W3-A-R2-A];
2. parede reta horizontal longa vigente;
3. parede reta vertical longa vigente;
4. canto antigo apenas como referência de linguagem visual, nunca como referência geométrica.

CONTRATO INEGOCIÁVEL

- PNG sRGBA com fundo totalmente transparente;
- canvas, alpha bounds máximos, padding, vértice, eixos e planos de junção exatamente como definidos no gabarito;
- dois braços com extensão integral de quatro células;
- mesma escala, perspectiva top-down, espessura, altura aparente, argamassa, luz, contraste e densidade das paredes retas anexadas;
- encontro interno e externo contínuo, sem vão, degrau, parede dupla ou pedra flutuante;
- nenhum elemento além das paredes dentro das áreas proibidas do gabarito;
- não adicionar piso, grama, sombra de cenário, porta, móvel, texto, marca ou fundo opaco;
- não cortar a extremidade de nenhum braço;
- não alterar o tamanho do canvas para acomodar a arte.

LIBERDADE ARTÍSTICA LIMITADA

É permitido variar discretamente o desenho das pedras e da argamassa dentro da mesma direção de arte. Não é permitido reinterpretar geometria, escala, orientação, iluminação ou encaixes.

SAÍDA

- um único PNG candidato na resolução original;
- identificação clara da orientação;
- sem integração, renomeação dos assets ativos ou edição dos demais arquivos.

Se não for possível cumprir simultaneamente o gabarito e as referências, não improvise: explique o conflito e pare.
```

Após gerar as quatro orientações, o usuário deve inspecioná-las individualmente e nas montagens de R2-A. Candidatos reprovados voltam apenas à produção artística; não seguem para integração.

Autorização seguinte, somente após aprovação dos quatro:

> Aprovo visualmente os quatro cantos candidatos e autorizo exclusivamente W3-A-R2-B para validá-los e integrá-los.

---

# Prompt W3-A-R2-B — Validação e integração dos quatro cantos

```text
AUTORIZAÇÃO EXCLUSIVA

Execute somente W3-A-R2-B. Integre apenas os quatro cantos já aprovados pelo usuário. Não altere compositor, porta, dados, estado React, CSS ou responsividade. Não inicie R3.

PRÉ-CONDIÇÕES

1. O usuário aceitou R2-A e aprovou nominalmente os quatro candidatos.
2. Os quatro PNGs candidatos estão disponíveis nos caminhos informados pelo usuário e não substituíram arquivos ativos.
3. Leia AGENTS.md, docs/W3_A_CORRECTION_LOG.md, contrato/gabaritos de R2-A, ART_DIRECTION, ASSET_SPEC e ASSET_REGISTRY.
4. Registre hash, dimensões e caminhos dos candidatos e dos assets ativos antes de alterar.
5. Inspecione status/diff e preserve mudanças preexistentes.
6. Não use subagentes. Não faça commit.

OBJETIVO

Validar estritamente e integrar os quatro cantos ne/nw/se/sw aprovados, preservando IDs, nomes e pipeline determinístico.

ORDEM OBRIGATÓRIA

1. Rode o validador de R2-A contra cada candidato ainda fora do runtime.
2. Gere as montagens canto+retas e a planta canônica diagnóstica.
3. Se qualquer candidato falhar canvas, bbox, alpha, orientação, planos ou seam, não o corrija automaticamente: rejeite-o, registre a falha e pare sem substituir os ativos.
4. Se os quatro passarem, atualize primeiro a fonte de verdade artística conforme o pipeline existente.
5. Gere ou copie as versões runtime apenas pelo processo determinístico oficial.
6. Confirme que source e runtime correspondem exatamente ao pipeline e que não restaram candidatos em pastas carregadas pela aplicação.
7. Atualize hashes, registro de assets, especificação e log.

RESTRIÇÕES

- substituir somente os quatro wall-corner existentes;
- manter os seis segmentos retos e as duas portas inalterados byte a byte;
- manter IDs, orientações e spans lógicos;
- não esticar, cortar, deslocar, adicionar padding ou repintar candidato para fazê-lo passar;
- não criar arquivos old/backup/final2 no repositório;
- não alterar wallAssets, SpatialWorldScene, structureRenderPlan ou constructionInput;
- não alterar schema, backup, blueprint, grants, UI ou CSS;
- se o pipeline tentar regenerar arte diferente da aprovada, pare e relate.

VALIDAÇÃO

- hashes antes/depois dos 12 assets;
- wall-assets:check completo;
- testes focados do processador e registro de assets;
- montagens dos quatro cantos com as retas;
- planta canônica diagnóstica fora do runtime;
- format:check/lint/typecheck apenas conforme os arquivos alterados;
- git diff --check.

REGISTRO E PARADA

Atualize R2-B em docs/W3_A_CORRECTION_LOG.md, incluindo tabela de hashes, validações, caminhos e evidência de que apenas quatro assets mudaram. Não declare a planta corrigida no runtime; isso depende de R3 e de inspeção humana.

PARE OBRIGATORIAMENTE. Não ajuste metadados, compositor, offsets, hit areas ou UI. Não inicie R3.
```

## Aceite humano de R2-B

Confirmar nas montagens que:

- os quatro braços encontram as retas sem vãos;
- a orientação de cada canto está correta;
- a espessura e a perspectiva são contínuas;
- nenhuma porta ou reta foi alterada;
- somente os quatro cantos aprovados entraram no projeto.

Autorização seguinte:

> Aceito W3-A-R2-B e autorizo exclusivamente W3-A-R3.

---

# Prompt W3-A-R3 — Compositor real, porta e hit testing

```text
AUTORIZAÇÃO EXCLUSIVA

Execute somente W3-A-R3. Corrija o pipeline visual realmente usado e seu hit testing. Não altere arte, dados persistidos, blueprint, máquina de estados React, layout responsivo ou CSS. Não inicie R4.

PRÉ-CONDIÇÕES

1. W3-A-R2-B foi aceita nominalmente.
2. Leia AGENTS.md, docs/W3_A_CORRECTION_LOG.md e os testes relevantes.
3. Confirme no código atual o caminho WorldStructureState → structureRenderPlan → WALL_ASSETS → SpatialWorldScene.renderWallPiece e o caminho de constructionInput.
4. Não trate wallComposition.ts como runtime sem provar por imports/chamadas que isso mudou.
5. Inspecione status/diff e preserve mudanças preexistentes.
6. Não use subagentes. Não faça commit.

OBJETIVO

Fazer a geometria lógica e os PNGs aprovados produzirem uma construção visualmente contínua, com a porta no intervalo correto e áreas de toque coerentes com o que aparece.

ESCOPO AUTORIZADO

1. Estabelecer uma única autoridade de metadados visuais consumida por render e hit testing.
2. Manter no catálogo lógico apenas span, orientação, ocupação e estado; evitar dependência de pixels na camada pura.
3. Formalizar a transformação:
   âncora lógica → origem de junção → inset do source → posição/origin do sprite.
4. Alinhar a porta às quatro arestas lógicas x=7..10, y=14, removendo a compensação acidental de uma célula exatamente uma vez.
5. Garantir os mesmos planos externos para porta open/closed.
6. Corrigir origin/pivot, depth e fallback somente quando comprovadamente necessários pelo contrato.
7. Fazer hit areas derivarem da mesma autoridade, cobrindo a estrutura tocável sem usar o retângulo transparente inteiro de um canto 4×4.
8. Criar harness/testes de composição visual do pipeline real.

CASOS MÍNIMOS DO HARNESS

- todos os encontros reta+reta compatíveis;
- quatro orientações de canto com retas em ambos os braços;
- porta open e closed entre segmentos/cantos;
- retângulos completos em tamanhos diferentes;
- planta canônica 12×10;
- zoom normal e fracionário usado pela aplicação;
- ausência de gap lógico, sobreposição indevida e deslocamento de uma célula;
- igualdade entre posição visual e hit area;
- ordem de depth coerente para arquitetura traseira/frontal e móveis.

CRITÉRIOS

- a correção da porta não pode existir simultaneamente no anchor e em um offset compensatório;
- filtros/subpixel não podem criar seam visível em escala suportada;
- fallback deve usar os mesmos join planes;
- testes devem falhar se sprite e hit area voltarem a divergir;
- não mascarar lacunas aumentando sprites indiscriminadamente.

PROIBIDO

- alterar qualquer PNG;
- mudar floorCells, placements, blueprintVersion, schema, backup, grants ou inventário;
- implementar a solução apenas em wallComposition.ts se ele continuar fora do runtime;
- alterar ConstructionControls, reducer de página ou CSS;
- iniciar R4.

VALIDAÇÃO

- testes unitários de metadados, transformação, porta e hit area;
- harness completo e artefatos visuais de inspeção;
- testes Phaser relevantes;
- format:check, lint, typecheck, build e wall-assets:check;
- git diff --check.

REGISTRO E PARADA

Atualize R3 no log, incluindo imagens/harness gerados, coordenadas antes/depois da porta e prova de autoridade única. Registre qualquer validação visual ainda dependente do usuário.

PARE OBRIGATORIAMENTE. Não altere o fluxo de interação ou layout e não inicie R4.
```

## Aceite humano de R3

Inspecionar a planta composta e confirmar:

- perímetro contínuo nos quatro cantos;
- porta centrada e conectada aos dois lados;
- nenhuma peça deslocada, dupla ou solta;
- toque/seleção corresponde à peça visível;
- móveis continuam na profundidade correta.

Autorização seguinte:

> Aceito W3-A-R3 e autorizo exclusivamente W3-A-R4.

---

# Prompt W3-A-R4 — Máquina de estados e manipulação no mapa

```text
AUTORIZAÇÃO EXCLUSIVA

Execute somente W3-A-R4. Corrija comportamento e transições do editor sem fazer o acabamento responsivo final, alterar assets, compositor, dados persistidos, schema ou backup. Não inicie R5.

PRÉ-CONDIÇÕES

1. W3-A-R3 foi aceita nominalmente.
2. Leia AGENTS.md, docs/W3_A_CORRECTION_LOG.md, UX_FLOWS, ACCESSIBILITY e os componentes/hooks reais do editor.
3. Mapeie novamente os estados atuais antes de substituir lógica.
4. Inspecione status/diff e preserve mudanças preexistentes.
5. Não use subagentes. Não faça commit.

OBJETIVO

Transformar o mapa na superfície principal de edição. Selecionar, mover, girar, guardar, colocar e cancelar devem ocorrer em estados exclusivos, previsíveis e reversíveis, sem lista e cartão empilhados.

CONTRATO DE ESTADOS

Modele um reducer/máquina discriminada equivalente a, no mínimo:

- explore;
- build-idle;
- palette-open;
- placed-list-open;
- piece-selected;
- placing;
- moving;
- floor-editing;
- confirm-store.

Não é obrigatório usar esses nomes, mas combinações inválidas devem ser irrepresentáveis ou rejeitadas centralmente.

TRANSIÇÕES OBRIGATÓRIAS

- entrar em construção começa em build-idle com mapa livre;
- tocar uma peça visível seleciona essa peça diretamente no mapa;
- abrir palette/lista é ação explícita e reversível;
- iniciar moving ou placing fecha lista/palette e substitui o cartão de seleção por controles compactos do estado ativo;
- mover mostra preview/snap, confirmar e cancelar sem perder a posição anterior em cancelamento/falha;
- girar mantém seleção e apresenta resultado/erro compreensível;
- guardar exige confirmação e retorna ao estado anterior correto se cancelado;
- trocar para piso encerra seleção estrutural incompatível;
- fechar construção limpa subestados transitórios sem persistir operação incompleta;
- nenhum toast, sheet convencional ou resumo deve bloquear a interação ativa sem regra explícita.

BACK E ESCAPE

Centralize a mesma ordem semântica para Escape e Android Back:

1. fechar confirmação;
2. cancelar moving/placing/floor transitório;
3. fechar palette/lista;
4. limpar seleção;
5. sair do modo construção;
6. somente então aplicar a navegação/saída normal da rota.

No Android, Back em `/` não pode encerrar o app enquanto existir subestado de construção fechável.

ACESSIBILIDADE FUNCIONAL

- preserve uma alternativa textual para localizar peças colocadas, mas somente sob demanda;
- mantenha nomes, estado, orientação e ações acessíveis;
- foco deve acompanhar abertura/fechamento e retornar ao acionador apropriado;
- mapa direto e alternativa textual devem acionar as mesmas transições.

PROIBIDO

- fazer redesign CSS completo ou otimização final de breakpoints;
- alterar PNGs, metadados visuais ou compositor;
- alterar schema, backup, grants ou blueprint;
- deixar seleção e moving simultaneamente renderizando controles independentes;
- iniciar R5.

TESTES

- tabela/reducer de transições válidas e inválidas;
- seleção direta no mapa;
- lista fecha ao iniciar movimento;
- cancelar mover preserva estado persistido;
- confirmação de guardar;
- foco e alternativa textual;
- Escape e Android Back em todos os subestados;
- regressões de concorrência/single-flight existentes;
- format:check, lint, typecheck, testes React focados e git diff --check.

REGISTRO E PARADA

Atualize R4 no log e inclua a tabela final de estados/transições. Se uma transição exigir mudança de persistência não prevista, pare antes de implementá-la.

PARE OBRIGATORIAMENTE. Não faça o acabamento responsivo e não inicie R5.
```

## Aceite humano de R4

Verificar em navegador, sem exigir ainda aparência final:

- é possível tocar uma parede e movê-la sem abrir a lista completa;
- lista e cartão de movimento nunca aparecem empilhados;
- cancelar não desloca nem perde a peça;
- Back/Escape fecha um nível por vez;
- a alternativa textual continua disponível sob demanda.

Autorização seguinte:

> Aceito W3-A-R4 e autorizo exclusivamente W3-A-R5.

---

# Prompt W3-A-R5 — UI mobile, aparência e acessibilidade

```text
AUTORIZAÇÃO EXCLUSIVA

Execute somente W3-A-R5. Faça o acabamento responsivo e acessível do editor já funcional. Não altere assets, compositor, domínio estrutural, schema, backup, blueprint ou progressão. Não inicie R6.

PRÉ-CONDIÇÕES

1. W3-A-R4 foi aceita nominalmente.
2. Leia AGENTS.md, docs/W3_A_CORRECTION_LOG.md, UX_FLOWS, ART_DIRECTION, ACCESSIBILITY, PERFORMANCE e testes E2E atuais.
3. Instale o Chromium Playwright somente se estiver ausente e se isso for permitido pelo ambiente; registre a instalação, sem confundi-la com mudança de produto.
4. Inspecione status/diff e preserve mudanças preexistentes.
5. Não use subagentes. Não faça commit.

OBJETIVO

Entregar uma interface compacta e legível em que o mapa permaneça manipulável. A lista extensa existe somente quando o usuário a pede; controles do estado ativo ficam próximos da borda, não sobre a construção.

LAYOUT OBRIGATÓRIO

- estado build-idle usa barra/controles compactos, sem painel alto permanente;
- palette e lista abrem como sheet deliberado, recolhível e com scroll próprio claramente delimitado;
- ao selecionar/mover/posicionar, o sheet extenso está fechado;
- controles ativos formam uma barra/cartão compacto e não empurram ações abaixo da viewport;
- containers transparentes não interceptam o canvas; somente superfícies visíveis recebem pointer events;
- safe areas top/right/bottom/left são respeitadas;
- header, explorador de sala, toast, resumo e construção obedecem regras de exclusão/empilhamento;
- mapa não ganha scroll documental acidental;
- orientação landscape recebe solução explícita.

CRITÉRIOS MENSURÁVEIS

Teste pelo menos:

- 320×640;
- 360×800;
- 412×915;
- 640×320 landscape;
- texto/zoom de interface a 200% quando aplicável.

Em todas as viewports:

- nenhuma ação primária fica fora da área útil;
- controles respeitam safe areas;
- existe área útil do mapa tocável fora dos controles;
- o sheet extenso nunca permanece aberto durante moving/placing;
- o estado compacto não se aproxima da antiga ocupação de ~81% da viewport;
- alvos de toque e foco atendem o contrato de acessibilidade do projeto;
- conteúdo longo tem scroll visível e não arrasta o mapa por engano;
- contraste, foco, rótulos e ordem de leitura são verificáveis.

E2E OBRIGATÓRIO

- entrar em construção nas quatro viewports;
- abrir e fechar palette/lista;
- selecionar diretamente no mapa;
- mover, cancelar e confirmar;
- girar e guardar com confirmação;
- editar piso conforme o fluxo vigente;
- medir bounding boxes e overflow;
- provar que um ponto útil do canvas fora de controles recebe interação;
- provar que o container transparente não captura esse ponto;
- testar Escape; Android Back fica coberto por teste de unidade/integração e validação física posterior;
- gerar screenshots estáveis dos estados principais para inspeção humana.

ACESSIBILIDADE

- manter alternativa textual sob demanda, não removê-la;
- foco preso somente em modal/confirm real e restaurado ao fechar;
- anúncios não repetem toda a lista a cada ação;
- reduced motion e alto contraste continuam funcionais;
- não alegar TalkBack físico sem teste humano.

PROIBIDO

- alterar PNG, compositor, offsets, geometria ou persistência;
- criar uma segunda máquina de estados em CSS/componentes;
- ocultar controles essenciais sem alternativa acessível;
- aprovar por screenshot desktop apenas;
- iniciar R6.

VALIDAÇÃO

- testes React/CSS focados;
- Playwright mobile e desktop relevantes;
- screenshots nas viewports definidas;
- format, format:check, lint, typecheck e build;
- performance:report se a UI afetar o orçamento monitorado;
- git diff --check.

REGISTRO E PARADA

Atualize R5 no log com medidas antes/depois, screenshots, testes e lacunas de hardware. Marque validação Moto G06 e TalkBack como pendentes.

PARE OBRIGATORIAMENTE. Não rode integração/release como R6 e não inicie R6.
```

## Aceite humano de R5

O usuário deve revisar as screenshots e o fluxo no navegador. Confirmar:

- o mapa domina a tela em estado normal e durante manipulação;
- controles extensos aparecem somente quando solicitados;
- não há botão cortado, painel preso ou rolagem confusa;
- aparência, hierarquia e linguagem combinam com a Biblioteca Viva;
- o fluxo pode seguir para regressão completa.

Autorização seguinte:

> Aceito W3-A-R5 e autorizo exclusivamente W3-A-R6.

---

# Prompt W3-A-R6 — Regressão, documentação e APK debug

```text
AUTORIZAÇÃO EXCLUSIVA

Execute somente W3-A-R6. Integre e valide o que já foi aprovado em R1–R5. Não crie funcionalidade, refaça arte, altere schema/backup ou amplie o escopo. Não faça commit ou release.

PRÉ-CONDIÇÕES

1. W3-A-R1, R2-A, R2-B, R3, R4 e R5 foram aceitas nominalmente.
2. Leia AGENTS.md, docs/W3_A_CORRECTION_LOG.md, STATUS, ROADMAP, TEST_PLAN e a documentação afetada.
3. Inspecione status/diff e preserve mudanças preexistentes.
4. Não use subagentes. Não faça commit.

OBJETIVO

Executar a regressão integrada, corrigir apenas falhas diretamente causadas pela rodada dentro do subsistema responsável, atualizar a documentação verdadeira e produzir APK debug para validação humana.

MATRIZ

Execute, conforme AGENTS.md e scripts reais:

- format e format:check;
- lint;
- typecheck;
- test:run;
- wall-assets:check e checks de áudio/assets existentes;
- build;
- performance:report;
- E2E desktop e mobile;
- android:sync;
- android:build:debug;
- git diff --check;
- git status --short.

REGRESSÕES OBRIGATÓRIAS

- boundary e classificação canonical/modified/unknown;
- backup v5/v4 e schema v7 sem migração nova;
- reload e preservação de construção modificada;
- inventário, grants, milestone e single-flight;
- planta canônica e composições visuais;
- porta open/closed;
- seleção, mover, girar, guardar, colocar e piso;
- Escape e Android Back por subestado;
- viewport 320×640, demais viewports e screenshots;
- busca, detalhes, leitura, áudio e fluxos não relacionados afetados pela rota.

TRATAMENTO DE FALHAS

- corrija somente regressão claramente causada por R1–R5 e dentro do escopo já autorizado;
- se a falha exigir schema, migração, novo asset, refatoração ampla ou decisão de produto, pare e peça um gate adicional;
- não reduza cobertura, não afrouxe tolerância e não marque teste como skip para obter verde;
- não alegue validação física por causa de emulador, Chromium ou build APK.

DOCUMENTAÇÃO

Atualize W3_A_CORRECTION_LOG, STATUS, ROADMAP, TEST_PLAN, CHANGELOG e documentos realmente afetados. Preserve o histórico: P3-C foi tecnicamente concluído, a validação física reabriu W3-A e a rodada corretiva ainda depende do gate humano no Moto G06.

ENTREGA

- relatório pelo template de gate do projeto;
- caminho e hash do APK debug;
- matriz completa com passou/falhou/não executado;
- lista de mudanças preexistentes preservadas;
- roteiro físico final;
- nenhuma alegação de aceite humano.

PARE OBRIGATORIAMENTE. Não faça commit, push, tag, release ou aprovação automática. Aguarde a validação humana no Moto G06.
```

## 7. Gate físico final — Moto G06

O aceite final só ocorre após execução humana registrada no aparelho.

### Construção e continuidade

- planta inicial parece uma sala contínua em todos os quatro cantos;
- porta está centrada e encostada corretamente nos dois lados;
- não há vão, degrau, sobreposição dupla ou peça flutuante;
- zoom e pan não revelam seams novos;
- móveis e paredes mantêm profundidade coerente.

### Manipulação

- entrar em Construção não cobre o mapa;
- tocar uma estrutura no mapa seleciona a peça esperada;
- mover, cancelar, confirmar, girar e guardar são compreensíveis;
- lista extensa fecha ao iniciar manipulação;
- nenhum seletor permanece bloqueando o alvo;
- piso e estruturas não deixam estados antigos empilhados.

### Mobile e acessibilidade

- nenhuma ação fica sob barra do sistema ou recorte;
- Back fecha um nível por vez e não encerra o app prematuramente;
- TalkBack encontra os controles na ordem correta;
- alternativa “Peças colocadas” abre sob demanda e é utilizável;
- texto maior, contraste e foco continuam legíveis;
- desempenho percebido e toque são aceitáveis no dispositivo.

Resultados possíveis:

- **aceito**: W3-A corretiva pode ser encerrada e receber checkpoint autorizado;
- **aceito com pendência não bloqueante**: registrar nova atividade independente;
- **reprovado**: registrar screenshot/vídeo, estado exato e primeiro passo de reprodução; não remendar em R6 sem um novo gate autorizado.

## 8. Próxima autorização imediata

O pedido de criação deste documento **não autoriza implementação**. Como R0 continua documentado como pendente de aceite humano, a próxima mensagem operacional deve ser:

> Aceito o relatório técnico de W3-A-R0 e autorizo exclusivamente W3-A-R1 conforme o plano pós-auditoria. Não use subagentes, não faça commit e pare ao concluir R1.
