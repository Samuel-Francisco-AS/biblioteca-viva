# BF-4E — Relatório de implementação

Estado: implementação candidata à auditoria independente; não encerrada. Auditoria independente e
validação física pendentes. Nenhum PASS humano ou TalkBack é alegado.

## Baseline e Git

Checkout inicial limpo em `feat/bf-4d-spatial-organization`, commit `daf0894`;
nenhum commit local não publicado. `fetch --prune`, switch seguro e pull ff-only
sincronizaram HEAD/origin/main em `74a3de12456dc094ab533b4f662e173afdd71772`.
Branch nova: `feat/bf-4e-living-objects`. Sem reset, clean, stash, rebase ou merge.

## Arquitetura e contratos

- `livingObjects.ts`: catálogo de dez identidades ambientais, ações autorizadas,
  estado efêmero e eventos tipados retornados por despacho. Sem recursão de eventos:
  consequências da descoberta são transições explícitas e limitadas.
- `LivingControls.tsx`: catálogo por cômodo, ações, descrição, estado, resultado,
  atmosfera e progresso. O mesmo estado permanece operável no fallback.
- `WorldHost`: cria sessão por host, passa ao runtime e conserva os controles
  convencionais Anterior/Próximo separados das ações ambientais.
- `livingVisuals.ts`: peças reais, luz e efeitos dentro do owner do edifício.
  `ThreeWorldRuntime` atualiza no RAF existente, sem RAF por objeto. Delta máximo
  de 50 ms; pausa congela a apresentação e retomada reinicia referência temporal.
- Redução de movimento aplica destino imediatamente e elimina oscilações.
  Falha WebGL continua terminal e preserva a sessão React para operação textual.
- Sem dependências novas, arquivos externos, Dexie, backup, entidades de domínio,
  personagens, caminhos, diálogos, backend ou persistência espacial.

## Famílias e distribuição

Dez famílias têm implementação visual e ações. A cobertura criativa/ergonômica
precisa ser auditada no mundo e no aparelho; contagem não equivale a aprovação.

| Família / cômodo | Âncora preservada | Consequência |
|---|---|---|
| Estante / A | reading-shelf-01 | Entalhe desloca ao pressionar/soltar |
| Mesa / A | bf4-prop:0 | Pergaminho move e inscrição aparece após luz |
| Luminária / A | bf4-prop:0 | PointLight liga/desliga; três intensidades |
| Poltrona / B | bf4-prop:6 | Almofada original comprime/retorna |
| Armário / E | bf4-prop:16 | Gaveta desliza reversivelmente, expõe relíquia |
| Planta / D | bf4-prop:13 | Folhas originais oscilam, flor aparece/recolhe |
| Livro decorativo / C | bf4-prop:9 | Capa articulada, página vira, mecanismo |
| Relógio / B | bf4-prop:7 | Ponteiro gira por corda manual |
| Globo / D | bf4-prop:12 | Esfera, marca e aro giram por controle |
| Braseiro / E | bf4-prop:15 | Chama estilizada anima e PointLight ilumina |

Os 18 conjuntos não foram reposicionados. Objetos novos usam âncoras do catálogo
BF-4D. Centros X/Z das âncoras: mesa/luz (-4.5,-2), poltrona (-15.4,-4.6),
armário (13.7,3.4), planta (-11.7,3.4), livro (15.4,-4.8), relógio (-17,-6.8),
globo (-14.9,7.1), braseiro (15.3,6.9), estante (-3,-7.2). Offsets locais das
peças são explícitos na fábrica; a almofada fica à esquerda da ilha, livro à
esquerda da mesa e globo à direita. Box3 verifica interiores e circulação BF-4D.
Não há editor de layout. IDs ambientais não derivam de posição ou geometria.

Recursos são procedurais originais. Peças móveis selecionadas ficam fora dos
batches estáticos; geometrias e materiais continuam pertencendo ao edifício,
com deduplicação no descarte. Sem alteração de assets ou licenças externas.

## Atmosferas e descoberta reproduzível

Tranquila mantém iluminação quente. Noturna reduz HemisphereLight de 2 para
0,65 e DirectionalLight de 1,5 para 0,4, preservando fontes locais controláveis.
Encantada usa ambiente 1,25, flores e brilhos nas dez âncoras. Estados dos objetos
não são apagados pela troca de atmosfera. São duas PointLights sem sombras.

1. Em A, acender **Luminária do pergaminho**: inscrição visível, progresso 1/4.
2. Examinar **Pergaminho da luz**: pista do Livro da estrela em C, progresso 2/4.
3. Em C, abrir **Livro da estrela**: capa abre, gaveta de E desliza e atmosfera
   encantada é ativada, progresso 3/4.
