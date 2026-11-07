# Saneamento de segurança pós-R3 — 07/11/2026

Missão extraordinária anterior à R4, na branch `perf/bv-recuperacao-integral`,
PR #38 aberta/draft, sem merge. Base conferida e sincronizada:
`a29f2ca42cfd121044bfd8bda8019b01d2467211`; worktree inicialmente limpa.
Fedora 44, Node 24.18.0, npm 12.0.2. A aprovação humana da R3 e melhora de fluidez
no Moto G06 informadas pelo proprietário nesta missão são preservadas; não são
validação física das atualizações de dependências. R4/R5 não executadas.

## Etapa A — produção

`npm ci` do baseline PASS. `npm audit --json` reproduziu 24 ocorrências por
pacote: 14 moderadas, 9 altas, 1 crítica. `npm audit --omit=dev --json`: quatro
ocorrências (1 crítica, 3 altas), correspondentes a três advisories únicos.
A auditoria completa contém **49 advisories GHSA únicos**, não 24; wrappers
herdam alertas e certos pacotes agregam vários problemas. Evidências JSON em
[evidence/bv-security-post-r3](evidence/bv-security-post-r3).

| Dependência | Antes | Depois | Motivo |
| --- | --- | --- | --- |
| @capacitor/android, @capacitor/core, @capacitor/cli | 8.4.2 | 8.4.3 | Correção coordenada patch; Android GHSA-rvm3-566m-v7fv / CVE-2026-103922 |
| react-router-dom → react-router | 7.18.1 | 7.18.5 | GHSA-qwww-vcr4-c8h2, corrigido desde 7.18.2 |
| zod | 4.4.3 | 4.6.7 | GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404, corrigido desde 4.6.6 |

Metadados do registry confirmaram versões estáveis, peer React >=18 e Router
Node >=20. Android requer Core ^8.4.0; App 8.1.1, Filesystem 8.1.2 e Share 8.0.1
aceitam Core >=8.0.0 e permanecem nessas versões. CLI requer Node >=22,
satisfeito pelo ambiente. Não foram alterados permissões, schema Dexie v14,
backup v6, semântica de validação ou runtime R1–R3.

No Android 8.4.3 instalado, `Bridge.launchIntent` bloqueia o caminho do proxy
antes de consultar plugins; `WebViewLocalServer` atende o proxy somente com
CapacitorHttp habilitado e recusa requisições de documento (main frame e
navegações com Upgrade-Insecure-Requests). O app não habilita CapacitorHttp;
isso sozinho não mitigava a versão anterior. A correção nativa exige novo APK.

O app usa BrowserRouter/Routes/Link e hooks convencionais, sem APIs RSC
experimentais, servidor React, actions RSC ou framework SSR. Ausência desse
caminho reduz exposição, mas a atualização foi aplicada mesmo assim.

Backup externo passa pelo limite de 10 MiB antes de JSON.parse e por schema
estrito, integridade, duplicatas e transação. Arrays de registros/notas/tags
não têm limite próprio de cardinalidade; o limite de bytes reduz exposição,
mas não é prova contra todo consumo excessivo. Planos de treino têm máximo 80
e cartas 1000. Regressões novas usam 512 notas inválidas e arquivo de 10 MiB +
1 byte, sem esgotamento real de memória, exigindo erro público e base intacta.

**Gate A: zero vulnerabilidades de produção**, exit 0. Auditoria completa
após A: 20 ocorrências (14 moderadas, 6 altas), investigadas na Etapa B.

## Etapa B — classificação das 24 ocorrências

Categorias: **P** = produção; **D** = dependência direta de desenvolvimento;
**T** = ferramenta de build/test/lint/empacotamento; dependências abaixo da raiz
são transitivas. D e T se sobrepõem; não somar essas classes como novos alertas.
CLI significa `@capacitor/cli`. `npm explain` foi executado para cada pacote
com advisory direto e para os intermediários; `npm ls --all --json` não apontou
pacotes inválidos no baseline ou no final. Os inventários completos, com
arestas diretas/transitivas e versões, estão nas evidências; caminhos são
relativos, sem dados pessoais. O lockfile mantém integrities do registry.

