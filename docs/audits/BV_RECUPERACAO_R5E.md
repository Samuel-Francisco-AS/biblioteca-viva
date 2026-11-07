# R5E — Refinamento artístico dos habitantes

07/11/2026. Branch `feat/bv-r5-renascimento-artistico`, mesma [PR draft #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40). Base local/remota `cd2edb5f1f1d408b984e91557e0460d262cda188`, árvore inicial limpa, conferidas por fetch e conector. Nenhum push intermediário; publicação final única com `[skip ci]`. R5 permanece aberta, sem merge, nova fase ou conclusão implícita de BF-5.5F2B/F2C.

O proprietário observou melhora da R5D no Moto G06, mas julgou o resultado artístico insuficiente. Esse é o feedback humano de entrada; **não há aceite humano da R5E**. A missão autoriza localmente a revisão da escala/locomoção de Ytha; os 1,70 m históricos não impedem essa mudança expressa. Demais identidades, IDs, schema, backup, persistência, agência/reservas e seis artefatos R2 preservados.

## Avaliação por personagem

| Habitante | Implementado e evidência visual | Limitações e avaliação pendente | Custo técnico R5D → R5E |
|---|---|---|---|
| Samael | Ombros/peito/braços mais largos, mandíbula angular/cristas de obsidiana, armadura sobreposta, arnês/rebites e fissura torácica. Idle/reação/conjuração mais contidos e pesados. Café/notebook preservados. Vapor negro, filamentos lilás e brasas geométricas deixam intervalos silenciosos e intensificam react/magic/recover. | Rosto sem rig facial; brasas/vapor são superfícies ligadas ao rig com emissão/opacidade temporal, não simulação de fumaça. Precisa julgamento humano de imponência, agressividade contida e leitura dos detalhes no aparelho. | 1.312.488 → 1.296.796 B; 9 → 11 meshes; 26.566 → 25.782 triângulos. Removidos os três aros genéricos antigos, substituídos por presença própria; não houve simplificação por budget. |
| Aryn | Fólio aberto real com tábuas, folhas curvas, lombada/linhas autorais; gestos de consulta/inspeção, cabeça e mão de apoio mais precisos. Estola, filigranas, broche e rosto menos arredondado. Sutura dourada e órbitas finas próximas ao livro. | Livro cenográfico ligado à HandR; não abre o livro pessoal do jogador nem fecha os dedos com IK. As folhas têm curvatura modelada, sem virar páginas individuais. Julgar elegância/legibilidade e contato acessório-mão. | 1.852.552 → 1.911.848 B; 9 → 10 meshes; 44.922 → 46.726 triângulos. |
| Ytha | Geometria menor, 1,32 m; clearance visual 0,16 m, joelhos recolhidos e poses de suspensão nos oito clips, inclusive deslocamento. Oscilação vertical suave de ±1,2 cm; asas curvas/laceadas, membranas/ocelos, flores/cachos/pétalas. Pólen emissivo e luz própria verde suave. | É hover sobre as rotas atuais, **não navegação aérea 3D**: não sobe obstáculos, não atravessa móveis ou passagens bloqueadas. Sem voo físico/altitude persistida. Avaliar se a escala/flutuação e o brilho correspondem à fantasia desejada; sem pressupor aceite. | 1.913.216 → 2.411.544 B; 11 → 12 meshes; 44.456 → 61.226 triângulos. Uma PointLight local sem sombras, alcance 2,4 m e intensidade ≤0,34. Raio de referência **0,92 m preservado**, largura real em repouso ≈1,183 m. |
| Lua | Cachos/nó lunar e capa em camadas, broches e grimório com ferragens/cristal. Gestos de mão/braços e cabeça com floreio/antecipação; órbitas partidas e glifos experimentais próprios. Presença luminosa ornamental frequente (ciclo de 7 s), com picos em gesture/magic/recover. | Frequência decorativa não altera intenções/prioridades da agência nem dispara acidentes. Sem simulação de partículas/dedos/rig facial. Julgar carisma, beleza dos glifos e distinção de Aryn. | 1.264.600 → 1.344.812 B; 9 → 10 meshes; 25.034 → 27.734 triângulos. |

[Comparação R5D/R5E](evidence/bv-r5e/comparison.png), [32 vistas GLTFLoader reais](evidence/bv-r5e/portraits/) (frontal, três-quartos, noite e magia por personagem/versão), [mundo antes](evidence/bv-r5e/world-before/) e [mundo depois](evidence/bv-r5e/world-after/). Mesma câmera/luz externa por par; luz/emissão autorais novas fazem parte do resultado. Night de retrato amostra 16 s de presença para mostrar aura ocasional; magic amostra 1,6 s do clip. Imagens são dos GLBs exportados com controlador de presença produtivo, não ilustrações substitutas nem renders de fonte divergente. Só o proprietário aprova a arte de cada um.

## Contratos preservados e refinados

- `build.py` incorpora `refine.py` na autoria original; quatro `.blend`, GLBs e manifest regenerados. Sem asset externo, nova licença, decoder, textura ou dependência. Skin funcional e os mesmos 15 bones (17 em Ytha), três sockets e oito nomes/durações de clips preservados.
- Hover está na geometria/armature e clips. Pivot/root continuam em Y=0, agência mantém posição/yaw e navegação X/Z; apenas Ytha tem min Y visual de 0,16 m em bind pose. Sua altura geométrica é 1,32 m (topo de repouso em ≈1,48 m). `INHABITANT_GROUND_CLEARANCE` explicita a diferença; testes de chão usam esse contrato, não deixam de verificar apoio/clearance. Sem alterar coordenadas persistidas ou reduzir envelopes.
- `inhabitantPresence` altera somente opacidade/emissão de materiais FX e intensidade da luz. Não escreve transformações de bones/root, não chama agência, não cria timers/RAF, leases, dados ou sistema paralelo de animação. O AnimationMixer existente continua responsável pelos oito clips. O controlador anterior que sobrescrevia escala do bone Magic foi retirado; FX temporais não disputam os clips.
- Samael em repouso: janela suave de 14–20 s a cada 22 s, máximo ornamental 0,24; react/magic/recover têm pico finito conforme duração. Nunca máximo contínuo. Lua tem emissão recorrente e picos de ação; Aryn tem efeito próximo do fólio, Ytha brilho contínuo suave. Sem flashes de frame; inicialização aplica nível idle antes do primeiro render.
- Background/pausa recebem nenhum avanço extra; delta decorativo limitado ao mesmo 50 ms. Movimento reduzido congela o relógio e mantém níveis estáticos (Samael sem aura ornamental). O hover base de Ytha continua suspenso no repouso reduzido, sem salto de X/Z ou falsa aterrissagem.
- Picking/highlight usam os bounds reais deformados. Objetos de efeitos continuam parte do mesmo personagem; nenhum ID/selecionável paralelo. Luz de Ytha pertence ao controlador e é removida/disposta antes da árvore; materiais/Skeleton/buffers pertencem ao owner existente, inclusive load tardio.

## Custos observados

[Inventário R5D](evidence/bv-r5e/before.json) e [R5E](evidence/bv-r5e/after.json): total GLBs **6.342.856 → 6.965.000 B**, meshes/materiais **38 → 43**, triângulos **140.978 → 161.468**, zero texturas de superfície. Buffers inventariados no mundo **5.618.616 → 6.233.652 B**. São custos, não budgets nem memória Android medida.

[Probe pareada do mundo](evidence/bv-r5e/world-after/metrics.json), quatro habitantes carregados/atualizados nas posições reais, culling preservado (não todos visíveis no mesmo frustum):

| Vista | Calls antes → depois | Triângulos renderizados antes → depois |
|---|---:|---:|
| ampla | 341 → 343 | 256540 → 259312 |
| Samael próximo | 122 → 126 | 174042 → 174242 |
| Aryn próxima | 84 → 86 | 186142 → 190682 |
| Ytha próxima | 89 → 91 | 175062 → 209538 |
| Lua próxima | 97 → 99 | 168862 → 175630 |
| noite | 98 → 100 | 169030 → 175798 |

Uma luz local adicional: 13 → 14 PointLights na composição; ativas no cenário diurno 0 → 1, noturno 9 → 10. Isso acrescenta trabalho de iluminação/shaders, sem remover as luzes ambientais aprovadas. Zero pageerrors e teardown `disposed`, zero canvases nas duas versões. PointLight não significa draw call próprio; geometrias FX e transparência também têm custo.

[CPU de animação/parse dos quatro juntos](evidence/bv-r5e/animation-costs.json): 60 frames de aquecimento e 300 amostras, sem render e sem outra captura concorrente. P50 0,067 → 0,048 ms; P95 0,128 → 0,084 ms. Amostra diagnóstica sujeita a JIT/GC, não ganho significativo provado nem performance de GPU. Não mede controlador material/luz; o mundo inclui esses custos. Parse exclui rede/upload. Heap do processo não é retenção após GC nem memória Android. Nenhum aparelho conectado/medido nesta rodada; não inferir desempenho físico dessas contagens.

## Verificação e ocorrências da implementação

Primeiro conjunto existente de assets: **23/23 PASS**. Novo conjunto inicial de presença/seleção: **14 PASS/1 FAIL**; o teste de hover detectou translação lateral de 1,2 cm por eixo local de bone. Corrigido na autoria para eixo local Y, vertical no Three; mesmo assert de X/Z mantido. Novo teste de presença/hover após correção: **3/3 PASS**. Envelopes continuam amostrando todos os vértices deformados, sem redução de raio ou aumento de timeout.

Harness do mundo inicialmente encontrou `git show` ENOBUFS em GLBs > buffer padrão do Node. Leitura passou a dimensionar o buffer pelo tamanho real de cada blob. Uma captura simultânea encontrou falha de importação dinâmica; caches Vite dos dois diagnósticos foram isolados e a execução final foi sequencial. Sem mudança do produto/prazos para resolver preparação, sem loop de E2E. [Logs de preparação](evidence/bv-r5e/preparation.json) preservam essas falhas separadamente dos gates finais.

Gates finais e APK em [local-gates.json](evidence/bv-r5e/local-gates.json) / [apk.json](evidence/bv-r5e/apk.json); resultado consolidado abaixo. O E2E R5D 0/2 e o R2 histórico permanecem abertos, não reexecutados nesta rodada artística. Não se declara CI global verde.

## Publicação e avaliação humana

Workflows conferidos: CI push main/pull_request, preview dispatch/push main filtrado. Nenhuma mudança de workflow ou dispatch/rerun; commit `[skip ci]`, **um único push**, PR #40 mantida draft e aberta. Nenhum merge, R6, conta, backend, persistência, schema, backup ou ID alterado.

[Roteiro Moto G06 R5E](evidence/bv-r5e/MOTO_G06.md). Instalação/teste físico, TalkBack, áudio percebido e fluidez sustentada não foram executados pelo agente. Avaliar os quatro separadamente, registrar ajustes e somente então decidir novo refinamento/aceite. **R5 não encerrada; BF-5.5F2B/F2C e assento continuam não entregues.**

## Resultado local final

**PASS:** formato, lint global, tipos, **102 testes dirigidos em 10 arquivos**, build web, performance:report, Android sync/debug e diff --check. A rodada de 102 inclui os novos testes de presença/hover e regressões reais de GLB/skin/sockets, clips, envelopes, picking/highlight, runtime, livro/pergaminhos, agência e continuidade. Não é reexecução da suíte global de 950 testes da R5D. Sem E2E novo, retries, aumento de timeout, ou alegação de CI verde. Warnings conhecidos de chunk >500 kB e Gradle flatDir permanecem sem falha de build.

APK local: `android/app/build/outputs/apk/debug/app-debug.apk`, **10641553 bytes**, SHA-256 `56fd5b3ef2ab59d60175b6dc78aaa9aeab611aee8e29d4da30ead1653f98ca5b`. Build não instalado; não equivale a gate físico. `.blend`, receita, GLBs e evidências públicas usam conteúdo autoral/fictício. Candidata aguarda avaliação individual de Samael, Aryn, Ytha e Lua.
