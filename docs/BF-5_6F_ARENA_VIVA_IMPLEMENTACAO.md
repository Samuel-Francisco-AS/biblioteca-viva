> **Refinamento F/R1–R4 autorizado — 09/11/2026:** proprietário testou F2 no Moto G06 e não percebeu defeitos mecânicos relevantes; UX melhorou, mas orbital estático/abstrato, arena, cartas e efeitos exigem retrabalho artístico. Esse relato é aceite mecânico dirigido, não aceite artístico final, TalkBack ou benchmark. Rodada continua na mesma branch/PR draft #48, motor/dados preservados, sem merge/G.

# BF-5.6F2 — Arena Viva e construção orbital

Data: 09/11/2026. Candidata na **mesma PR draft #48**, branch `feat/bf-5-6f-arena-orbital`, continuando F1 remota `4e23b6d`. Sem merge, aceite artístico/físico ou início da G. A–E e suas ressalvas permanecem. [Handoff F1 preservado](BF-5_6F_F1_HANDOFF.md).

## Sincronização e saneamento F2-A

Origin SSH conferido para Samuel-Francisco-AS/biblioteca-viva. Checkout inicial E limpo; `fetch --prune` encontrou F em `4e23b6d`, criada branch local rastreada e confirmado fast-forward sem mudanças. Nenhum reset/clean/rebase/force push, alteração de main ou descarte de dados.

F1 local: TypeScript PASS e 49/49 testes de projeção, motor, efeitos, IA, catálogo e Dexie PASS. Cinco arquivos tinham formatação divergente e o hook tinha erro ESLint de atualização síncrona em efeito. Corrigidos. O controlador agora isola respostas por geração e ID, ignora revisões antigas, trava toque duplo, reconsulta conflitos sem repetir comandos, cancela timers/assinaturas e serializa pausa solicitada durante gravação após o commit. StrictMode não cria outro controlador de IA. Definições de cartas públicas visíveis acompanham a projeção para inspeção; mão/deck adversários continuam somente contagens.

## Arquitetura e integração E

`ArenaDuel` ocupa a rota `/arcanario/duelos/arena/:id`. Salão passa a iniciar e retomar nessa rota. A mesa anterior permanece disponível em `/duelos/partida/:id`, com regressão própria. O escopo mínimo da F1 evita materializar o acervo pessoal para abrir a partida.

`useArenaSession` é o único controlador montado da partida. `DuelService.get/command` conserva autoridade, identidade única do comando, revisão esperada e commit antes da projeção. `arenaActionsForSelection` usa as ações exatas de `legalActions`; a cena não tem motor, IA, recursos, zonas ou regras próprias. Todas as animações decorrem de revisão confirmada; carregar/rotacionar/reconsultar a mesma revisão não reproduz uma invocação.

Dexie **v19**, backup **v11**, regulamento **duelo-arcano/1.0.0**, catálogo/identidades, replay e modos Oficial/Criador/Livre preservados. Sem migração, conta, backend, rede de jogo, economia ou mudança de balanceamento.

`ArenaCanvas` carrega Three.js/cena sob demanda. `arenaScene` recebe somente `ArenaView`, que não contém decks/mãos ocultos nem histórico integral. Controles DOM acessíveis acompanham as posições projetadas pelo mesmo modelo de câmera. Não há picking de alvos por coordenadas aproximadas nem arraste obrigatório.

## Direção visual, câmera e composição

Arquitetura original procedural: plataforma octogonal suspensa em três camadas de pedra, metal envelhecido, textura de alvenaria gerada em memória, juntas radiais, círculos rúnicos, obeliscos com cristais e órbitas, portais abobadados quebrados, ruínas e constelações. Campo superior adversário, inferior local, quatro círculos de criatura e dois de artefato por lado. Cartas têm corpos tridimensionais, gravuras e aparições por tradição (chifres da Ruína, folhas do Florescimento, halos do Conhecimento/Caos). Os quatro habitantes são identificados pelas tradições e nomes do catálogo E; não foram duplicados os GLBs residentes da Biblioteca.

