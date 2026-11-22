# BF-5.7B2.4-R2 — reparos físicos (candidata)

Base confirmada local/remota: `79157dd3198fe4395249236787b0e0da57106cb0`.
Branch `feat/bf-5-7b2-remove-tcg-engine`, PR #56 draft. Sem merge/Actions.
O PNG preexistente permaneceu fora dos commits, SHA-256
`16dc95bd6a9fceb84fa872849677bd154575aa9e3f20816181d648121c1f1dba`.
As três capturas Android não estavam anexadas e foram solicitadas no início.
ADB não tinha dispositivo conectado. O plano denominado
`docs/BF-5_7B_ARCANARIO_REFORMA_PLANO.md` não existe no checkout nem na main
remota consultada; a autorização específica desta missão define o escopo.

## Órbita: comparação e reparo

Comparação com `origin/main` e marco F aprovado `690be5b`: raio 28, período
420 s, fase inicial 1.8 rad, altura 5.4 + seno de amplitude 0.18, geometria e
animações articuladas iguais. Na main, runtime e WorldHost não têm diferença
para a base R1. CameraMath/referenceScene também sem diferença. Desde F há
mudanças de lifecycle/seleção já aceitas na BV-UXC; não são atribuídas à remoção
TCG. Textura mudou de URL; os bytes WebP são idênticos:
`57d49ccbbd84784701722b68ca959397016dff72d4ffb1def30c0f0259aa0c38`.
Não há evidência de aproximação geométrica nem razão para alterar câmera.
A projeção ortográfica depende da fase orbital, pan, zoom e viewport; uma
captura de fase diferente não prova mudança do raio.

Defeito matemático demonstrado: dois limites de 50 ms descartavam tempo
ativo em quadros lentos. Em 12 s simulados a 60/30/20 FPS, consumo 12 s;
a 10 FPS, apenas 6 s. A velocidade angular então cai de 0.014959965 rad/s
para 0.007479983 rad/s. Isso demonstra contribuição possível para irregularidade,
mas não prova causa integral do relato físico ou de uma regressão introduzida
pela B2.4: a política já existia na versão aprovada.

O RAF único calcula agora delta ativo bruto para a órbita analítica e mantém
50 ms para habitantes/efeitos restantes. A própria órbita não trunca mais esse
delta. Pause/visibility limpam a referência temporal existente, primeiro quadro
da retomada consome zero. Sem catch-up da ausência, remount, novo loop, câmera
alterada ou velocidade artificial. Grimório, anéis e partículas compartilham
o tempo orbital. Movimento reduzido congela o conjunto. Um stall enquanto o
mundo está ativo ainda significa ausência de frames: o relógio corrige a
trajetória, não fabrica frames nem elimina gargalo de GPU/main thread.

## Assuntos: diagnóstico e candidata

Em Chromium, os seis controles não apresentaram corrupção dos glifos. Estilos
computados dos spans e ancestrais não tinham transform/filter/text-shadow;
não apareceu sobreposição de pseudo-elementos. Acesso direto à rota tinha
zero Canvas: esse experimento separa composição WebGL residente da reprodução.

Conflito comprovado: `styles-legacy.css` aplica min-height:3rem e sombra de
campo de texto a todos os inputs. Choices declara height:1rem, mas o radio
calculado mede 16 × 48 px, com sombra interna. Captura revela faixa alongada
atrás do controle. Reparo localizado define min-height:0, padding:0, fundo
transparente, sem sombra/border-radius no radio de Choices. Label mantém
facetas cristalinas, estado selecionado, foco, semântica nativa e alvo ≥44 px.
Nenhuma promoção de GPU foi acrescentada. Este é um defeito CSS real e uma
mitigação candidata; **não é causa comprovada da fragmentação Android**.
Sombras/transformações neutralizadas separadamente não bastam para certificar
um defeito que o Chromium não reproduz. WebView/dispositivo precisam confirmar.

## Medição gráfica local

Harness temporário com runtime real, cena fictícia vazia de registros, viewport
390 × 844, Chromium headless/software WebGL, sem trace ou outro gate pesado.
Assinatura diagnóstica habilita o probe existente. Não é benchmark Android nem
perfil completo do shell. Dados brutos em `audits/evidence/bf57b24-r2/`.

- 27 callbacks medidos. RAF entre 116.6 e 1100.03 ms, mediana 166.7 ms;
  o período contém pausa explícita de 300 ms e retomada sem catch-up.
- Velocidade angular observada em intervalos ativos:
  0.0149599650170935–0.0149599650170954 rad/s, igual a 2π/420.
- Probe de atualização CPU: mediana 0.6 ms, P95 3.3 ms, máximo 4.1 ms.
- Submissão CPU (inclui desenhos de start/resume): mediana 3.2 ms,
  P95 207.7 ms, máximo 251.7 ms. Não mede tempo GPU/apresentação.