| Pacote | Classe | Severidade npm | Instalada → final | Introdução / herança |
| --- | --- | --- | --- | --- |
| @capacitor/android | P | crítica | 8.4.2 → 8.4.3 | raiz → Android (produção) |
| @eslint/config-array | T/transitiva | moderada | 0.23.5 → 0.23.5 | eslint → config-array → minimatch |
| @eslint/js | D/T | moderada | 10.0.1 → 10.0.1 | raiz → @eslint/js → peer eslint → minimatch |
| @typescript-eslint/eslint-plugin | T/transitiva | moderada | 8.65.0 → 8.65.0 | typescript-eslint → eslint-plugin → parser/type-utils/utils → estree → minimatch |
| @typescript-eslint/parser | T/transitiva | moderada | 8.65.0 → 8.65.0 | typescript-eslint → parser → estree → minimatch |
| @typescript-eslint/type-utils | T/transitiva | moderada | 8.65.0 → 8.65.0 | typescript-eslint → eslint-plugin → type-utils → estree/utils → minimatch |
| @typescript-eslint/typescript-estree | T/transitiva | moderada | 8.65.0 → 8.65.0 | typescript-eslint → estree → minimatch |
| @typescript-eslint/utils | T/transitiva | moderada | 8.65.0 → 8.65.0 | typescript-eslint → utils → estree → minimatch |
| @vitest/mocker | T/transitiva | moderada | 4.1.10 → 4.1.12 | vitest → mocker |
| @xmldom/xmldom | T/transitiva | alta | 0.9.10 → 0.9.12 | CLI → plist (também via native-run) → xmldom |
| brace-expansion | T/transitiva | alta | 5.0.8 → 5.0.12 | eslint / estree / glob → minimatch → brace-expansion |
| eslint | D/T | moderada | 10.8.0 → 10.8.0 | raiz → eslint → config-array / minimatch |
| glob | T/transitiva | moderada | 13.0.6 → 14.0.4 | CLI → rimraf → glob |
| minimatch | T/transitiva | moderada | 10.2.6 → 11.0.5 | eslint / config-array / estree / glob → minimatch |
| nanoid | T/transitiva | alta | 3.3.16 → 3.3.20 | vite → postcss → nanoid |
| react-router | P | alta | 7.18.1 → 7.18.5 | react-router-dom → react-router (produção) |
| react-router-dom | P | alta | 7.18.1 → 7.18.5 | raiz → react-router-dom → react-router (produção) |
| rimraf | T/transitiva | moderada | 6.1.3 → 6.1.4 | CLI → rimraf → glob |
| source-map-js | T/transitiva | alta | 1.2.1 → 1.2.2 | vite → postcss; jsdom → css-tree (também via seletor/specificity) → source-map-js |
| typescript-eslint | D/T | moderada | 8.65.0 → 8.65.0 | raiz → typescript-eslint → parser/plugin/utils/estree → minimatch |
| undici | T/transitiva | alta | 8.9.0 → 8.12.4 | jsdom → undici |
| vite | D/T | alta | 8.1.5 → 8.1.6 | raiz → vite (build/dev; também via vitest) |
| vitest | D/T | moderada | 4.1.10 → 4.1.12 | raiz → vitest → mocker |
| zod | P | alta | 4.4.3 → 4.6.7 | raiz → zod (produção) |

Os dez wrappers/moderados remanescentes após os patches usuais eram todos
herança de GHSA-g3hv-75wg-m249. Não foram dez falhas independentes.
As 20 ocorrências fora de produção representam **46 GHSA únicos**.

### Escolha das atualizações e compatibilidade

- **Vite 8.1.5 → 8.1.6**, patch de cinco advisories; mantém plugin-react 6.0.4
  e seu peer Vite ^8.0.0. **Vitest 4.1.10 → 4.1.12**, incluindo todos os
  componentes @vitest alinhados, corrige dois GHSA. Ambos fixados em versão
  exata para manter a linha validada, sem migrar Vite 8.3 ou Vitest 5.
- **xmldom 0.9.10 → 0.9.12**, **brace-expansion 5.0.8 → 5.0.12**,
  **nanoid 3.3.16 → 3.3.20**, **source-map-js 1.2.1 → 1.2.2** e
  **undici 8.9.0 → 8.12.4** por atualização dirigida do lock nas faixas
  dos pais existentes. Corrigem respectivamente 13, 4, 1, 1 e 18 GHSA.
- **rimraf 6.1.3 → 6.1.4** é o patch do pai que passa a exigir glob ^14.0.3;
  resolve glob 13.0.6 → 14.0.4 (fix mínimo 14.0.2), sem override de glob.
  A major transitiva troca matcher e path-scurry 2→3; CLI só chama a API rimraf
  existente. Node 24 satisfaz rimraf/glob/path-scurry e o sync/build Android
  exercitam a integração. Não há chamada de glob pelo produto.