4. Em E, examinar **Armário da memória** aberto: relíquia e bilhete fictício,
   progresso 4/4. Se fechado, reabrir pelo mesmo controle.

Abrir o livro antes da pista não quebra o fluxo: fechar e abrir após a pista
aciona o mecanismo. Reexaminar não duplica o evento de descoberta. Recarregar a
rota inicia nova sessão determinística. Nenhum registro pessoal participa.

## Seleção e BF-4F

Picking ambiental usa o mesmo owner de gestos e seleção. Livros/estantes e
registros preservam prioridade de raycast; objetos ambientais não possuem
entryId e não abrem registros. React permite ações sem precisão no canvas.
Não há gesto especial de arraste; globo gira por botão. Eventos e ações podem
ser consumidos futuramente pela BF-4F, sem implementar habitantes agora.

## Gates e métricas

Gates consolidados abaixo; resultados intermediários são preservados separadamente.
Primeiro gate: 650 testes/82 arquivos PASS; áudio, build e APK debug PASS.
Lint identificou tipagem frouxa em mocks/teste Three, corrigida sem casts cegos
ou desativação de regra. Contagens E2E ambientais aumentaram em dez, sem remover
assertivas de registros ou gestos.

Primeira execução E2E: timeout da coleção cheia em 1280px no cenário de #11;
390px passou. Teste novo do segredo falhou por rótulo antigo no worker enquanto
build/teste eram atualizados. Essa rodada não é evidência final consolidada.
Não atribuir automaticamente o timeout de densidade à mesma causa histórica.

Build observado: inicial 644.858 bytes, Three dinâmico 676.309 bytes. Aviso de
chunks >500 kB permanece. Diagnóstico headless vazio observado: 94 meshes,
94 chamadas, 23.652 triângulos, 41 geometrias, uma textura e ~76,7 ms/frame
pontuais (13 FPS em renderização de software). Não são métricas Moto G06.
Na coleção cheia (70+13), foram observadas 357 malhas, 229–235 geometrias,
53–112 chamadas e 22.156–23.620 triângulos, dependendo da câmera/culling.
Leituras pontuais em software: 76,7–191,6 ms/frame. Bundles cresceram
6.369 bytes iniciais e 6.922 bytes Three em relação ao relatório BF-4D.
Brilhos compartilham recursos; máximo de dez grupos articulados e 30 brilhos,
sem loops independentes de renderização.

## Limitações e inspeção física

- Flores não expiram automaticamente: reversão explícita ou mudança da atmosfera.
- Áudio e haptics ambientais não incluídos; infraestrutura convencional preservada.
- Nenhuma aprovação de aparência, intensidade percebida, foco, ergonomia ou FPS.
- Efeitos pequenos precisam de inspeção com zoom; evitar confundir screenshot
  headless com prova de legibilidade no telefone.
- #4, #11, R-19 e TalkBack permanecem abertos.

No Moto G06, instalar manualmente o APK debug gerado; verificar coleção vazia
e coleção fictícia de 70 livros/13 registros. Explorar os cinco cômodos, todas
as ações, capa/página, gaveta/relíquia, luz em três intensidades, três atmosferas
e sequência acima. Alternar seleção React/canvas, abrir registros dos seis
tipos, testar overflow, pan/pinch/zoom, retrato/paisagem, background/retorno e
nova sessão. Conferir redução de movimento, tamanho de texto e TalkBack, sem
inferir aprovação de testes automatizados. Registrar SHA/APK e resultados.

A revisão identificou submissões de render síncronas redundantes por evento de
input enquanto o RAF já estava ativo. O runtime agora apresenta essas mudanças
no próximo frame do loop existente; seleção e diagnóstico de gesto continuam
síncronos. Teste de integração verifica isso, pause/resume e callbacks tardios
após perda de contexto com a coleção cheia. Não é prova de causa histórica de #11.

## Registro das rodadas intermediárias

Antes da consolidação final, a segunda rodada teve 19/24 PASS e cinco timeouts:
coleção cheia 1280/390, dez ciclos do shell, retornos da Biblioteca e edição dos
seis tipos. Somente os cenários 1280 e dez ciclos correspondem às dívidas
preexistentes #11/#4; os demais foram tratados como falhas adicionais, sem
alegar causa comum. Logs/traces temporários foram preservados fora do Git.
A suíte ocorreu enquanto verificações de CPU também estavam em execução;
interferência é hipótese, não causa comprovada. Os três novos testes BF-4E
passaram nessa rodada: segredo com WebGL, segredo no fallback e tap ambiental.

Após revisão: render de input é apresentado pelo RAF ativo, sem submissão
síncrona redundante; 651 testes/82 arquivos passaram. A rodada seguinte usa
build estabilizado e comandos sequenciais, sem enfraquecer os testes.

