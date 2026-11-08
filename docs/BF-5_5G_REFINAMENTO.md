> **ACEITE FINAL POR RESSALVAS — 08/11/2026:** proprietário avaliou a candidata G no Moto G06 e autorizou consolidação e integração da BF-5.5, ressalvando que o acabamento “não ficou perfeito”. Não foram enviados PASS individuais de voo/andar/HUD paisagem, e o E2E completo de HUD em paisagem continua pendente após ajuste CSS validado por fixture. As limitações abaixo são preservadas, **sem declarar CI global verde nem perfeição artística**. [Fechamento BF-5.5](BF-5_5_FECHAMENTO_2026-11-08.md).

# BF-5.5G — Refinamento do mundo, animações e HUD

Candidata de 08/11/2026, derivada de `feat/bf-5-5f2-interacoes-fisicas` no SHA conferido `d8b2c4eb151f8fe2643cd3e3e0a3ceaf534e53ea`, com checkout inicial limpo. Branch `feat/bf-5-5g-refinamento-consolidacao`; uma nova PR **draft encadeada à F2**, sem merge. A PR #41 permanece draft e intacta. Commits com `[skip ci]` para preservar Actions; checks omitidos não são verdes.

O proprietário informou **PASS funcional F2 no Moto G06** para leitura física, estudo/assentos, trabalho/treino/entretenimento, interrupções/continuidade e fluidez/mundo. Esse aceite é a base desta missão, não um teste físico novo da G. **BF-5.5 não concluída: arte, ergonomia, fluidez percebida e decisão final do proprietário continuam pendentes.** BF-6/BF-7, release e recuperação global não iniciados.

## Escopo e refinamentos

### G-A/B — Locomoção autoral

`locomotion.py` integra a receita Blender após `physical.py`, sem novos bones ou owner de movimento. Regenerados os quatro `.blend`, GLBs e manifest. Preservados identidade, escala, materiais, 19 nomes de clips e fontes editáveis.

- **Ytha:** corrigido o hover para o eixo vertical real do rig/exportação. `idle`/`turn` oscilam suavemente; `walk`/`carry_walk` sustentam o corpo mais alto, com inclinação contida, contramovimento do torso/cabeça, braços abertos e pernas recolhidas com microvariação. As asas batem em torno do eixo vertical corporal: girar só o eixo longitudinal diagonal torcia a membrana sem comunicar voo. Seis batimentos por clip nominal de 3,2 s, menores em repouso. O root permanece no piso sob a agência, X/Z estáveis; não existe voo livre. Envelope de navegação **0,92 m preservado**, incluindo asas.
- **Samael:** passada firme, apoio mais marcado, menor levantamento dos pés/balanço de braços e compensação contida do torso.
- **Aryn:** passada alinhada, balanço comedido, recuperação baixa dos pés e estabilidade de cabeça, preservando o fólio pessoal.
- **Lua:** levantamento maior e braços mais expressivos, com contrapeso corporal e movimento da draperia.
- **Terrestres:** ciclos nominais de 0,8 s em `walk`/`carry_walk`, calibrados às velocidades existentes (0,95 / 1,22 / 1,13 m/s). Durante os 60% de apoio, o pé recua em espaço local para cancelar o avanço; recuperação usa curva suave e levantamento. IK anatômica e orientação dos pés são **assadas na autoria**, sem solver por frame no app. Pelve amortece e distribui peso; draperia acompanha.
- `idle ↔ walk` mantém crossfade de 220 ms do mixer existente. `turn`, assim como `walk`/`carry_walk`, deixa a orientação externa exclusivamente com a agência; o clip demonstrativo não acrescenta outro yaw. Contatos F2 continuam amostrados pelo tempo da agência, sem aplicar fades sobre pega/sentar/levantar.

[Quatro pranchas comparativas reais](audits/evidence/bv-g/): F2 acima / G abaixo, mesma câmera, iluminação, escala e fases. Não são aprovação artística nem benchmark Android. [Verificação dos clips preservados](audits/evidence/bv-g/clip-preservation.json): os restantes conservam estrutura/duração/tracks; `carry`/`watch` têm somente diferenças numéricas submicrométricas de exportação, até 1e-6. Não se afirma identidade binária desses clips. Fontes e procedimentos: [pipeline](INHABITANT_ART_PIPELINE.md).

### G-C — Navegação

O dock aquece o módulo no contato, além do hover/foco já existentes, e sinaliza o destino confirmado enquanto a localização não foi aplicada. O estado é descartado no commit, evitando reaparecer como seleção pendente ao voltar. Cliques modificados preservam sua semântica. O Router já usa transições React no código instalado; não foi criado um segundo roteador, espera artificial ou agendamento de simulação.

Entrada/retorno usa 150 ms de opacidade apenas na vinheta decorativa do cenário. O Canvas e os ancestrais de seus controles fixos não recebem transformação, blur ou fade de tela inteira. Páginas convencionais conservam a entrada curta existente. Mundo residente, pausa/retomada, câmera, seleção, sessões e consultas permanecem sob os owners existentes. Isso melhora o feedback e a continuidade perceptiva, **sem alegar eliminação de latência física ou do engasgo residual das quests aceito na R5**.