- **minimatch 10.2.6 → 11.0.5** exige major: não existe correção 10.x,
  nem versões atuais dos três pais que dependam de 11. O npm sugeria downgrade
  de ESLint/@eslint/js para 9 e typescript-eslint para 8.36; isso não foi
  adotado. Overrides restritos a `eslint@^10.8.0`,
  `@eslint/config-array@0.23.5` e `@typescript-eslint/typescript-estree@8.65.0`
  aplicam apenas minimatch 11.0.5. Nenhum override global.
  A linha 11 usa matcher não recursivo, remove `makeRe`/`matchOne`/`regexp`,
  altera `set` de RegExp para Matcher e semântica de alguns extglobs/ranges,
  além de abandonar Node 18. Os três consumidores instalados usam somente
  `Minimatch`, `match` (incluindo partial), `pattern` e `minimatch(...)`;
  não dependem das APIs removidas ou de `set`. Padrões reais do lint são
  globs de extensões/diretórios, sem extglobs negativos/ranges numéricos.
  Validação exige lint completo e comparação da lista de arquivos examinados
  antes/depois, além das regressões de tipos/build/testes. Esta compatibilidade
  é local às versões fixadas dos pais; rever os overrides ao atualizá-los.

Mudanças adicionais são resoluções transitivas permitidas pelos pais:
PostCSS 8.5.24→8.5.32, Chai 6.2.2→6.3.0, picomatch 4.0.5→4.0.7,
tinyrainbow 3.1.1→3.2.0, set-cookie-parser 2.7.2→2.7.3 e auxiliares WASM
opcionais do Rolldown (deduplicação de @emnapi para as versões 1.x já presentes
sob binding-wasm). Não há mudança do Rolldown nativo selecionado no Fedora,
React, Three, Dexie, TypeScript, ESLint, Playwright ou plugins Capacitor
independentes. O diff completo de versões, adições/remoções e relocações está
em `dependency-changes.json`; nenhuma edição manual do lockfile.

### Alcance real por grupo

- **@capacitor/android (P)**: WebView/nativo; link hostil poderia executar conteúdo remoto na origem do app. Patch exige reconstrução/distribuição do APK.
- **react-router (P)**: RSC experimental ausente; BrowserRouter local, sem servidor/actions RSC. Atualizado mesmo sem caminho ativo demonstrado.
- **zod (P)**: Backup/importação e formulários processam dados externos; limite 10 MiB e schemas reduzem exposição, arrays sem teto próprio ainda exigem atenção.
- **@vitest/mocker (T)**: Plugins públicos mockerPlugin/interceptorPlugin ausentes; suíte usa jsdom, sem browser mode/RPC publicado. Atacante precisaria alcançar servidor/configuração vulnerável.
- **vitest (T)**: Mesmo advisory de mocker, contado uma só vez por GHSA; ferramenta de testes, sem inclusão no APK.
- **@xmldom/xmldom (T)**: Parser/serializer do CLI para plist nativo, não importador de backup do app. XML/plist de checkout/SDK não confiável poderia afetar build; sem serviço XML exposto.
- **brace-expansion (T)**: Padrões de globs do lint/CLI são controlados pelo checkout; DoS se padrões adversariais forem introduzidos. Não recebe busca ou registros do usuário.
- **glob (T)**: Remoção/enumeração no CLI via rimraf; cancelamento defeituoso manteria I/O em árvore não confiável. Sem endpoint remoto de glob no app.
- **minimatch (T)**: Padrões do lint/CLI controlados pelo checkout; amplificação requer optimizationLevel >=2 e padrão adversarial. Nenhum glob vem dos registros/backup.
- **nanoid (T)**: Gerador transitivo do PostCSS; projeto não chama customAlphabet/customRandom com tamanho externo/zero. Travamento possível se ferramenta passar tamanho zero.
- **source-map-js (T)**: Sourcemaps de CSS/build/testes; offsets hostis podem bloquear Node. Sem parsing desses mapas por registros do aplicativo.
- **undici (T)**: HTTP do ambiente jsdom, não runtime do APK. Respostas/peers hostis podem afetar Node; não há no projeto uso direto de EventSource, WebSocketStream, cache/retry/decompress, BalancedPool ou TLS custom do undici.
- **vite (T)**: Dev server local; E2E/harness vinculados a 127.0.0.1. Windows/WSL não é o Fedora atual; sem middlewareMode/SSR custom no produto. Falhas de editor, exposição de arquivos e middleware permanecem relevantes para desenvolvimento.

Não foi demonstrada exploração no checkout. Isso não torna devDependencies
inofensivas: alterações de terceiros no checkout, configurações, peers remotos,
XML e sourcemaps podem atingir o processo de build/testes. Todos os 49 GHSA do
baseline receberam atualização; nenhum foi suprimido ou aceito como dívida.
Não há alerta deste baseline sem correção disponível na árvore final.

## Advisories únicos (49)

Severidades próprias dos GHSA: 1 crítica, 25 altas, 19 moderadas, 4 baixas.
Diferem das 24 ocorrências do npm, que agrega a maior severidade por pacote.
Cada linha identifica o problema, a primeira correção aplicável à linha do
pacote instalado, a exposição (seção acima) e a versão efetivamente adotada.
Fontes: GitHub Advisory Database (API pública, 49 detalhes consultados) e
metadados do registry npm; a data do relatório é um snapshot, não garantia
sobre advisories futuros. Advisory repetido em vitest/mocker conta uma vez.