- Long tasks: 26, mediana 170 ms, máximo 1115 ms. Há execução irregular
  mesmo com relógio orbital correto; suavidade física não está certificada.
- Câmera capturada: posição (120,100.1,140), zoom 1; projeção/quaternion no JSON.
  Primeiro ponto lunar local/mundo (27.267734,5.4,-6.361659), raio XZ 28,
  NDC (2.50212,-0.10802,-0.60841). Nesse viewport estreito e zoom inicial,
  o ponto está fora da tela à direita; pan/zoom/fase podem trazê-lo para dentro.
  Não houve mudança de enquadramento para esconder essa propriedade existente.
- Último ponto (26.583339,5.406262,-8.793525); raio XZ continua 28,
  NDC (2.60918,-0.05731,-0.60438). Matrizes e timestamps preservados no JSON.

Experimentos de Choices: original reconstituído (16 × 48, sombra); candidata
(16 × 16, sem sombra); labels/sombras/transformações neutralizados (16 × 16).
Todos sem Canvas, texto íntegro no desktop. A aparência cristalina dos labels
foi mantida na candidata. Não houve aparelho/emulador Android disponível;
experimento com WebGL residente não certifica causalidade do defeito WebView.


## E2E, correlação e gate de passagem

Comando solicitado (três specs) + novo spec Choices: **10 PASS / 2 FAIL**,
zero retries. O conjunto solicitado sozinho corresponde a **8 PASS / 2 FAIL**.
Choices retrato/paisagem passa nos seis nomes/estados, alvo ≥44 px,
caixa nativa quadrada e navegação por setas; captura final com seis labels
visíveis em `choices-candidate.png`. Todos os sete casos de aposentadoria do
TCG e navegação educativa/dock/rascunhos passaram.

Orbital: timeout global 60 s; focus no portal só começa ~57 s após início do
teste; Enter/espera da URL esgotam prazo durante teardown. Assert da URL retorna
session closed, não um destino incorreto observado. Antes disso, ready/loop 1,
HUD visível e detalhes semânticos abertos passaram. Operações triviais de DOM
levam 1.4–4.9 s. Retorno e pausa final não certificados nesse caso.

Lifecycle: timeout global 30 s. Estágios completos com durações no JSON,
trace binário preservado localmente em `/tmp/bf-r2/e2e-results/`.
Os atrasos de protocolo e long tasks do harness independente são compatíveis
com contenção do renderer software, mas não provam causa exclusivamente
ambiental, nem eliminam a possibilidade de corrida de transição no produto.
Não se aumentaram prazos/retries ou removeram asserts. Nenhum ajuste global
de qualidade gráfica foi feito para passar automação.

Gate local da missão: build/typecheck/lint e regressões das partes alteradas
aprovados; ampla 183 arquivos / 1218 testes PASS. Os defeitos demonstrados
receberam tratamento localizado e não apareceu regressão crítica nova sem
tratamento seguro. **B2.5 liberada somente para auditoria/limpeza em branch
filha**, sob autorização desta missão. Isso não aprova os dois E2E, merge,
fechamento técnico integral nem gate visual físico. Corrupção de glifos e
percepção de posição/fluidez requerem o APK e avaliação do proprietário.

Riscos restantes: causa física integral não demonstrada; ausência das capturas
Android; renderer local irregular; E2E orbital/lifecycle FAIL; TalkBack,
memória/termal e P95/P99 físicos não medidos. Sem início B2.6/B3.

### Gates executados

| Gate | Resultado |
| --- | --- |
| lint global final | PASS |
| typecheck | PASS |
| build | PASS; chunks >500 kB mantidos |
| Vitest global isolado | PASS, 183 arquivos / 1218 testes |
| Órbita/runtime dirigidos | PASS, 2 arquivos / 64 testes |
| Choices, Arcanário/pacotes, WorldHost, interação, banco/backup/bootstrap dirigidos | PASS, 9 arquivos / 126 testes |
| E2E solicitado + Choices | FAIL, 10 PASS / 2 timeouts gráficos |
| Prettier dos TS/TSX/E2E alterados | PASS |
| diff --check | PASS |
| Android físico, TalkBack, termal/memória | Não executados |
| GitHub Actions | Não executado |

No lifecycle, o trace registra running → paused → running, mesma identidade,
loop 1 e ausência de erros, mas as operações ultrapassam o prazo global durante
a avaliação de identidade; a finalização fica FAIL. Só obter o elementHandle
levou 7.19 s, sair pelo dock 8.08 s e comparar o elemento 6.11 s. Não converter
o deadline em PASS a posteriori. Dados estáticos de referência para B2.5:
chunk runtime 871848 bytes, entrada 576082 bytes; relatório de build arquivado.