### G-D — HUD e notificações

- Retirado o botão superior direito “Explorar por lista”. O mesmo painel de registros, habitantes e objetos continua disponível em **Acervo e habitantes**, no canto inferior esquerdo; nomes acessíveis, Escape/Back e fallback preservados.
- A vinheta “Biblioteca Viva / O santuário das histórias” aparece quando o Canvas fica pronto, inclusive no retorno à aba, por **3.000 ms**, fade de **220 ms**, com limpeza dos timers ao sair. O título semântico permanece disponível. Notificações, exploração e narrativa têm prioridade visual sobre a vinheta.
- Mensagens ambientais continuam com seu ciclo de 4 s, no **topo**, fora do stacking context da camada do renderer que antes as prendia abaixo do HUD. Safe areas e a altura efetivamente medida do banner de sessão deixam espaço para timer/notch; o shell mede banner e extensão real do dock (altura + distância do rodapé, sem capturar sua translação temporária em fólios). Observadores locais medem os controles inferiores e a mensagem real, com limpeza ao ocultar/desmontar. Isso evita reservas fixas que comprimiam o painel em paisagem; mensagens longas rolam, limitadas a 4 rem em paisagem curta.
- Quests ficam à direita, com largura que respeita o acesso à lista; seleção fica acima dos controles. Painéis altos rolam e deixam espaço para notificações. Removida a legenda residual “Toque para descobrir”. Movimento reduzido desliga as novas transições, preservando o período informativo da marca.

## Integração com F2 e limites

Domínio/aplicação/persistência não mudaram. Sem migração (Dexie v14/backup v6), novos contratos espaciais, dependências, PointLights, mundo ou telemetria. Agência, reservas/ocupação, rotas, RAF principal, sockets e controlador singular do livro continuam existentes. Leitura sentada e estudo, ofício, treino, entretenimento, pausa/interrupção, continuidade, noite, pergaminhos e efeitos/quests R5 compõem a regressão dirigida.

Limites F2 preservados: recolhimento pessoal só para Samael/Aryn; Lua/Ytha usam fallback autônomo. Entretenimento continua em pé, treino sem levantamento de equipamento, trabalho/escrita na prancha segurada. Não foram introduzidos dedos individuais, rig facial, IK runtime ou voo 3D livre. A caminhada foi calibrada à velocidade retilínea; curvas, paradas e contato visual fino ainda exigem avaliação humana.

## Verificações

Resultados finais são registrados abaixo após executar os gates. Não confundir rodadas sobrepostas com uma suíte ampla verde.

- Rodada dirigida integrada: **277 PASS / 1 timeout, 29 arquivos, 278 casos**. Timeout de 5.000 ms no teste existente do envelope exaustivo de Ytha (todos os vértices/33 poses/19 clips), executado com build/captura concorrentes. Não se atribui causa física a essa execução.
- Arquivo do animador isolado, após encerrar os trabalhos concorrentes: **13/13 PASS**, incluindo esse envelope; prazo/asserts intactos. Ao todo, os 278 casos distintos passaram entre as duas execuções; não houve uma segunda rodada integrada integralmente verde.
- Durante implementação: cinco falhas novas de harness por ResizeObserver ausente no jsdom, corrigidas com mock explícito; teste novo de asas inicialmente media distância à pose inicial, corrigido para excursão completa entre poses; tipos/assinatura RTL e lint dos novos testes/scripts corrigidos. O mock final de ResizeObserver do shell também foi corrigido para selecionar a assinatura do banner, em vez da última instância criada pelo painel; regressão passou sem alterar o produto/asserts. Não são dívidas antigas nem falhas de CI remota.
- Após a correção ergonômica final: **66/66 PASS em seis arquivos** (shell, dock, página, vinheta, host e feedback), mais **5/5 de feedback** após acrescentar regressão de altura/cleanup da mensagem (quatro sobrepostos) e **6/6 do shell** após acrescentar regressão de dock temporariamente deslocado pelo fólio (cinco sobrepostos). Contagens mantidas separadas da rodada de 278 casos.
- Regressão CSS produtiva `check-g-hud-layout.mjs`: **4/4 casos PASS** (retrato/paisagem × mensagem curta/longa), usando os estilos reais e conteúdo fictício, sem renderer. Confere faixa de sessão, topo da mensagem, painel com ao menos 44 px úteis, separação dos controles/quests e dock. [Geometria registrada](audits/evidence/bv-g/hud-layout.json). Não equivale a E2E do app ou aparelho.
- **E2E dirigido final: 1 PASS / 1 FAIL**, retries=0. PASS da vinheta e ida/volta nas quatro abas, mesmo Canvas e um/zero RAF. HUD alcançou e aprovou as medições do retrato; timeout global de 30 s ao repetir a ação em paisagem. A reserva fixa de espaço foi corrigida depois e verificada pela fixture CSS; **o E2E integrado de HUD/paisagem permanece pendente na candidata final**, sem nova repetição. O cenário anterior R5 de input chegou a pinch, seleção e conversa, mas terminou no deadline ao ativar a escolha: não declarado PASS nem atribuído a uma causa comum.
- Falhas intermediárias novas de E2E: tentativa de usar dock enquanto o fólio o desativa (corrigida para voltar pela Coleção), leitura da marca depois de seu período de exibição (ordem corrigida), deadline do cenário longo; medições agrupadas em uma avaliação, sem relaxar asserts. A fixture CSS revelou sobreposição do painel com quests e painel pequeno em paisagem; o uso das alturas reais corrigiu ambos. Revisão visual também corrigiu contraste do banner de sessão. Não houve novos loops de SwiftShader para obter verde.
- **PASS:** `npm run format`, `format:check`, lint, TypeScript, `audio:check`, build web, `performance:report`, Android sync/debug e `git diff --check`. O comando debug inclui build e sync; o APK foi refeito após os ajustes finais de HUD. Avisos conhecidos de chunks >500 kB/Gradle `flatDir` permanecem. Bundle inicial final: 692.048 B; não é métrica de FPS/latência. Build normal, sem diagnósticos. Sem workflow remoto/manual ou CI global verde.