| GHSA / CVE | Pacote / problema | Severidade | Fix mínimo → adotado | Alcance |
| --- | --- | --- | --- | --- |
| [GHSA-27p8-2357-5qqv](https://github.com/advisories/GHSA-27p8-2357-5qqv) / CVE-2026-83608 | @xmldom/xmldom: xmldom: DocType name Injection Bypasses requireWellFormed | alta | 0.8.15 → 0.9.12 | T |
| [GHSA-2gqq-gqf2-x968](https://github.com/advisories/GHSA-2gqq-gqf2-x968) / CVE-2026-84947 | undici: undici vulnerable to response truncation via oversized chunked responses in the dump interceptor | baixa | 8.10.2 → 8.12.4 | T |
| [GHSA-2jfj-6hjv-fm6j](https://github.com/advisories/GHSA-2jfj-6hjv-fm6j) / CVE-2026-84933 | undici: undici vulnerable to cross-user cookie disclosure via Set-Cookie caching in shared caches | moderada | 8.10.2 → 8.12.4 | T |
| [GHSA-2m5v-pch6-74hx](https://github.com/advisories/GHSA-2m5v-pch6-74hx) / CVE-2026-109383 | undici: undici vulnerable to TLS certificate validation bypass via dropped tls options in Agent | alta | 8.12.2 → 8.12.4 | T |
| [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) / CVE-2026-67213 | nanoid: nanoid: custom generators can loop indefinitely when size is zero | alta | 3.3.18 → 3.3.20 | T |
| [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) / CVE-2026-118773 | glob: Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal | moderada | ver advisory → 14.0.4 | T |
| [GHSA-3px3-54cx-rmw9](https://github.com/advisories/GHSA-3px3-54cx-rmw9) / CVE-2026-83609 | @xmldom/xmldom: xmldom: Creation-time XML Name/QName validation is bypassable via an embedded line terminator, allowing injection on the default serialization path | alta | 0.9.12 → 0.9.12 | T |
| [GHSA-3wwx-pv8p-q78v](https://github.com/advisories/GHSA-3wwx-pv8p-q78v) / CVE-2026-85024 | undici: undici vulnerable to Denial of Service via unhandled error in WebSocket permessage-deflate decompression | moderada | 8.10.2 → 8.12.4 | T |
| [GHSA-3xpg-4rpp-hhhm](https://github.com/advisories/GHSA-3xpg-4rpp-hhhm) / CVE-2026-84890 | undici: undici vulnerable to Denial of Service via unbounded decompression of compressed responses | moderada | 8.10.2 → 8.12.4 | T |
| [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685) / CVE-2026-109924 | undici: undici vulnerable to Denial of Service via unbounded memory in the EventSource parser | moderada | 8.12.2 → 8.12.4 | T |
| [GHSA-4w3w-2rp5-g8jm](https://github.com/advisories/GHSA-4w3w-2rp5-g8jm) / CVE-2026-83605 | @xmldom/xmldom: xmldom: Attribute name injection via setAttribute() bypasses requireWellFormed | alta | 0.9.11 → 0.9.12 | T |
| [GHSA-4w7w-5xrc-9h26](https://github.com/advisories/GHSA-4w7w-5xrc-9h26) / CVE-2026-109829 | undici: undici vulnerable to cache poisoning and cross-user disclosure via cross-origin redirects | alta | 8.12.2 → 8.12.4 | T |
| [GHSA-55wc-3pg8-jfw6](https://github.com/advisories/GHSA-55wc-3pg8-jfw6) / CVE-2026-87029 | undici: undici vulnerable to Denial of Service via unhandled exception in the decompress interceptor | moderada | 8.12.2 → 8.12.4 | T |
| [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) / CVE-2026-112942 | vite: launch-editor: fs.existsSync() existence check can be bypassed on Windows | alta | 8.3.3 → 8.1.6 | T |
| [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) / CVE-2026-93749 | source-map-js: source-map-js allows event-loop denial of service through indexed source-map section offsets | alta | 1.2.2 → 1.2.2 | T |
| [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) / CVE-2026-112943 | vite: launch-editor: escapeCmdArgs() omits % escaping on Windows | moderada | 8.3.3 → 8.1.6 | T |
| [GHSA-6gmq-8vp8-gcm6](https://github.com/advisories/GHSA-6gmq-8vp8-gcm6) / CVE-2026-83610 | @xmldom/xmldom: xmldom: XML fragment injection via invalid EntityReference.nodeName during requireWellFormed serialization | moderada | 0.8.15 → 0.9.12 | T |
| [GHSA-6h8r-xr42-gp59](https://github.com/advisories/GHSA-6h8r-xr42-gp59) / CVE-2026-83611 | @xmldom/xmldom: xmldom: Parser silently accepts a not-well-formed end tag whose name is followed by a line break and trailing content | moderada | 0.8.15 → 0.9.12 | T |
| [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) / CVE-2026-102276 | brace-expansion: brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion | alta | 5.0.10 → 5.0.12 | T |
| [GHSA-6mj3-qw4j-hgrw](https://github.com/advisories/GHSA-6mj3-qw4j-hgrw) / CVE-2026-83612 | @xmldom/xmldom: xmldom: HTML raw-text closing-tag case mismatch causes output amplification | alta | 0.9.12 → 0.9.12 | T |
| [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) / CVE-2026-84373 | @vitest/mocker: Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock | moderada | 4.1.11 → 4.1.12 | T |
| [GHSA-8344-3jmq-59r6](https://github.com/advisories/GHSA-8344-3jmq-59r6) / CVE-2026-83613 | @xmldom/xmldom: xmldom: Quadratic-time attribute deduplication | alta | 0.8.15 → 0.9.12 | T |
| [GHSA-8436-99hf-9mmv](https://github.com/advisories/GHSA-8436-99hf-9mmv) / CVE-2026-85008 | undici: undici vulnerable to caching and replay of unsafe HTTP method responses | baixa | 8.10.2 → 8.12.4 | T |
| [GHSA-93r5-fhx6-vmg9](https://github.com/advisories/GHSA-93r5-fhx6-vmg9) / CVE-2026-83614 | @xmldom/xmldom: xmldom: Quadratic-time parsing via the malformed-input recovery path — parseElementStartPart re-scan and normalize() adjacent-text merge | alta | 0.8.15 → 0.9.12 | T |
| [GHSA-965w-775f-mr7g](https://github.com/advisories/GHSA-965w-775f-mr7g) / CVE-2026-83615 | @xmldom/xmldom: xmldom: Quadratic-memory consumption | alta | 0.8.15 → 0.9.12 | T |
| [GHSA-9fm3-97px-rjf6](https://github.com/advisories/GHSA-9fm3-97px-rjf6) / CVE-2026-109932 | undici: undici WebSocket client vulnerable to Denial of Service via unbounded automatic PONG buffering | moderada | 8.12.2 → 8.12.4 | T |
| [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) / CVE-2026-112945 | vite: Vite: Cross origin script execution through Vite custom middleware | baixa | 8.3.3 → 8.1.6 | T |
| [GHSA-c7q8-3ch8-vqpv](https://github.com/advisories/GHSA-c7q8-3ch8-vqpv) / CVE-2026-83616 | @xmldom/xmldom: xmldom: Processing Instruction Target Injection Bypasses requireWellFormed | alta | 0.8.15 → 0.9.12 | T |
| [GHSA-f72v-6w45-q472](https://github.com/advisories/GHSA-f72v-6w45-q472) / CVE-2026-109841 | undici: undici vulnerable to Subresource Integrity bypass via non-lowercase algorithm tokens | moderada | 8.12.2 → 8.12.4 | T |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) / CVE-2026-118764 | minimatch: minimatch has potential denial of service via globparts amplification | moderada | ver advisory → 11.0.5 | T |
| [GHSA-g53g-w8rj-fmg7](https://github.com/advisories/GHSA-g53g-w8rj-fmg7) / CVE-2026-83606 | @xmldom/xmldom: xmldom PI grammar regex ReDoS: quadratic backtracking on unterminated processing instructions | alta | 0.9.11 → 0.9.12 | T |
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) / CVE-2023-54404 | zod: Zod can exhaust memory while validating oversized constrained collections | alta | 4.6.6 → 4.6.7 | P |
| [GHSA-pmjh-fq2x-6v4x](https://github.com/advisories/GHSA-pmjh-fq2x-6v4x) / CVE-2026-18149 | undici: undici vulnerable to Denial of Service via orphaned RetryHandler response body | moderada | 8.10.2 → 8.12.4 | T |
| [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) / CVE-2026-102277 | brace-expansion: brace-expansion: Quadratic-time expansion of the {a},b} rewrite causes CPU denial of service | moderada | 5.0.12 → 5.0.12 | T |
| [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) / CVE-2026-102278 | brace-expansion: brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion | alta | 5.0.11 → 5.0.12 | T |
| [GHSA-qrxm-fqhp-jwvm](https://github.com/advisories/GHSA-qrxm-fqhp-jwvm) / CVE-2026-87018 | undici: undici vulnerable to Denial of Service via TLS 1.2 certificate-changing renegotiation | alta | 8.12.2 → 8.12.4 | T |
| [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) / sem CVE próprio | react-router: React Router: RSC Mode CSRF Bypass Allows Action Execution Before 400 Response | alta | 7.18.2 → 7.18.5 | P |
| [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) / CVE-2026-112949 | @vitest/mocker: Vitest: Code injection via unauthenticated manual mock registration | moderada | 4.1.12 → 4.1.12 | T |
| [GHSA-r53p-7pc4-xj5r](https://github.com/advisories/GHSA-r53p-7pc4-xj5r) / CVE-2026-18540 | undici: undici vulnerable to downstream response splitting via retry interceptor | baixa | 8.10.2 → 8.12.4 | T |
| [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) / CVE-2026-112944 | vite: launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors | moderada | 8.3.3 → 8.1.6 | T |
| [GHSA-rfgv-xxqx-mfg5](https://github.com/advisories/GHSA-rfgv-xxqx-mfg5) / CVE-2026-19534 | undici: undici vulnerable to Denial of Service via unrequested WebSocket subprotocol | alta | 8.10.2 → 8.12.4 | T |
| [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) / CVE-2026-69152 | brace-expansion: brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation | alta | 5.0.9 → 5.0.12 | T |
| [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) / CVE-2026-112946 | vite: Vite: Files outside server.fs.allow could be served when project paths match system paths on non-Windows machine | moderada | 8.3.3 → 8.1.6 | T |
| [GHSA-rvm3-566m-v7fv](https://github.com/advisories/GHSA-rvm3-566m-v7fv) / CVE-2026-103922 | @capacitor/android: Capacitor Android and iOS: remote content can be loaded at the app origin via the internal HTTP proxy path | crítica | 8.4.3 → 8.4.3 | P |
| [GHSA-rx4f-c7p8-82vq](https://github.com/advisories/GHSA-rx4f-c7p8-82vq) / CVE-2026-85014 | undici: undici vulnerable to Denial of Service via WebSocketStream unclean close | moderada | 8.10.2 → 8.12.4 | T |
| [GHSA-vr34-hp96-76pp](https://github.com/advisories/GHSA-vr34-hp96-76pp) / CVE-2026-83618 | @xmldom/xmldom: xmldom: requireWellFormed DocType publicId/systemId validation is bypassable via an embedded line terminator | alta | 0.9.12 → 0.9.12 | T |
| [GHSA-w293-vg96-wgc3](https://github.com/advisories/GHSA-w293-vg96-wgc3) / CVE-2026-84961 | undici: undici vulnerable to TLS certificate validation bypass via dropped connect options in BalancedPool | alta | 8.10.2 → 8.12.4 | T |
| [GHSA-w2rr-34g9-rvrj](https://github.com/advisories/GHSA-w2rr-34g9-rvrj) / CVE-2026-83607 | @xmldom/xmldom: xmldom: Element name injection via createElement() bypasses requireWellFormed | alta | 0.9.11 → 0.9.12 | T |
| [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c) / CVE-2026-109869 | undici: undici vulnerable to Denial of Service via unhandled error on excessive content-encodings | alta | 8.12.2 → 8.12.4 | T |

## Etapa C — gates locais e regressões

| Gate | Resultado |
| --- | --- |
| npm ci (baseline e lock final) | PASS; versões manifest/lock consistentes |
| npm audit --omit=dev | PASS, 4 → 0 (1 crítica + 3 altas → zero) |
| npm audit | PASS, 24 → 0 (14 moderadas + 9 altas + 1 crítica → zero) |
| npm run format:check | PASS; novamente após ajustar os testes |
| npm run lint | PASS; 427 arquivos antes/depois, mesma cobertura, zero warnings/erros |
| npm run typecheck | PASS; novamente após ajustar os testes |
| npm run test:run | PASS, 144 arquivos / 923 testes, 72,11 s |
| Backup unitário final | PASS 11/11 após tornar a fixture adversarial explícita e sem cast |
| npm run audio:check | PASS |
| npm run build | PASS dentro de android:sync; Vite 8.1.6 |
| npm run performance:report | PASS; inventário de chunks, não benchmark de FPS |
| npm run android:build:debug | PASS; web + sync + assembleDebug, Gradle 45 s |
| Harness real de lifecycle (um ciclo) | PASS; zero erros de página; evidência JSON |
| Playwright dirigido, zero retries | Inicial 7 PASS / 2 FAIL; backup corrigido PASS em rodada focalizada; R2 em comparação controlada abaixo |
| git diff --check | PASS |

Os 923 unitários cobrem domínio/aplicação/infraestrutura, seis categorias,
validação e transações Dexie, upgrades/reabertura e backup/restore v6,
sessões, navegação/diálogos, WorldHost/runtime, gestos/câmera/picking,
quatro habitantes/continuidade, Livro da Estrela/livro pessoal, pergaminhos,
iluminação/magia, pausa/retomada/descarte e contratos dos plugins/arquivos.
Essa cobertura automatizada não significa teste físico desses fluxos.

O harness `node scripts/check-world-lifecycle.mjs <diretório> 1` monta o runtime
real com seis categorias, quatro GLBs e um pergaminho em Chromium/SwiftShader.
Verifica pausa/resume, mesmo canvas/seleção, RAF antigo ignorado, background,
perda/restauração terminal do contexto, listeners/observer/leases zerados e
recursos descartados sem repetição. Não repete o estudo de dez ciclos/memória
da R3 nem encerra sua retenção host ou medição sustentada.

### Playwright: resultados intermediários preservados

Comando da rodada dirigida:

```sh
npm run test:e2e -- e2e/search-and-backup.spec.ts e2e/critical-flow.spec.ts e2e/bf5r4-experience.spec.ts e2e/bf5-ui.spec.ts e2e/bf5-parte2e-controles-capas.spec.ts e2e/bv-recovery-r2.spec.ts --grep 'backup|busca, filtro|rotas inexistentes|ciclo principal|seis rituais|five realms|seletores DOM|R2: six real' --retries=0
```

Sete PASS na rodada inicial: controles DOM/Back/Escape, cinco abas e Back
narrativo em fallback, criar/reabrir/editar seis tipos, ciclo principal com
anotação/conclusão, rotas inexistentes/registro ausente, busca/filtro/Arquivo
e restore em base vazia. Duas falhas, não suprimidas:

1. **Backup web**, após download/arquivo inválido/restore real, confirmou os
   registros restaurados e removidos na IndexedDB e alto contraste após reload;
   falhou porque `toHaveValue("larger")` era aplicado ao botão combobox do
   BVSelectSheet. O seletor já era um botão no SHA original, independentemente
   destas dependências. Asserção adaptada ao contrato real: trigger mostra
   “Maior”; abrir diálogo exige radio “Maior” checked **e value larger**;
   cancelar e continuar os asserts de persistência e coleção. Nenhum assert de
   dados, timeout ou retry removido. Rodada focalizada
   `npm run test:e2e -- e2e/search-and-backup.spec.ts --grep 'backup web real' --retries=0`
   **PASS, 1/1**. Total de cenários distintos aprovados nesta missão: oito.
2. **R2 seleção/highlight**, timeout global original de 30 s ao verificar
   `data-highlighted-object="library-series:r2-series"`, recebido vazio. Não
   alcançou reload/retorno final de Trabalho nessa rodada. Asserts/timeouts
   e runtime foram preservados; logs/traces locais guardados em `test-results/`.
   Comparação com o SHA original em checkout temporário, mesmo Fedora/Node e
   lock original, uma execução sem retry, é registrada abaixo para separar
   dívida anterior de possíveis regressões. Nenhuma causa de produto/runner
   é presumida a partir de timeout isolado.

Não houve `npm audit fix --force`, advisory suprimido, teste excluído, `any`,
lint desativado ou modificação de schema/backup para obter PASS. Tentativas
intermediárias de configuração do override pelo `npm pkg set` foram rejeitadas
por parsing de chaves com pontos/EOVERRIDE; package.json foi corrigido como
objeto estruturado e o lock regenerado pelo npm. A resolução provisória de
Vite numa minor posterior foi descartada antes dos gates finais, em favor do
patch 8.1.6. Essas etapas não foram publicadas nem afetaram o APK final.

## Android e gate físico

APK final: `android/app/build/outputs/apk/debug/app-debug.apk`, **8.609.208 bytes**.
SHA-256: `679dadad2a8c70a6611ebb0705ef84375bc66dd8e36b1a1909e2b703a77334dd`.
Sync confirmou App 8.1.1, Filesystem 8.1.2 e Share 8.0.1. Compilação incluiu o
Android 8.4.3 corrigido; configurações/permissões/APIs nativas e aplicação
permanecem preservadas. Avisos: chunks >500 kB e flatDir; Filesystem 8.1.2
emite depreciação de downloadFile e aviso Kotlin String?→String na implementação
legada. Não bloqueiam assembleDebug e não foram ocultados; plugin não atualizado
sem necessidade. Não há binário, keystore ou material de assinatura versionado.

Não houve conexão, instalação, teste físico, TalkBack, áudio percebido,
medição GPU/heap/FPS, aquecimento ou teste sustentado no Moto G06 nesta missão.
O aceite físico anterior de R1–R3 relatado pelo proprietário continua válido
para aquele APK; o novo build de segurança necessita revalidação humana.

Roteiro curto no Moto G06, como atualização **sem limpar dados**:

1. Abrir app, Biblioteca e cinco abas; Back Android em rota, formulário,
   seletor, diálogo e raiz; conferir retomada após alternar outro app.
2. Pan, pinch, zoom, seleção/câmera e rotação; comparar fluidez com R3 aprovada.
3. Conferir seis categorias, quatro habitantes/continuidade, Livro da Estrela,
   livro pessoal, pergaminhos, noite/luz e magia durante uma sessão fictícia.
4. Em base de teste ou com estratégia de recuperação, usar backup fictício:
   exportar/compartilhar, cancelar seletor, importar inválido e válido, confirmar
   restauração e reabrir. Não restaurar dados reais para realizar este roteiro.
5. Registrar crash, perda de dados, comportamento de Back, permissões ou queda
   perceptível de fluidez. Não promover a beta/release ou fechar a recuperação
   integral por este gate isolado.

## CI e publicação sem consumo de Actions

Proprietário informa cota de 3.000 minutos esgotada, renovação em 01/12/2026.
Nenhum dispatch/rerun/pipeline novo foi solicitado; workflows/billing não
foram alterados. `ci.yml` da candidata e base usa `push` (somente main) e
`pull_request` sem tipos especiais. Main possui ainda preview Android com
workflow_dispatch/push main filtrado por caminho, não acionado nesta branch.
Não há pull_request_target no conjunto examinado.

[Documentação oficial de skip](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)
consultada: `[skip ci]` no HEAD da PR suprime os eventos push/pull_request;
checks podem permanecer Pending, e isso **não é CI verde**. Todos os commits
desta missão têm essa marcação, com **uma única operação de push ao final**,
após reconferir refs/workflows. A atualização da descrição da PR usa o evento
edited, não incluído nos tipos padrão desse workflow.

Snapshot anterior à publicação: nove runs da branch, último
[42387946289](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42387946289),
HEAD a29f2ca, concluído **FAIL** em 07/11/2026 às 15:58:01 UTC. Essa falha é
anterior ao saneamento. Nenhum gate remoto novo é alegado. A verificação
pós-push do HEAD, runs e PR draft será registrada na descrição da PR e na
resposta final, sem um segundo push documental.

## Manutenção e limites

- Repetir auditorias completas e de produção periodicamente e ao atualizar
  dependências; guardar lockfile e investigar todos os caminhos, inclusive dev.
- Rever/remover overrides quando ESLint/config-array/typescript-estree
  adotarem minimatch corrigido; conferir novamente cobertura do lint.
- Usar Node compatível com CLI >=22 e undici >=22.19 (neste gate 24.18.0).
  O engines amplo preexistente do projeto não é certificado para Node 20 por
  esta missão; não foi feita migração geral de toolchain.
- Servidores dev/test apenas locais, sem executar XML/maps/checkouts não
  confiáveis no ambiente com segredos. Não introduzir limites arbitrários de
  coleções ou alterar backup para contornar a biblioteca.
- Segurança npm está limpa neste snapshot; E2E residual, gate do APK novo,
  TalkBack, memória sustentada e recuperação integral permanecem assuntos
  distintos. Sem merge, R4/R5 ou redução artística/do runtime aprovado.

### Comparação controlada do E2E R2

Checkout temporário destacado em `a29f2ca`, sem alterar a branch de trabalho,
recebeu `npm ci` e build originais (PASS) e somente o E2E R2, uma vez, zero
retries. **FAIL também na base**, timeout de 30 s durante clique de seleção
**Estudo**, linha 102; na candidata foi no highlight de **Série**, linha 104.
São pontos distintos dentro do mesmo cenário: isso demonstra que o cenário
já falhava antes das atualizações, **não** prova que as duas falhas tenham a
mesma causa, nem certifica ausência de regressão. Nenhuma correção R4/R5,
refatoração do runtime, aumento de timeout ou nova repetição foi feita.

Resultado agregado honesto da missão: **oito cenários E2E distintos PASS e um
cenário pendente/FAIL**, após corrigir o assert obsoleto do backup. Não é uma
rodada única de nove testes verde. As duas falhas iniciais, a execução focal
PASS do backup e a comparação FAIL da base estão separadas em
`validation-summary.json`. A candidata de segurança é auditável e npm limpa;
o gate E2E global continua aberto.

## Arquivos e evidência final

Alterações: package.json/package-lock.json; dois testes (backup unitário e
assert do seletor no E2E de backup); este relatório e sua pasta de evidências;
STATUS, TESTING, SECURITY, RISKS e CHANGELOG. Nenhum arquivo produtivo do app,
asset aprovado, configuração Android, workflow ou formato persistido mudou.
O screenshot histórico regravado pelo E2E de calendário foi restaurado ao
conteúdo original, sem promover uma nova evidência artística.

Commit prioritário de produção: `059d520` (`[skip ci]`). O commit final agrupa
correções de desenvolvimento, regressões e documentação, também com `[skip ci]`;
seu SHA e a confirmação remota constam da descrição da PR #38 e da resposta
final, evitando referência circular ao próprio commit dentro deste documento.