Câmera ortográfica oblíqua própria, sem órbita livre durante combate. `ResizeObserver` reenquadra por proporção e reposiciona zonas. Retrato: HUD rival no topo, campo central, PV/energia locais, seleção compacta, mão completa e comando de turno. Paisagem: campo à esquerda, seleção/mão/comando à direita; HUDs acompanham o campo. Oito cartas cabem simultaneamente; em retrato estreito, a mão cheia usa duas linhas. A seleção exibe nome completo/custo/atributos; a inspeção mostra gravura e regras completas.

Referência de composição/ergonomia: arena mobile de Duel Links, conforme missão. Nenhum asset, personagem, regra ou interface proprietária copiado. Arte SVG das 48 cartas é a original E, ainda sujeita ao refinamento editorial já registrado. Para upload WebGL, SVGs sem tamanho intrínseco são rasterizados uma vez em canvas 384×288, mantendo seus originais e hashes. Cenário, silhuetas, textura e efeitos são código original do projeto, sem novos assets externos/licenças/dependências.

## Input, HUD e gameplay

- Toque/teclado seleciona carta, criatura ou artefato; bordas mostram disponibilidade e seleção. Ações ilegais não são fabricadas pela UI.
- Alvos legais ganham realce, inclusive o duelista no HUD. Toque escolhe alvo; botão contextual confirma a ação/ativação. Mais de uma habilidade mantém escolhas distintas. Cancelamento disponível sem deslocar o campo.
- Invocar, conjurar, posicionar artefato, atacar e ativar usam o mesmo serviço transacional E. Custos e atributos são os persistidos/derivados pelo motor.
- Inspeção modal com foco nativo, fechamento imediato e scroll somente interno. Habilidades/descrições e registro/regras ficam sob demanda. Não há instruções permanentes nem barras administrativas na batalha.
- HUD: PV de ambos, energia atual/máxima, turno, modo, contagens públicas e pausa. Dock/cabeçalho globais ocultos apenas nessa rota. Shell fixo com `100dvh`, insets seguros e sem scroll da página.
- Pausa salva o estado; retomada é explícita. Abandono exige confirmação e registra derrota pelo motor. Resultado oferece histórico/novo duelo ou retorno à Biblioteca.

Feedback confirmado combina pulsos de invocação, projétil de ataque/feitiço, impacto, partículas ascendentes de cura/fortalecimento, barreira esférica de escudo, queda de exaustão, dispersão na destruição e trajetória de Caos. Pool de 24 fragmentos compartilha primitivas/materiais; fenômenos usam cor, trajetória e forma próprias. Mensagem breve também apresenta o resultado textual para leitores de tela. `prefers-reduced-motion` e preferência interna suprimem efeitos de movimento.

## Construção orbital e Canvas residente

`orbitalArena.ts`: pequeno santuário de pedra suspenso com três anéis, cristal central e quatro pilares, no limite norte externo do edifício. É um objeto canônico `portal:duelo-arcano`, incluído no catálogo/picking e prioridade de toque existentes. Não invade salas/circulação: bounds testados fora de todos os retângulos caminháveis e acima de 2 m. Assim não acrescenta obstáculo de chão nem altera colisões, arraste ou câmera da Biblioteca. Seleção abre o Salão; link acessível oferece a mesma navegação.

O objeto pertence ao building e é descartado por seu proprietário. Não tem RAF, renderer, listener ou mundo residente próprio. `App` preserva a residência existente: fora da Biblioteca, `WorldHost.active=false` pausa renderer/simulação; a arena monta seu próprio renderer. Ao sair, cancela RAF, desconecta ResizeObserver, listeners e contexto, e libera geometrias/materiais/texturas. Retorno reativa o mesmo WorldHost, câmera, iluminação e habitantes, salvo substituição legítima do snapshot pelo contrato anterior.

