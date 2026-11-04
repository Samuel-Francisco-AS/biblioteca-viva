# BF-5R4 — Reconstrução integral de experiência (candidata)

Data: 2026-11-03. Branch `feat/bf-5-uiux-global-rework`. Base: `75b85b0a8c3fda7931f994b7852b2613215a6624`. Checkout inicial limpo; fetch e fast-forward confirmaram igualdade com origin. PR #20 confirmada aberta, draft, base main pelo conector GitHub (gh local retornou 401).

## Diagnóstico reproduzido

Em Chromium 390×844, o canvas mede exatamente (0,0,390,844); `elementFromPoint(195,500)` retorna o canvas. A área verde entre/depois dos cinco pisos pertence ao fundo uniforme da cena, não a uma divisão HTML. A captura anterior está preservada em `artifacts/bf5r4/before-r3.png` como evidência de trabalho. A R3 abre com zoom 2 nessa proporção e recorta a construção, sem compor um exterior.

Há ainda um problema de profundidade: ao afastar para zoom 1 em retrato, o piso contínuo na parte inferior fica atrás da câmera original. O teste `sanctuaryCamera.test.ts` reproduz isso por ray/plane: a interseção inferior fica atrás da origem do raio. **Isso não ocorre necessariamente no zoom 2 de abertura da R3**; o diagnóstico distingue o vazio geométrico da abertura e o clipping durante exploração. A primeira tentativa de teste com zoom 2 refutou essa hipótese específica e foi corrigida para o caso reproduzível, sem remover o assert.

A solução remove `openingComposedWorldZoom`, mantém zoom inicial 1 e recua a câmera composta dez vezes ao longo do mesmo eixo, com far=1000. A distância não altera a escala ortográfica nem as transformações X/Z. Um pátio circular real, com base de pedra, anéis de latão, marcações e lanternas, compõe o exterior. É cenografia descartável, sem cômodos, seleções ou persistência novos. Seu ownership pertence ao edifício e seu descarte continua no caminho existente. O renderer, DPR e coordenadas de picking permanecem os mesmos. Não há máscara inferior nem aumento de zoom para ocultar o perímetro.

## Arraste

O pan contínuo funcionou na reprodução desktop (targetX 0 → -4,892); **a regressão física inteira não foi reproduzida**. Foi encontrada uma causa concreta de ausência de resposta em arrastes curtos: a transição tap→pan descartava todo o primeiro movimento, mesmo se fosse muito maior que 8px. Agora consome apenas o limiar e aplica imediatamente o restante. A elegibilidade de tap continua monotônica; pinch→pan, cancelamento, resize e picking mantêm suas regressões. O teste de continuidade após pinch foi ajustado para arrastar para dentro dos bounds, pois o delta adicional agora pode atingir a borda antes.

## Direção e inventário efetivamente alterado

- Biblioteca `/`: composição ambiental, profundidade de câmera, arraste e materiais compartilhados da HUD, diálogo, escolhas e dock.
- Coleção `/colecao`: fichas com gravuras SVG originais dos seis tipos, composição de índice, filtros e superfície de seleção.
- Arquivo `/arquivo`: folhas de manuscrito claras para notas/citações, tinta e hierarquia editorial; busca/edição preservadas.
- Resumo `/estatisticas`: instrumentos quantitativos em azul mineral, métricas reais e divisões de observatório; sem números fictícios.
- Ajustes `/configuracoes`: trilhos de instrumentos, preferências e controles/backup com o mesmo sistema funcional.
- Criação `/novo-registro`, edição `/registros/:id/editar` e detalhes `/registros/:id`: nova escrita em papel, fichas/gravuras e seções; erros de salvamento de edição deixam de desmontar o formulário.
- Links legados `/novo-livro`, `/livros/:id`, `/livros/:id/editar` mantêm os redirects.
- Notas, citações, progresso, etiquetas, favoritos, sessões, confirmações, vazios, carregamentos, diário e backup recebem os componentes visuais globais; **não foram reescritos seus motores nem toda sua estrutura JSX**.

A reforma estrutural concentra-se nos editores, gravuras e composição do mundo. As outras áreas reutilizam seus fluxos funcionais com novas superfícies e hierarquias; não alegar reconstrução estrutural integral de cada componente do aplicativo.

## Arquitetura dos seis formulários