APK final gerado, sem instalação automática: `android/app/build/outputs/apk/debug/app-debug.apk`.
SHA-256: `0ed8c757a7f4332d9b458c1fd331f5d764ff6a166b69da0da1e19ceabf9dab35`.
O binário, logs, caches e traces não são versionados.

## Gate sequencial consolidado

A rodada completa estabilizada terminou **22/24 E2E PASS**. Permaneceram:

- `bf4-environment.spec.ts:94`, coleção cheia 1280px: timeout de 30s (cenário #11).
- `r4-shell.spec.ts:384`, dez ciclos de rota: timeout de 30s (cenário #4).

390px, seis tipos com edição/retorno, overflow, retornos de rota, pan/pinch/zoom,
orientação, segredo com/sem WebGL e tap ambiental passaram. Nenhum skip,
retry adicional ou aumento de timeout foi introduzido. Isso não demonstra
causa única dos timeouts históricos nem exclui impacto do novo conteúdo.
A evidência corresponde ao código desta branch sobre `74a3de1`; logs locais
`/tmp/bf4e-e2e-serial.log` e traces preservados em `/tmp/bf4e-serial-e2e-results`.

A última correção mantém a caixa de destaque acompanhando os bounds articulados
sem alocar/dispor helpers por frame. Somente seleção ambiental usa essa
atualização. Regressão dirigida e build final são registrados na entrega remota.

Após a correção de destaque: formato/lint PASS, 54 testes dirigidos PASS,
build/TypeScript e Android debug PASS. A suíte integral anterior aprovou
651 testes/82 arquivos. Raiz ambiental medida isoladamente: 68 meshes
(inclui 30 brilhos e peças adotadas), 8 materiais, 6 geometrias e 2 luzes.
Não confundir contagem estrutural com draw calls ou animações simultâneas.

Os três E2E ambientais passaram novamente no build final: segredo no mundo,
segredo sem WebGL e tap ambiental com redução de movimento (**3/3 PASS**).
A entrega permanece candidata, com E2E global 22/24 e ressalvas #4/#11.

## Correção dirigida de experiência — candidata à revalidação física (2026-11-02)

**Motivo:** após instalar o APK inicial, o usuário relatou que a interação parecia artificial: tocar no objeto exigia procurar botões React distantes e a troca manual de atmosfera não combinava com um mundo vivo. O gate de UX daquela versão não passou. A correção solicitada foi autorizada para implementação remota na branch BF-4E, **sem merge**.

**Mudanças nesta correção:** toques elegíveis no canvas despacham a ação primária da família diretamente, inclusive ao tocar novamente o mesmo objeto. Seleção programática não executa ações, não rouba os controles BF-2/BF-3 e continua sem `entryId` ambiental. Picking ambiental prefere o prop apenas quando realmente está à frente de um registro/estante; em empate preserva o registro. A sequência inteira do Segredo do Pergaminho pode ser operada por quatro ações primárias no mundo: luminária → pergaminho → livro decorativo → armário aberto.

**Atmosfera:** estado-base calculado **offline pela hora local do aparelho** (06:00–17:59 tranquila; 18:00–05:59 noturna), sem acesso a geolocalização ou registros pessoais. Exame de leitura/estudo favorece clima tranquilo por 5 minutos; descoberta ativa clima encantado por 2 minutos, com prioridade especial > estudo > relógio. Transições de estado são recalculadas em montagem, retorno visível e tick único de 60 segundos por host, **nunca por frame**. Animações e luzes usam o RAF vigente. O progresso da descoberta não expira com a atmosfera.

**UI:** a cena 3D passa a ser a superfície principal. A lista de ações React fica recolhida sob `Explorar objetos sem o canvas`; abre automaticamente quando o runtime está em falha. Uma faixa de feedback breve próxima ao canvas comunica reações e pistas, sem capturar gestos; os controles React continuam disponíveis como alternativa de acessibilidade e fallback. Os três botões manuais de atmosfera foram retirados.

**Testes acrescentados/ajustados:** ações primárias de dez famílias, regras de dia/noite/atividade/descoberta e sequência completa por toques na lógica, atualização dos E2E de fallback e prova de dois toques na luminária pelo canvas. **São critérios/testes implementados, não afirmação de execução bem-sucedida:** registrar resultados após CI da nova commit, com falhas diferenciadas de #4/#11.

**Limites:** não há inferência de atividade externa ao aplicativo, leitura de comportamento pessoal ou uso de rede. O gesto principal é toque curto; ações secundárias como intensidade e exame detalhado permanecem na alternativa textual. Gate humano do novo APK, compatibilidade de picking das dez famílias no mundo, TalkBack, desempenho sustentado e o fechamento BF-4E continuam pendentes.