## Lifecycle Android e recuperação

Voltar nativo usa o evento cancelável já fornecido pelo shell: fecha inspeção/registro, cancela seleção, pausa a partida ou sai ao mundo quando pausada. Escape equivale no navegador. Menus usam `dialog.showModal`, foco contido e retorno de foco.

Visibilidade e `appStateChange` suspendem IA/renderização e solicitam pausa persistente. Comando em trânsito termina uma única vez antes da pausa; estado confirmado é preservado mesmo se o processo encerrar antes de gravar a pausa. Retorno reconsulta a sessão e não repete comandos/efeitos antigos. Reabrir app recupera a sessão pelo Salão/histórico. Rotação redimensiona apenas a apresentação.

Perda de contexto interrompe RAF e oferece recriação explícita da cena mantendo a sessão. A falha gráfica não apaga dados nem executa comandos. Estado pausado/final é desenhado uma vez para permanecer fiel ao commit sem loop contínuo atrás do painel.

## Performance e limites

Geometrias e materiais de arquitetura compartilhados, textura procedural 128² e gravuras 384×288 em cache apenas dos IDs vistos. Três luzes globais, sem sombras dinâmicas ou point lights; efeitos por materiais emissivos e instâncias. Recursos pesados sob demanda; um único renderer desenhando por rota. Resolução inicial limitada a DPR 1,75, reduzida em passos de 0,25 somente após amostra de 120 frames com maioria acima de 30 ms, piso 0,75. Isso é política adaptativa de apresentação, não benchmark de Moto G06. Não há conversão da cena em fundo estático.

A IA mantém a cadência E de 380 ms por decisão e as regras/heurísticas existentes. Chromium com SwiftShader pode saturar CPU/GPU e não mede fluidez Android. Sem certificação de memória/termal, TalkBack humano ou desempenho sustentado.

## Validação local

Resultados locais consolidados abaixo; proveniência APK no adendo final. A CI remota não foi reexecutada: cota de Actions esgotada segundo o proprietário, sem certificação global verde e sem alteração de workflows.

## Roteiro Moto G06 — gate humano pendente

1. Instalar o APK debug por cima da versão existente, sem limpar dados. Conferir estudos, registros, cartas e backup existentes.
2. Biblioteca: pan, pinch, habitantes e iluminação; tocar o santuário orbital e entrar no Salão. Testar também entrada acessível.
3. Iniciar/retomar duelo em retrato. Jogar até resultado com invocação, feitiço, artefato, ativação e alvos; verificar vida/energia, Guardião, escudo, cura, exaustão e Caos quando disponíveis.
4. Durante campo/mão cheios, verificar zero scroll da página, cada alvo alcançável, nome/regra sob inspeção, dock oculto e controles livres das barras Android. Repetir em paisagem e alternar orientações sem nova ação/revisão inesperada.
5. Voltar fecha inspeção → cancela seleção → pausa; retomar, abandonar/cancelar confirmação, sair ao Salão e voltar à Biblioteca.
6. Alternar apps com comando/IA pendentes; voltar e conferir última confirmação. Encerrar processo pelo sistema e reabrir, retomando pelo Salão. Nenhuma duplicação ou perda de sessão.
7. Repetir Biblioteca↔arena e verificar câmera/posição/iluminação/habitantes, fluidez e ausência de degradação progressiva. Observar memória/temperatura em sessão prolongada.
8. Aumentar texto, ativar redução de movimento e TalkBack. Ler ambos os HUDs/cartas/ações, navegar diálogos e concluir um turno. Registrar dispositivo, build, orientação, PASS/FAIL por grupo e observações artísticas.

## Dívidas e G