Não executada suíte global/E2E global, teste físico, TalkBack, áudio percebido, profiling GPU Android, termal ou memória sustentada. Dívidas históricas R1–R5/CI continuam separadas e não são declaradas resolvidas. Não houve alteração de timeout, retries ou remoção de asserts para obter PASS.

## APK e proveniência

Arquivo: [`android/app/build/outputs/apk/debug/Biblioteca-Viva-BF-5.5G-debug.apk`](../android/app/build/outputs/apk/debug/Biblioteca-Viva-BF-5.5G-debug.apk) — **11,641,875 bytes**. SHA-256: `f8dc746d6cddd027f0ef290caff02cd34f27e92df188cde3dc391f7487c42fdc`.

[Proveniência e hashes dos 48 arquivos web conferidos byte a byte no ZIP](audits/evidence/bv-g/apk.json), incluindo os quatro GLBs e o CSS final. `.vite/manifest.json` é metadado de build e não é copiado pelo Capacitor. APK fora do Git, com cópia nomeada para a avaliação. Versão/pacote/assinatura debug padrão preservados; sem assinatura de publicação, release/beta ou instalação em dados reais.

## Roteiro Moto G06

1. Atualizar pelo APK G preservando os dados. Abrir o Canvas: conferir marca por cerca de 3 s, desaparecimento suave, ausência do antigo botão superior direito e acesso **Acervo e habitantes** no rodapé esquerdo. Sair para outra aba e retornar: marca reaparece, câmera/seleção continuam coerentes.
2. Observar um percurso completo e uma parada de **cada habitante**: Samael firme/pesado; Aryn contida; Lua graciosa/expressiva; Ytha menor, suspensa, com asas batendo, flutuação e pernas recolhidas. Avaliar idle→mover→curvar→parar, frente/perfil e noite. Registrar se ainda há deslizamento, rigidez ou exagero; o aceite artístico é individual.
3. Trocar Biblioteca→Coleção→Arquivo→Resumo→Ajustes e voltar; comparar resposta ao toque e continuidade. Fazer pan, pinch/zoom e selecionar personagem/registro; abrir/adiar uma quest e observar seus efeitos, aceitando como referência a dívida residual R5, sem presumir que G a resolveu.
4. Tocar um objeto vivo para produzir mensagem: verificar no topo, legível e sem encobrir marca, banner de sessão ou controles. Abrir lista e diário/quest com mensagem presente. Repetir em retrato/paisagem, com sessão ativa/pausada e tamanho de texto maior; conferir rolagem e acesso ao mundo/controles.
5. Iniciar leitura e acompanhar o mesmo livro até mãos/assento, pausar/retomar/concluir; depois estudo/escrita, trabalho, treino e entretenimento. Conferir reservas, saída física e ausência de duplicação/interseção nova, mantendo os limites F2. Verificar nove luminárias, magia e pergaminhos.
6. Ir para background e retornar durante caminhada e atividade; verificar continuidade e recuperação de seleção/gestos. Testar movimento reduzido. Registrar **PASS / PARCIAL / FAIL por grupo**, personagem, orientação e ponto da sequência; enviar poucas capturas/vídeos representativos com conteúdo fictício.

Pendências concretas: aceite artístico dos quatro (especialmente voo de Ytha), navegação percebida, ergonomia com texto ampliado, HUD/quests em paisagem no app completo, pan/pinch/seleção no APK, atividades e background/retorno. O PASS funcional F2 permanece válido para a base, sem extrapolar automaticamente às alterações G.

A missão entrega uma candidata para esse gate. **A decisão de encerrar BF-5.5 pertence ao proprietário após avaliação física; nenhuma PR será mesclada nesta missão.**