`RitualFields` fornece inscrições e capítulos sem estado de domínio. Blocos específicos são compartilhados entre criar/editar para carregar os atributos existentes. `BookForm` mantém conversão tipada e validação próprias.

| Categoria | Composição nova | Dados contextuais preservados |
| --- | --- | --- |
| Livro | Folha de rosto; marcador com página atual/total e estado | Impressões/avaliação e data em seção própria; progresso/status editados na ficha |
| Filme | Identidade da obra; direção e ano em dupla editorial | Duração e plataforma em referências opcionais |
| Série | Nome; fio narrativo e contagem total junto à plataforma | Progresso por episódios permanece na ficha/sessão |
| Estudos | Pergunta inicial com área/disciplina; percurso com objetivo e unidade/meta | Prazo em referências; unidade existente preservada na edição |
| Atividade física | Nome da prática; capítulo de modalidade, categoria e objetivo | Categoria existente preservada; acompanhamento permanece nas sessões |
| Trabalho | Intenção e descrição; próximo passo como escrita destacada | Área, organização e prazo em referências |

Campos obrigatórios explícitos; dados opcionais seguem no DOM dos disclosures e são enviados mesmo recolhidos. Trocar de categoria desmonta os campos e não envia valores incompatíveis. Sem migração, mudança de schema, backup ou atributos do domínio. Nenhuma dependência adicionada.

## Movimento, navegação e limites

Chegada única de 140ms em opacidade/transform, sem stagger nas fichas nem sigilo em loop; foco e toque mantêm resposta imediata. Papel/controles têm estados de foco, pressão, erro, desabilitado e salvamento. Movimento reduzido e alto contraste têm regras explícitas. O dock fica ausente durante todo o editor, mantendo retorno/cancelamento; a tentativa intermediária de ocultá-lo somente com foco foi rejeitada pelo E2E porque o reaparecimento podia interceptar o toque de salvar. Layout duplo vira coluna em telas muito estreitas, safe areas e espaço do dock continuam vigentes.

**O WorldHost continua montando/desmontando ao trocar de rota.** Não foi introduzido cache de WebGL nem alterado lifecycle sem prova adequada de pausa, atualização de dados e Back. Medições exploratórias desktop concorrentes estão em `artifacts/bf5r4/navigation.json`; incluem automação e carga concorrente, não servem como benchmark nem comprovam a causa da lentidão física. Assim, a eliminação definitiva dos engasgos e a preservação completa de câmera entre abas continuam pendentes; não declarar este requisito resolvido.

## Testes e artefatos

Resultados finais e APK serão registrados abaixo após a execução. Capturas em `artifacts/bf5r4/` usam apenas ambiente vazio e conteúdo fictício. As gravuras em `ArtifactGlyph.tsx` e `RealmIntro.tsx` são vetores locais originais desta intervenção; sem arquivos externos/licenças adicionais.

## Roteiro Moto G06

1. Instalar o APK debug sobre a instalação de desenvolvimento, preservando seus dados; exportar backup antes, sem limpar/restaurar armazenamento.
2. Abrir Biblioteca sem zoom: observar pátio real até o rodapé. Explorar todas as salas com arraste curto/longo, pinch, pinch→um dedo; selecionar habitantes e registros nos pontos visuais.
3. Afastar ao mínimo, girar retrato/paisagem, voltar de cada aba e retomar após segundo plano. Registrar separadamente resets de câmera, pauses, alinhamento de toque e qualquer linha artificial.
4. Criar e editar fixtures dos seis tipos; abrir referências opcionais, cancelar, trocar categoria, provocar validações, recuperar de falha e salvar. Conferir números/datas antigos e dados opcionais após reabrir.
5. Testar teclado aberto, texto grande, foco, alto contraste, redução de movimento e Back nos formulários, diálogo e diário. Conferir dock/safe areas em paisagem.
6. Usar sessões/cronômetro, notas/citações, progresso, etiquetas/favoritos, busca/filtros e Resumo. Exportar/validar um backup fictício; restaurar somente em instalação descartável.
7. Avaliar arte e ergonomia com capturas/vídeo reais. Não há PASS físico, TalkBack aprovado, desempenho sustentado, aceite artístico, release, merge ou fechamento BF-5 nesta intervenção.

