# BF-5.6D — Biblioteca de Pacotes e Acervo Oficial Expansível

- Data: **09/11/2026**. Candidata autorizada expressamente pelo proprietário, em execução contínua **D1 → D2 → D3**, com uma única PR draft contra main; sem merge, release, fechamento da BF-5.6 ou implementação E–G.
- Base sincronizada: `ab742f8`. Checkout inicialmente limpo; branch `feat/bf-5-6d-arcanario-pacotes-oficiais`, criada diretamente de `origin/main`.
- PRs [#43](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/43), [#44](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/44) e [#45](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/45) confirmadas como integradas, tanto pela API quanto pelo histórico remoto (`0e1d9e9`, `69a474b`, `782d17c`).
- **Dexie v18 aditivo; backup v10; importação v6/v7/v8/v9; limite 10 MiB mantido.** Versão do aplicativo permanece `0.2.0-alpha.1`. Sem downgrade suportado.
- O [gate parcial A+B+C](BF-5_6ABC_GATE_PARCIAL_REPAROS_2026-11-09.md) continua válido, com revalidação física de etiquetas/contraste pendente. E2E desses reparos agora foi executado e passou; isso não é novo aceite Android.

## Entrega e checkpoints

| Checkpoint | Commit | Resultado |
| --- | --- | --- |
| D1 | `1f16170` | Contratos, validação, persistência transacional, identidade, revisões, retenção e backup privado |
| D2 | `3a43319` | Biblioteca de Provas, importação, lotes, gestão, filtros, navegação e evidências |
| D3 | `d0fe166` | Verificação editorial, volume, regressões, contratos finais, documentação e candidata Android |

Commit documental posterior registra o SHA de produção, APK, resultados finais e PR, sem mudar código produtivo. Não houve PR ou pedido de autorização entre checkpoints.

## Modelo e fronteiras

`domain/packManifest.ts` define manifesto/registro de instalação; `domain/educationalPacks.ts` define identidade, lote, disponibilidade e elegibilidade. O antigo contrato reservado `cardPackManifestSchema` da A passa a apontar para o manifesto executável v1, sem dois formatos operacionais concorrentes. `EducationalPacksService` coordena portas e transação. `JsonEducationalPackCodec`, `DexiePackStore` e `LocalPackCatalogue` implementam as fronteiras externas. React usa aplicação; não acessa Dexie. O motor de seleção/correção/diagnóstico continua sendo o da C.

Dexie v18 acrescenta somente `educationalPacks: &id,status` às tabelas v17. Guarda manifesto, status, lotes efetivamente instalados, hashes, contagens, proveniência declarada, identidade/revisão/fingerprint dos itens e data. Cartas/revisões permanecem nas tabelas globais. Upgrade é aditivo/transacional e não reescreve dados pessoais; testes cobrem v17 e upgrades dos baselines anteriores. Os seis tipos de registro são preservados.

Não há conta, backend, banco remoto, sincronização, analytics, rede automática, TCG, arena ou novo renderer. ThreeWorldRuntime/WorldHost não foram alterados.

## Formato de pacote e integridade

Envelope JSON UTF-8 `kind: biblioteca-viva-educational-pack`, `formatVersion: 1`, `manifest` e `files`. `files` associa nomes simples `.json` ao **texto exato** de cada lote, sem paths relativos, diretórios ou arquivos arbitrários. O manifesto v1 inclui identidade estável, versão editorial numérica, nome/descrição, instituição, categoria, exame/ano/aplicação/caderno/idioma, áreas, fontes HTTPS, fundamento/direitos, verificação e histórico editorial, contagens e completude, lista de lotes com tamanho/hash/quantidade.

- SHA-256 de lote = bytes UTF-8 exatos de seu texto, sem normalização, BOM ou newline acrescentado implicitamente. O manifesto não participa do próprio hash, evitando circularidade.
- Fingerprint de conteúdo de questão = JSON com chaves de objetos ordenadas lexicograficamente por unidades UTF-16, arrays na ordem original e strings JSON; campos `undefined` omitidos. É usado para auditar conteúdo persistido.
- Arquivos embarcados têm, adicionalmente, hash do **envelope integral** fixado fora dele em `contentHashes.json`. `npm run packs:check` confere esses valores e os lotes. Após editar conteúdo: formatar, revisar edição, executar `node scripts/check-educational-catalogue.mjs --write` e rever o diff.
- Um checksum autodeclarado comprova consistência de bytes frente ao manifesto recebido; **não autentica instituição, gabarito ou licença**. Arquivos externos são apresentados como autodeclarados. O selo visual não representa assinatura criptográfica de banca.

Limites: envelope 10 MiB, lote 4 MiB e 2.000 entradas de revisão, até 100 lotes e 10.000 identidades por pacote. Enunciado até 16.000 caracteres, duas a cinco alternativas de até 4.000, comentário até 16.000. Nesta versão somente texto: nenhum SVG, executável, script de efeito, mídia remota ativa ou HTML executável. Strings são renderizadas como texto React; campos/arquivos desconhecidos e URLs não HTTPS são rejeitados.

Validação externa confere schema/versão, direitos declarados, hashes/tamanhos, contagens, duplicatas, sequência de revisões, referências e taxonomia antes da escrita. Na transação, ownership, colisões com dados locais, edição conhecida e revisões imutáveis são rechecados; conflito/falha aborta o conjunto, incluindo classificações e registro de instalação. Testes injetam falha após iniciar gravação e após limpar o destino de restore.

## Identidade, lotes e correção

ID global é `exam:` mais a tupla JSON `[exame, ano, aplicação, caderno, idioma, número original]`. O mesmo arquivo reinstalado recupera o mesmo ID. Número igual em outra variante/aplicação/idioma não implica identidade igual. `canonicalId`/`equivalentTo` opcionais precisam constar explicitamente na identidade e nos metadados editoriais correspondentes; não provocam fusão automática. **Nenhuma equivalência ENEM/CNU foi inferida ou distribuída.**

O manifesto conhecido pode anunciar mais lotes do que os efetivamente instalados. Incremento envia apenas lotes novos/alterados; lotes com mesmos bytes e revisões são preservados. Duplicata não cria cartas nem respostas. Não se admite downgrade editorial nem substituição diferente com a mesma edição. Lote atualizado não pode retirar silenciosamente identidades anteriores.

Correção exige nova revisão sequencial e fonte de retificação. O lote corrigido inclui a cadeia editorial necessária, permitindo reinstalação em base vazia/restaurada. Revisões antigas nunca são sobrescritas. Gabarito/ordem/conteúdo/taxonomia da sessão continuam fixados; atualização só afeta novas seleções. Editores e comandos autorais recusam itens de pacote; classificações editoriais do namespace `pack:` também são protegidas.

Questões `annulled`, `no-valid-key` ou com gabarito preliminar ficam fora de novas Provações. Questão anulada/sem chave não possui alternativa correta artificial. Sessões anteriores conservam a revisão válida utilizada originalmente, sem transformar retroativamente seus resultados. Explicações independentes exigem autoria editorial `Arcanário`; não são atribuídas ao Inep ou à banca.

## Operações, remoção e recuperação

Instalar, consultar estado, adicionar lote, detectar edição conhecida, atualizar, repetir, remover, reinstalar e consultar integridade são operações reais. O catálogo distingue referência indisponível, disponível, parcialmente instalado, instalado, atualização conhecida, removido, restauração necessária, incompatibilidade, inválido, operação em andamento e erro recuperável.

Remover muda disponibilidade: itens saem do Acervo ativo e de novas seleções. **Não apaga cartas/revisões, sessões, respostas, estatísticas, resultados ou vínculos pessoais.** Nesta candidata todas as revisões locais do pacote são deliberadamente retidas, inclusive as ainda não referenciadas. Portanto desinstalar não promete liberar seus bytes. Essa política evita coleta destrutiva; uma eventual liberação física seletiva exige decisão futura, sem apagar história. Detalhes de questão indisponível explicam a situação; sessões continuam legíveis.

Operação interrompida antes do commit reverte integralmente; após commit o estado completo já está disponível ao reabrir. Tentar novamente é a recuperação idempotente. Não há lock persistente “instalando” que sobreviva incorretamente ao encerramento. Corrupção local pode ser diagnosticada; o instalador recusa sobrescrever revisão histórica divergente. Não existe reparo destrutivo automático: preservar backup e investigar/recuperar em base descartável.

## Backup e restauração

Backup privado v10 conserva autorais, classificações/etiquetas, decks, vínculos, sessões/respostas/resultados, cadeia de revisões necessária e registros de pacotes. Cartas de pacote sem referência pessoal são excluídas da projeção exportada. Um item citado por sessão ou deck estático pessoal conserva uma única cadeia contígua de versões, compartilhada pelas referências; não é duplicado por tentativa. Taxonomia e proveniência permanecem interpretáveis.

Registros de pacotes ativos são exportados/restaurados como `restore-required`; removidos continuam removidos. Sem pacotes, história e diagnóstico funcionam; disponibilidade para novas sessões requer reinstalação. Arquivos públicos/cache não integram o backup privado. Depois de reinstalar, as identidades e respostas permanecem coerentes.

Importa originais **v6, v7, v8 e v9**, conferindo checksum antes da transformação, mantendo replace protegido, backup de segurança e rollback. V10 é validado estritamente e não supõe downgrade. O teto continua **10 MiB**: excesso falha explicitamente sem truncar história ou limpar imagens. Cadeias pessoais extensas podem atingir esse limite; isso é informado, não resolvido pela exclusão de dados.

## Interface e offline

Rota `/arcanario/pacotes`, com entradas no Portal e nas Provações. Volumes em pergaminho, lombada violeta, selos e dourado, texto escuro e controles React acessíveis; nenhuma seleção nativa de moldura/taxonomia foi reintroduzida. Pacotes se abrem no Acervo por coleção e nas Provações com critério fixado para o pacote, combinável com conhecimentos, prova/ano/origem e histórico.

Acervo tem 24 cartas por página e filtros por coleção, prova, ano, origem e conhecimento. Busca/seleção não recarrega mídia. Portal consulta resumo, sem carregar enunciados e arrays de versões. Disponibilidade usa conjunto de IDs por seleção e filtros do Acervo são memoizados; sem novo runtime permanente ou filtro caro a cada render incidental.

No APK os arquivos são assets locais carregados sob demanda. Na web, após o primeiro carregamento do conteúdo, CacheStorage opcional guarda somente os dois envelopes públicos, com pins verificados, permitindo reinstalação offline após reload. Cache pode ser recusado/removido pelo navegador; nesse caso o arquivo local continua sendo alternativa e o erro é explícito. A D não introduz service worker nem promete iniciar uma página web nunca carregada sem rede. Conteúdo já instalado e história são locais.

Importação usa input de arquivo JSON/seletor de documentos, com limite conferido antes de ler e prévia validada antes da confirmação. Esse fluxo é distinto dos antigos pickers de opções que tiveram problemas no Moto G06. Não há upload ou busca de catálogo remoto.

O catálogo informa bytes dos arquivos/lotes registrados. Consulta de integridade informa revisões ausentes/divergentes, revisões retidas e bytes lógicos do conteúdo. Isso **não** mede overhead físico do IndexedDB, heap, assets do APK ou cache público; não é promessa de liberação de armazenamento após remover.

## Conteúdo incluído e completude

| Coleção distribuída | Lote | Questões novas | Publicadas na edição | Previstas na coleção | Estado |
| --- | --- | ---: | ---: | ---: | --- |
| Aritmética dos pequenos arquivos, edição 1 | lote-1 | 2 | 2 | 10 | parcial, autoral |
| Mesma coleção, edição 2 | lote-2 | 2 | 4 | 10 | parcial, autoral |
| ENEM 2024, regular, D2, caderno 5 amarelo, Matemática | nenhum | **0** | **0** | 45 de Matemática na origem | somente referência |
| CPNU 2024, Bloco 8, tarde, gabarito 1, Matemática | nenhum | **0** | **0** | 15 de Matemática na origem | somente referência |

Os dez itens da demonstração são expectativa editorial explicitamente parcial, não prova oficial nem promessa de edição completa produzida. Há somente **quatro questões originais reais no pacote distribuído**, sem imagens de terceiros: soma 12+8 (C), dois cadernos de R$15 (C), um quarto de 40 (C), acréscimo de 20% em 50 (B). Enunciados, alternativas e comentários foram criados para esta missão e conferidos aritmeticamente. Não são paráfrases de itens de exame. Nenhum texto foi atribuído falsamente ao ENEM/Cesgranrio. As fixtures de volume e de origem oficial sintética existem apenas em testes, não no catálogo real.

## Fontes e direitos editoriais

Consulta em 09/11/2026, por fontes primárias. **Não foi obtida confirmação suficiente para redistribuir questões autênticas**, e nenhuma foi incorporada ao repositório/APK. Isso é um impedimento editorial documentado, não alegação de proibição absoluta nem parecer jurídico.

| Fonte consultada | Evidência e decisão |
| --- | --- |
| [Inep: ENEM 2024](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2024) | Identifica aplicação regular, D2, caderno 5 amarelo e seus links separados de prova/gabarito. Rodapé anuncia CC BY-ND 3.0 para conteúdo do site. PDFs retornaram 502 no acesso desta consulta; não houve conferência integral de itens/gabaritos. |
| [Prova D2 C5](https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_impresso_D2_CD5.pdf) e [gabarito correspondente](https://download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_impresso_D2_CD5.pdf) | Links descobertos na página oficial; conteúdo não transcrito nem distribuído. Sem autorização/conferência editorial suficiente. |
| [Inep: ENEM 2025](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2025) e [microdados](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem) | Fontes de descoberta consultadas. Microdados não foram tratados como licença automática dos enunciados/imagens. Nenhum arquivo de microdados pessoal foi baixado ou versionado. |
| [MGI: cadernos e gabaritos](https://www.gov.br/gestao/pt-br/concursonacional/caderno-de-provas-e-gabaritos), [cadernos](https://www.gov.br/gestao/pt-br/concursonacional/caderno-de-provas) e [gabaritos finais](https://www.gov.br/gestao/pt-br/concursonacional/gabaritos-finais) | Fonte oficial do CPNU/2024; diferencia material preliminar e final e aponta recursos/anulações. Rodapé CC BY-ND 3.0, sem confirmação suficiente de alcance aos anexos/terceiros e à seleção interativa proposta. |
| [Gabaritos finais da tarde](https://www.gov.br/gestao/pt-br/concursonacional/gabaritos-finais/cpnu2024_gabaritosoficiais_todos-os-blocos-tarde.pdf) | Consultado: Bloco 8 distingue gabaritos 1–5 e Matemática nas posições 16–30. Não misturados entre variantes. Nenhum exercício foi publicado apenas com base nessa tabela. |
| [Respostas a recursos](https://www.gov.br/gestao/pt-br/concursonacional/gabaritos-finais/cpnu2024_respostas_recursos_todos-os-blocos.pdf) | Documento informa que o Bloco 8/tarde não teve questões anuladas. A conferência não substitui licença nem revisão integral de futuras transcrições. |
| [Resumo CC BY-ND 3.0](https://creativecommons.org/licenses/by-nd/3.0/) | Atribuição e restrição a derivações precisam ser observadas. Mera troca de formato não é automaticamente derivação, mas o resumo não comprova titularidade/alcance aos PDFs ou componentes de terceiros. Não se presumiu permissão irrestrita nem CC BY. |

Excluídos: todos os enunciados/alternativas/imagens ENEM/CNU nesta entrega, por insuficiência da evidência de redistribuição e/ou de conferência integral. Não houve OCR em massa, paráfrase para contornar direitos, figura ausente apresentada como item completo ou explicação inventada atribuída à banca. A revisão futura pode liberar seleção menor, desde que documente item a item fontes, direitos, fidelidade, gabarito final, mídia e anulações.

## Testes executados e falhas

Não somar execuções sobrepostas como testes distintos. Dados de teste são sintéticos e bancos descartáveis.

- D1: rodada integrada **93 PASS/1 FAIL** (lista antiga de tabelas); correção e reforço de v9: **41 PASS** em três arquivos. Rollback, upgrade/reabertura, histórico, incremento, idempotência e v6–v9 cobertos nas suítes dirigidas.
- D2: UI inicial **36 PASS/1 FAIL** de fixture de rota; corrigida, nova suíte **3 PASS**. Regressão pacotes/UI **19 PASS**. E2E D final do checkpoint: **2 PASS**.
- D3 ampla única: **1.120 PASS/11 FAIL em 173 arquivos**. Nove falhas de expectativas antigas (18 versus 17, 10 versus 9, tabela adicional), uma espera da Oficina já vista anteriormente e timeout de 5 s de envelope da Ytha. Expectativas foram atualizadas sem remover asserts; regressão dirigida **92 PASS/16 arquivos**, incluindo Oficina. Não foi repetida a ampla nem ampliado timeout da Ytha; **não declarar CI global verde**.
- Após revisão de disponibilidade/volume, **33 PASS/4 arquivos** (pacotes, 200/1.000/3.000 itens, domínio e UI). Regressão adicional de arquivadas: **4 PASS** em React. Corrupção, manifesto inválido, hash, versão, duplicatas, colisões, correção, anulação/preliminar, rollback de restore, histórico e licença/origem ausentes são exercitados.
- E2E consolidado A/B/C/D: **8 PASS/2 FAIL**. Relicário revelou rótulo de arquivamento alterado pela D, reparado; o caso D recarregava antes de concluir a navegação de pausa, reparado com espera explícita pelo destino. Revalidação dirigida final: **3/3 PASS** (Relicário e os dois D), em 15,8 s. Os dez cenários educacionais dirigidos possuem PASS entre essas execuções; não inclui Canvas.
- O E2E histórico de Canvas residente foi executado separadamente: **FAIL por timeout de 30 s antes de entrar no Arcanário**. Não houve reparo especulativo de Three, retry, timeout maior ou supressão do assert. Permanece pendente, como em C. Primeira tentativa de rodada foi interrompida por sobreposição indevida com build; não é contada como gate.
- Falhas intermediárias D2: módulo lazy após reload impedia reinstalação web offline (corrigido com cache público/pins); seletor de título ambíguo no último assert (h1/h2, corrigido); fixtures de rota/atualização e lint dos novos testes/scripts foram corrigidos e rechecados. Distintas das dívidas históricas.

Formato/format:check, lint, TypeScript, packs:check, áudio, build web, performance:report e diff PASS no código consolidado. APK/sync e proveniência são registrados após a construção. Nenhum teste automatizado certifica TalkBack, áudio percebido, arte humana, estabilidade térmica ou desempenho físico.

## Volume e desempenho

Fixtures de **200, 1.000 e 3.000 questões**, geradas somente nos testes, não distribuídas como catálogo. Dados do host/fake-indexeddb; não são benchmark de flash, FPS ou limite Android. Arte/Three não foram reduzidos. O inventário de build preserva os warnings conhecidos de chunks grandes.

| Questões | Instalar ms | Ler grafo ms | Filtrar ms | Reabrir/resumo ms | Backup ms | Backup B | Grafo lógico B | Delta heap B |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 200 | 433 | 49 | 3 | 44 | 49 | 68158 | 549715 | 26531696 |
| 1000 | 1120 | 124 | 5 | 83 | 151 | 326565 | 2743327 | 75722544 |
| 3000 | 2650 | 312 | 10 | 195 | 362 | 975523 | 8239865 | 117980280 |

JSONs do ensaio final: [evidências de volume](audits/evidence/bf56d/volume/). Instalação inclui validação/hash/gravação; reabertura inclui composição e consulta de resumo. Bytes lógicos incluem redundância intencional de atuais/revisões e metadados; não equivalem a ocupação física. Delta de heap não é pico, memória retida após GC ou prova de leak; cargas sustentadas no aparelho permanecem pendentes.

## Evidências visuais

[Catálogo retrato](audits/evidence/bf56d/catalogo-retrato.png) · [lotes instalados](audits/evidence/bf56d/lotes-instalados.png) · [Provação e correção](audits/evidence/bf56d/provacao-com-pacote.png) · [remoção com história preservada](audits/evidence/bf56d/removido-historico-preservado.png) · [paisagem](audits/evidence/bf56d/catalogo-paisagem.png).

Capturas usam só conteúdo original demonstrativo. Inspeção visual no host não é aceite artístico humano. Foram exercitados 390×844 e 844×390, foco/teclado, movimento reduzido suportado pelo CSS e nenhuma rolagem horizontal no catálogo testado. Dock/safe areas e Voltar físico continuam no roteiro.

## Gate Moto G06 e próximos passos

[Roteiro objetivo da candidata](audits/evidence/bf56d/MOTO_G06.md). **Não aprovado fisicamente.** Guardar backup anterior e atualizar por cima; nenhuma instalação, limpeza, restauração ou migração em dados pessoais foi feita pelo agente.

Antes de aceite/merge: avaliar migração e seis registros, reparos C, pacotes/lotes offline, Provações/retomada, histórico após remover/reinstalar, espaço, contraste, ergonomia, paisagem, foco/TalkBack, teclado, Voltar Android, retorno ao Canvas, fluidez e cargas sustentadas. Restauração destrutiva somente em base descartável. Sem downgrade para APK anterior após v18.

E/F/G permanecem **planejadas, sem implementação autorizada por esta entrega**: E TCG; F arena/arte e entrada orbital; G auditoria/fechamento. O marco educacional A–D e o refinamento integrado continuam sujeitos ao aceite do proprietário. Nenhum merge nem encerramento da BF-5.6 é automático. Dívidas BF-5.5, Canvas/CI, TalkBack, memória/termal e gates parciais anteriores permanecem abertas.

## Registro de publicação

- Produção: `d0fe1664a4fd7c08e04b1dee6f62541e8bccea4b`; commits posteriores somente documentação/proveniência. Branch `feat/bf-5-6d-arcanario-pacotes-oficiais`, publicação em uma PR draft contra main. URL remota informada na entrega da missão; sem merge/release.
- **PASS:** `npm run format`, `format:check`, `lint`, `typecheck`, `packs:check`, `audio:check`, `build`, `performance:report`, `android:sync`, `android:build:debug`, `git diff --check`. Scripts unitários/E2E têm as ressalvas e resultados distintos registrados acima; não foram declarados globalmente PASS.
- APK debug: `android/app/build/outputs/apk/debug/Biblioteca-Viva-BF56D-debug.apk`, **11,642,770 bytes**; SHA-256 `5937c585158cd96e3107603b5223844604f6312bc0d30819195add855508d1e8`. APK e keystore não versionados; sem publicação de release ou instalação física.
- **58/58 arquivos web de runtime** conferidos byte a byte entre dist, assets Android e ZIP do APK, incluindo o chunk local de pacotes. `.vite/manifest.json` é metadado de build, explicitamente excluído pelo empacotamento Android e não contado como asset de runtime. O verificador inicialmente tentou conferir esse metadado como runtime e foi ajustado para explicitar a exclusão; nenhum arquivo necessário foi omitido.
- [Proveniência estruturada](audits/evidence/bf56d/apk.json) · [matriz de checks](audits/evidence/bf56d/validation.json) · [roteiro Moto G06](audits/evidence/bf56d/MOTO_G06.md).
- Revisão final: checkout de produção limpo, 74 arquivos alterados revisados, sem credenciais/keystore/APK/backup pessoal no diff. Conteúdo distribuído autoral e fixtures identificadas. CI remota omitida por cota com `[skip ci]`, conforme política vigente até 01/12/2026; não foi chamada de verde.
- Pendente: gate físico, aceite artístico/assistivo, Canvas E2E e decisão humana de merge; impedimentos editoriais oficiais e dívidas históricas preservados.
