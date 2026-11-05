# BF-5.5E — Modelos e identidade da mobília

**05/11/2026 — candidata artística e funcional, sem aceite humano ou integração.** Branch `feat/bf-5-5e-furniture-identity`, derivada de `feat/bf-5-5d-living-scrolls` em `ab19f1a57f4e62fedbd866e543da1a9c9ab84a82`. BF-5.5F/G não iniciadas. Autoridades: [plano](BF-5_5_O_DESPERTAR_DA_BIBLIOTECA.md), [ADR-023](decisions/ADR-023-bf-5-5-despertar-da-biblioteca.md), [ADR-010](decisions/ADR-010-3d-pipeline-v1.md), [arte](ART_DIRECTION.md).

## Preparação e auditoria localizada

Checkout limpo; `git fetch --prune origin` executado antes de criar a branch. PRs predecessoras consultadas e preservadas abertas/draft:

| PR | HEAD observado | Base |
| --- | --- | --- |
| [#32](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/32) | `8d26409a9d7d205b4d92ee2410e6561be19c0ed2` | main |
| [#33](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/33) | `082510f0eb85d9e24ec3d9b7e79bf2e03488ed2c` | A |
| [#34](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/34) | `8cc12c214f539089cb47566415a66376fa3305d9` | B |
| [#35](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/35) | `ab19f1a57f4e62fedbd866e543da1a9c9ab84a82` | C |

Consultados relatórios A/B/C/D, layout, fábricas do prédio/mobília/estantes/livros, materiais, objetos vivos, iluminação, obstáculos, rotas aéreas, navegação e montagem/picking do runtime. Os contratos reais distribuem inicialmente estudo em C, treino em D e trabalho em E, sem exclusividade por cômodo.

Diagnóstico: repetição de caixas/cilindros; quatro cadeiras idênticas por mesa; bancada/treino sem identidade própria; materiais difusos planos; posições de luminárias repetidas; destino visual de B sem tampo correspondente; capa fixa duplicando parte do livro carregado; apoios D definidos sob o relógio B e o braseiro E. A inspeção visual também encontrou repetição cromática dos livros com IDs sequenciais e veios excessivos na primeira candidata E.

Plano executado: preservar as 18 ilhas/IDs e corredores; modelar famílias coerentes; compartilhar medidas de tampos/luminárias/apoios; integrar B/C/D; medir geometria real e testar seleção/navegação/descarte; inspecionar WebGL e entregar draft. Sem auditoria geral de UI, dados ou sessões.

## Transformação artística

- **Estantes:** colunas torneadas, capitais, caneluras, frisos nas prateleiras e coroas curvas de três proporções. Madeira texturizada e latão envelhecido. Alturas totais agora **3,37 / 3,72 / 3,06 m**; profundidades **0,705 / 0,685 / 0,745 m**. Larguras e os 70 slots internos permanecem. Entalhe narrativo preservado.
- **Livros reais:** capas laterais, bloco de páginas, lombada arredondada, nervuras e etiqueta abstrata. Quatro paletas e alturas de **0,30–0,40 m**, dentro do envelope máximo existente. Hash determinístico com mistura dos bits evita colapsar IDs consecutivos na mesma cor. Não há texto pessoal em materiais; `entryId`, `instanceId`, ordem, quantidade, overflow, wrapper e seleção continuam canônicos.
- **Estudo:** tampo arredondado de madeira, área de couro, gavetas, ferragens, pernas torneadas, instrumentos de escrita, livros cenográficos e régua. C passa a ter duas cadeiras à frente e uma faixa livre atrás para o transporte B. A conserva o pergaminho narrativo. D conserva globo e fólio de treino, este afastado da haste da luminária.
- **Trabalho/E:** o armário `bf4-prop:16` torna-se bancada robusta com portas emolduradas, gaveta móvel, couro, madeira em preparação, malho, grampos e morsa. O mecanismo/segredo BF-4E continua no mesmo objeto.
- **Treino/D:** `bf4-prop:14` recebe banco de couro, montantes, berços de latão, barra de ferro e pesos de pedra; mantém o footprint do banco anterior. Nenhum exercício, evento de sessão ou progressão foi implementado.
- **Convivência:** poltronas com encostos arqueados, braços, almofadas, botões e manta; cadeiras de leitura e banco de C com proporções próprias; mesas de pedestal e tapetes bordados. Verdes profundos e bordô conservam unidade entre os ambientes.
- **Armários/plantas:** portas e painéis recuados, dobradiças, puxadores, volumes cenográficos variados, vasos de perfil torneado, colares de latão, folhas e botões florais. Conteúdo cenográfico não ocupa slots pessoais.
- **Luminárias:** plintos de pedra, hastes torneadas, elementos patinados, cúpulas abertas com aros/nervuras e emissão no próprio material. As de chão ganham altura legível; nove fontes automáticas e a luminária manual continuam distintas.

## Modelagem, recursos e proveniência

Procedural Three.js original: sólidos com bordas arredondadas, perfis de revolução, painéis/coroas por extrusão e instancing por geometria/material para detalhes estáticos. A textura de veio é um `DataTexture` determinístico de 64×64, gerado pelo código local. Sem asset externo, GLB novo, fixture promovida, download, licença adicional ou dependência nova. O próprio TypeScript é a fonte editável.

Mobília usa Phong para resposta especular de madeira/metal e tecidos foscos; estantes/livros mantêm Standard. A fábrica de materiais arquitetônicos permanece com seu contrato Lambert. Recursos pertencem à root que os cria; geometrias, materiais e textura são compartilhados somente dentro dela e descartados uma vez por `disposeObjectTree`. Cúpulas têm materiais próprios para emissão independente. Peças móveis ficam fora dos batches. Não há RAF, timer ou alocação geométrica nova por frame.

## Contratos físicos e integração

`libraryFurnishingLayout.ts` concentra `FURNITURE_DIMENSIONS`, transformação local→mundo (incluindo rotação), `furnitureLamp`, `furnitureScrollSupports`, `SCENIC_BOOK_ANCHORS` e a posição do fólio cenográfico. São contratos de apresentação efêmeros, sem schema ou persistência espacial.

- **B:** origem e repouso intermediário pertencem ao tampo real de C. Aproximações laterais e dois desvios na faixa posterior são validados contra geometria. A navegação mantém precedência dos pontos sociais anteriores. Não conseguir rota cancela a tentativa e libera a reserva, em vez de representar colocação fictícia. Base, página e capa acompanham o mesmo `living:book`; a seleção e retorno conservam identidade. Objetos carregados não viram obstáculos permanentes na pose de captura. O limite anatômico dos rigs permanece.
- **C:** fábrica, luzes, ritual e luminária BF-4E consomem a mesma âncora. Centros das cúpulas de mesa/armário permanecem a 1,63/1,82 m; luminárias de chão passam a 1,45 m. O brilho ocupa a cúpula e seu núcleo interior. A cúpula manual integra o grupo selecionável. Fallback noturno, checkpoint, precedência manual e dia/noite não foram reescritos.
- **D:** apoios de mesas, bancos, armários e mesas de estar derivam das medidas físicas. Relógio B e braseiro E deixam de oferecer pousos incompatíveis. O pergaminho narrativo A é estreitado para liberar o repouso lateral sem tocar na sua identidade/ação. Testes cobrem o volume do papel, cantos apoiados e corredor de voo contra a cena. Trajetos continuam dentro do mesmo cômodo; se não há caminho seguro, não decolam.
- **Volumes:** bounds por instância continuam alimentando colisão; gaveta mantém seu envelope autorizado de abertura, sem congelar o objeto móvel em uma AABB de transporte. As ilhas não avançam sobre paredes, reservas de circulação ou slots. Os quatro habitantes conservam caminhos entre os cinco cômodos. Ytha continua usando seu envelope maior; não se reduz raio para forçar interação.
- **Registros/câmera:** seis tipos, 70 livros, 13 representações dos demais tipos, correspondência React/Canvas, realce, pan/pinch/zoom e fallback conservados. Sem conta, backend, dados pessoais, versões ou eventos de sessões F.

## Validação e resultados

Resultados consolidados abaixo após os comandos terminarem; não inferir CI verde a partir de testes locais.

- Primeira rodada dirigida: 49 PASS / 7 FAIL; expectativas de dimensões/contagem antigas, classificação de cúpulas no harness espacial e transporte sem corredor. Corrigidos mantendo os asserts de circulação e todos os estados de B.
- Inspeção adicional: novos nós de navegação afetavam a ordem de candidatos sociais; limitados aos dois desvios de C e acrescentados depois dos existentes. Regressão de encontros passou sem aumentar tempo simulado, timeout ou trocar seed.
- Rodada dirigida de geometria/agência/livros/voo: **45 PASS**.
- Rodada ampla: **854 PASS / 2 FAIL, 132 arquivos**. As duas falhas eram expectativas do runtime: contagem de meshes 75→135 e altura do highlight 3,10→3,37. Atualizadas explicitamente, preservando os asserts de seleção e descarte.
- O teste novo com o volume real do pergaminho encontrou o relógio B sobre um antigo ponto de repouso; o apoio incompatível foi retirado, sem remover a verificação.
- **Verificação final dirigida, gates estáticos e E2E:** resultado a consolidar antes do commit.

A CI da base D [42120874450](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42120874450) terminou com estáticos/unitários/build/áudio/performance **PASS**; E2E shard 1 **16 PASS / 17 FAIL**, shard 2 **17 PASS / 15 FAIL**. Inclui falhas pré-existentes de ambiente/coleção cheia, habitantes, luminária/segredo, picking/gestos/rotação, seletores de UI e backup. São bloqueantes da declaração de CI global verde, não prova de causa única ou falha do runner. Issues #21–#24 permanecem. CI da nova PR deve ser consultada no HEAD remoto.

## Pendências e limites

Avaliação artística, ergonomia, fluidez, temperatura, contato anatômico, TalkBack e APK no Moto G06 permanecem para **G**, sem execução ou aprovação nesta etapa. As capturas WebGL locais não substituem aparelho real. Não foi alterado rig, profundidade do modelo de navegação aérea, persistência de frames, backup ou esquema Dexie v14/backup v6. Não se declara resolução das dívidas globais.

O treino é cenográfico; a bancada tem identidade visual e conserva a gaveta narrativa, mas não executa sessões reais. As três estantes pessoais permanecem vazias quando a coleção está vazia: livros decorativos ficam nos móveis cenográficos, sem inventar registros. Variação/inclinação dos livros cenográficos não modifica os encaixes ou a orientação dos volumes selecionáveis pessoais. O espaço livre de C é deliberado e funcional. Arte ainda requer julgamento humano em enquadramento mobile; esta é uma candidata completa do escopo E, não aceite artístico/físico nem início de F/G.