O detalhe de livro (`BookDetailPage`), separado do detalhe genérico, recebeu a mesma gravura, hero e organização de seções após o E2E revelar essa lacuna. Seus 26 testes passaram. A edição de prazo preserva o timestamp anterior se o dia não foi alterado; teste de recuperação de falha cobre essa precisão.

## Gate técnico registrado

- `npm run format:check`: PASS na fonte final.
- `npm run lint`: PASS, sem warnings na rodada final (o warning intermediário de fast refresh foi resolvido separando `ritualCopy`).
- `npm run typecheck`: PASS após corrigir duas opções `exact` indevidas em `getByRole` no novo teste Testing Library. A falha de compilação intermediária não era PASS; os APKs anteriores foram substituídos pelo build validado.
- `npm run test:run`: rodada ampla com 711 PASS / 1 FAIL (92 arquivos). FAIL: timeout de 5000ms em `inhabitantAgency` / “enacts autonomous encounters, six mutable pairs, conflict, cooperation and cosmetic repair without collisions”. Nome já presente no relatório BF-5; causa idêntica não demonstrada. A rodada ampla anterior teve três expectativas de câmera/pan incompatíveis com o comportamento novo, corrigidas preservando asserts.
- Rodada dirigida final de editores/runtime/projeção: 75 PASS em 7 arquivos; detalhe de livro após integração: 26 PASS. O teste novo de recuperação de edição/prazo está incluído nos 75. Sem repetição da suíte ampla após alterações locais dirigidas.
- `npm run audio:check`: PASS (dois WAV locais verificados).
- `npm run build`: PASS via build Android final, com aviso existente de chunks >500kB; aviso não suprimido.
- `npm run performance:report`: PASS. Entrada JS 729.225 bytes; chunk dinâmico ThreeWorldRuntime 731.372 bytes. Relatório de bundle, não performance física.
- `npm run android:sync`: PASS dentro do script Android final.
- `npm run android:build:debug`: PASS / `BUILD SUCCESSFUL in 2s`, 184 tasks, 27 executadas / 157 up-to-date.
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`; SHA-256 `76a84a9e1808e65e77c9957a34347008ecb74670688e6049d061e4280c386054`. Debug, sem publicação/assinatura de release.
- `git diff --check`: PASS antes do fechamento do registro.

E2E amplo e regressão final dirigida: resultado acrescentado após o término. Não há alegação de CI verde.

## E2E amplo — resultado preservado

`npm run test:e2e`: **9 PASS / 31 FAIL, 40 testes, 15,8 minutos**. Esta execução atravessou a triagem e correções dirigidas; não atesta uma suíte verde da fonte final. Nenhum teste foi removido ou desabilitado. Resultados por nome:

- FAIL: e2e/bf4-environment.spec.ts:6:1 › BF-4D: ambiente integrado em paisagem/retrato, zoom, pan e seleção
- FAIL: e2e/bf4-environment.spec.ts:94:3 › BF-4D: coleção cheia explora cinco cômodos e quatro conexões em 1280px
- FAIL: e2e/bf4-environment.spec.ts:94:3 › BF-4D: coleção cheia explora cinco cômodos e quatro conexões em 390px
- FAIL: e2e/bf4-inhabitants.spec.ts:7:3 › BF-4F1 four inhabitants world
- FAIL: e2e/bf4-inhabitants.spec.ts:7:3 › BF-4F1 four inhabitants fallback
- FAIL: e2e/bf4-inhabitants.spec.ts:42:1 › BF-4F1 canvas selects all four loaded models
- FAIL: e2e/bf4-inhabitants.spec.ts:68:3 › BF-4F2 samael: directed actions in the five-room world
- FAIL: e2e/bf4-inhabitants.spec.ts:68:3 › BF-4F2 aryn: directed actions in the five-room world
- FAIL: e2e/bf4-inhabitants.spec.ts:68:3 › BF-4F2 ytha: directed actions in the five-room world
- FAIL: e2e/bf4-inhabitants.spec.ts:68:3 › BF-4F2 lua: directed actions in the five-room world
- FAIL: e2e/bf4-inhabitants.spec.ts:111:1 › BF-4F3 spontaneous life and honest reduced-motion semantics
- FAIL: e2e/bf4-living.spec.ts:6:3 › BF-4E: segredo completo no mundo
- FAIL: e2e/bf4-living.spec.ts:69:1 › BF-4E: tocar a luminária executa e repete ação sem botões React
- FAIL: e2e/bf4-rpg.spec.ts:8:3 › BF-4F4 RPG choices, objective, resume and conclusion from canvas
- FAIL: e2e/bf4-rpg.spec.ts:8:3 › BF-4F4 RPG choices, objective, resume and conclusion without WebGL
- FAIL: e2e/bf5-ritual.spec.ts:3:1 › BF-5R3: a coleção usa fichas de acervo e detalhes ergonômicos
- FAIL: e2e/bf5-touch-transition.spec.ts:3:1 › BF-5R2: canvas intact, route entrance without blur and tactile response
- FAIL: e2e/bf5-ui.spec.ts:3:1 › BF-5: five realms, density and narrative Back in the semantic fallback
- FAIL: e2e/bf5r4-experience.spec.ts:3:1 › BF-5R4: seis rituais criam, reabrem e editam sem perder referências
- FAIL: e2e/critical-flow.spec.ts:3:1 › ciclo principal persiste livro, edição, anotações e conclusão
- FAIL: e2e/p1-memory.spec.ts:3:1 › tag, favorito, sessão persistente e estatísticas formam memória unificada
- FAIL: e2e/r4-shell.spec.ts:54:1 › shell abre a Biblioteca com uma única superfície Three.js
- FAIL: e2e/r4-shell.spec.ts:114:1 › interação desktop conecta picking, pan, zoom e seleção React
- FAIL: e2e/r4-shell.spec.ts:201:1 › viewport mobile mantém tap, pan, pinch sintético e alternativa React
- FAIL: e2e/r4-shell.spec.ts:313:1 › Biblioteca preserva a mesma superfície em portrait, landscape e viewport estreito
- FAIL: e2e/r4-shell.spec.ts:384:1 › dez ciclos de rota não acumulam canvases, loops ou interação
- FAIL: e2e/r4-shell.spec.ts:446:1 › dock navega pelas áreas convencionais
- FAIL: e2e/reading-area.spec.ts:41:1 › livros convencionais preservam identidade entre lista, runtime, seleção e retorno
- FAIL: e2e/reading-area.spec.ts:158:1 › retornos da Biblioteca removem o canvas anterior e reconstruem um único snapshot
- FAIL: e2e/reading-area.spec.ts:185:1 › seis tipos abrem pela Biblioteca e preservam edição e retorno
- FAIL: e2e/search-and-backup.spec.ts:48:1 › backup web real é baixado, validado, restaurado e persiste

Coincidências com o último baseline BF-4G: coleção cheia 1280px, ação de Samael e dez ciclos de shell. Os demais 28 FAIL são adicionais em relação àquela lista de três, embora vários nomes apareçam em rodadas históricas mais antigas. Não atribuir a mesma causa sem prova. Entre os adicionais: a regra antiga de posicionamento do dock em desktop produzia destinos fora da viewport; o novo editor tinha reaparecimento do dock ao perder foco; o detalhe de livro não possuía a nova composição; o teste de transição exigia o identificador anterior. Essas causas receberam correções e uma rodada dirigida, sem repetir a suíte ampla. Falhas de WebGL, vida/narrativa, retornos e backup continuam sem conclusão global.

A geometria do dock agora tem um único posicionamento por insets, largura máxima e margens automáticas; não herda o translateX(-50%) da regra desktop anterior. Há E2E próprio para os cinco destinos em 1280 e 390px.

## Regressão E2E após correções

Rodada dirigida: **7 PASS / 1 FAIL em 1,2 minuto**. Passaram: fichas Coleção/detalhe, criar/reabrir/editar seis tipos, arraste retrato/paisagem, dock 1280/390, ciclo principal de livro/edição/notas/citações/conclusão, rotas ausentes e memória unificada (etiqueta, favorito, sessão persistente e estatísticas). O único FAIL exigia Busca numa coleção vazia. A fixture passou a semear um livro fictício, preservando os asserts de geometria, ausência de blur, toque e overflow: **reexecução isolada 1 PASS em 12,8s**. Não é uma nova suíte global verde.

A edição de estudos por horas recebeu conversão explícita de apresentação (minutos existentes → horas no campo → minutos ao salvar), conservando o valor anterior quando não alterado e permitindo frações de hora. Regressão final específica: **1 PASS**, cobrindo 180 minutos exibidos como 3 horas, recuperação após falha e preservação exata de prazo. Sem mudança de persistência/schema.