Aceite artístico, ergonomia física, TalkBack e memória/termal dependem do proprietário. UI/UX transversal do restante do Arcanário e refinamento das gravuras continuam dívida separada; balanceamento Ruína/Conhecimento não muda. Histórico integral continua disponível pela sessão/replay E; painel compacto mostra somente a última confirmação pública. As falhas históricas de CI/E2E/3D não são encerradas por F. G continua futura: auditoria integrada e decisão de fechamento, sem implementação ou merge nesta missão.

### Resultados e classificação das ocorrências

- **Início F1:** TypeScript PASS; 49/49 testes PASS. Formato FAIL em cinco arquivos e lint FAIL no hook, corrigidos no checkpoint A.
- **Ampla única:** 1.174 PASS / 12 FAIL, 182 arquivos, 172,45 s. Não repetida. Dois asserts de catálogo esperavam 90/100 e passaram a 91/101 pela inclusão explícita do portal, mantendo unicidade e adicionando verificação de sua identidade. Três esperas da Oficina/questões já constavam no relatório E; uma espera de sessão na Biblioteca também falhou nesta rodada. Esses quatro casos passaram depois no dirigido (20/20, seis arquivos), sem alterar seus asserts/timeouts.
- **Seis timeouts gráficos de 5 s remanescentes na ampla:** envelopes Aryn/Ytha (`inhabitantAnimator`), rig Ytha, pickup Aryn, `sessionBookPhysical` e `libraryRecordLayout`. Os dois de animator já constavam em E; os outros quatro não têm baseline isolado comparável nesta missão e ficam como ocorrências sem atribuição comprovada. Código/GLBs desses módulos não foi modificado pela F. Não foram inflados timeouts nem repetida a suíte ampla para mascarar resultados.
- **Regressão dirigida:** 124/124 PASS em 12 arquivos (motor, efeitos, IA, catálogo, projeção/câmera, sessão/StrictMode/conflito, Dexie/replay, portal, navegação, WorldHost/runtime). Dirigido de reconciliação de UI/sessão: 20/20 PASS. Última verificação adicional de câmera/hook: 4/4 PASS. Essas contagens são execuções com sobreposição, não um total somado de casos únicos.
- **E2E A–E:** 14/14 PASS na rodada consolidada, com Estudos, Oficina, acervo/baralhos, Provações/diagnóstico, pacotes/offline, backup/troca inválida, deck/autoria TCG, partida legada completa e Canvas residente preservado. Tests E foram adaptados para abrir explicitamente a URL legada onde exercitam a mesa anterior; o modo Criador usa a arena nova.
- **E2E F2 completo:** PASS em 2,3 min, com seed 17/Ytha × Lua, invocação/ataque, alvos, encerramento de turno, inspeção, rotação, pausa/retomada/reload, Voltar nativo cancelável, resultado, novo duelo, confirmação/cancelamento de abandono e retorno à Biblioteca. Não equivale a execução nativa no Android.
- **Ocorrências intermediárias F:** primeira execução interrompida com exit 143; uma espera da IA excedeu o gate de 10 s no SwiftShader; restaurada cadência E de 380 ms e aplicada adaptação após frames lentos, sem alterar a heurística. Outra partida chegou ao resultado, mas a estratégia aleatória não realizou ataque; fixture tornou-se determinística, mantendo o assert de ataque. A preparação antiga de densidade não chegava a dois artefatos antes de dano automático terminal; mudou para deck de suporte sem ataques na preparação, com replay válido, mantendo a exigência 4+2+8.
- **Revisão visual:** corrigido upload SVG para textura WebGL, confirmado também em captura de produção; corrigida afinidade visual Florescimento tipada pelo contrato E. Artefatos receberam escala 0,7 e separação própria. Gate de campo cheio passou a exigir alcance de todos os centros e interseção menor que 1 px² entre retângulos de toque; encontrou sobreposição horizontal real em paisagem. Largura dos alvos agora deriva da altura do campo (`cqh`), acompanhando a câmera. Retrato 390×844 e 360×640 passaram com mão cheia, background/resume e perda/recriação de contexto; paisagem 844×390 revalidada PASS em 21,3 s após o reparo, sem aumentar timeout.
- **Gates estáticos:** build/TypeScript, formato, lint de todos os arquivos alterados, áudio e hashes dos pacotes locais conferidos. Duas tentativas finais de lint global foram interrompidas com exit 143 sem diagnóstico; não se declara lint global final certificado. A verificação dirigida posterior terminou com exit 0, sem avisos ou regras desativadas. Relatório de performance é exclusivamente de bytes, não FPS Android.

Evidências: [bundles](audits/evidence/bf56f/build-performance.json), [matriz local](audits/evidence/bf56f/validation.json) e capturas fictícias em `docs/audits/evidence/bf56f/`. Nenhuma execução/retry de Actions solicitada; limite de cota é distinto de falha técnica do produto. Não há CI global verde.

## APK debug e proveniência final

`npm run android:build:debug` PASS (build web, Capacitor sync e Gradle `assembleDebug`, 21 s). Execução com JBR do Android Studio, máximo de dois workers, paralelismo/daemon desativados. APK não versionado: `android/app/build/outputs/apk/debug/Biblioteca-Viva-BF56F2-debug.apk`.

- **Bytes:** 11,647,409.
- **SHA-256:** `59dc52ed2dfa6358da7bcf090479146abc0c6e8fa07b81edf867162220272d70`.
- **Commit fonte:** `5f433e6cff636d511bbb5c809af8739634e9020a` (F2-D), árvore `7da139e9bdcfd03ae3adcf364723b4fd99ae29e3`; checkout rastreado limpo durante o build. Commit posterior muda somente documentação/evidências.
- **Integridade:** 111/111 arquivos web iguais em dist → assets Android → ZIP, incluindo 48/48 gravuras; `.vite/manifest.json` é metadado de build excluído explicitamente.
- **Atualização sobre E:** mesmo applicationId `com.samuelfrancisco.bibliotecaviva`, versionCode 1/versionName 1.0 e mesmo certificado debug verificado por `apksigner`. Preparado para instalação sobre o APK E assinado com essa chave, preservando o banco; instalação física e confirmação dos dados continuam pendentes. Sem bump, tag, release, keystore versionado ou operações sobre dados pessoais.

[Proveniência binária verificável](audits/evidence/bf56f/apk.json). Warnings conhecidos de chunks >500 kB e `flatDir` permanecem. Bundles iniciais ~612 kB JS e Three dinâmico ~724 kB são bytes estáticos, não medidas de fluidez física. As capturas `campo-cheio-*` representam o dimensionamento final; `intermediario-combate-*` preservam explicitamente a revisão visual anterior ao reparo de escala/zonas.

Commits: F2-A `0a33ef0`; F2-B `7fff152`; F2-C `035d259`; F2-D `5f433e6`. Publicação somente na mesma PR draft #48, sem merge/main/G.

## Refinamento R2 — Lua do Arcanário

O antigo objeto estático foi substituído por um grimório encadernado, crescente de bronze, base de pedra, anéis articulados e poeira estelar. Orbita no anel arquitetônico existente de raio 28, em 420 segundos; núcleo gira continuamente, anéis precessionam e emissão pulsa. Usa somente o scheduler/delta ativo do `ThreeWorldRuntime`, sem RAF/listeners adicionais. Pausa preserva fase, retomada não usa relógio de parede e redução de movimento congela o movimento. Corpo estático agrupado por material; sem luz nova.

Mantém `portal:duelo-arcano` e picking canônico; highlight acompanha a root móvel. Teste geométrico percorre a volta inteira, garante distância das salas/altura segura, identidade estável e raycast em posições diferentes. Fonte permanece pertencente ao building e é descartada no mesmo ciclo de vida. Aparência e suavidade no aparelho exigem nova avaliação humana; câmera/limites de navegação não foram alterados.
