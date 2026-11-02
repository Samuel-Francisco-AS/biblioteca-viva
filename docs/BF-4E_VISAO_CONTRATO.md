# BF-4E — Objetos Vivos: visão criativa e contrato de interação

> **Estado (2026-11-02): visão criativa adotada pelo usuário, planejamento documental. Implementação, CI, APK, auditoria, gate humano e fechamento da BF-4E ainda NÃO realizados.**
>
> **Base:** `main` após merge BF-4D `e7cb2093a9d2656e7ceaf65086517e5cda0e3355`. Complementa [BF-4 — Plano e contrato](BF-4_PLANO_CONTRATO.md), [ADR-012](decisions/ADR-012-bf-4-mundo-vivo.md), [ART_DIRECTION](ART_DIRECTION.md) e [WORLD](WORLD.md). Não substitui os contratos BF-2/BF-3/BF-4D.
>
> **Princípio:** a Biblioteca deve ser um lugar aconchegante, discretamente encantado, curioso e responsivo — não apenas um museu de props com botões de “tocar”.

## 1. Intenção de produto e experiência

Transformar o mundo completo de cinco cômodos em **ambiente interativo conectado**. Objetos têm identidades ambientais, estados próprios de sessão, animações e respostas visuais/sonoras/táteis/textuais quando apropriado; ações de objetos podem provocar efeitos em outros objetos e na atmosfera. Interações devem comunicar função ou surpresa, não se resumir a um toast genérico.

A BF-4E constrói o **mecanismo de objetos e eventos** reutilizável pelos habitantes da BF-4F. Não cria ainda personagens, conversação, comportamento autônomo, navmesh, persistência espacial, editor de móveis ou interação direta com dados pessoais dos registros.

A direção artística combina madeira, latão, bordô, verde profundo e iluminação quente com fantasia discreta. Há espaço para encantamento e surpresas; evitar tanto o excesso de ruído quanto um simples catálogo de efeitos desconexos. **Não restringir preventivamente a criatividade por suposição sobre o Moto G06**: realizar efeitos visíveis, medir em aparelho representativo e otimizar problemas demonstrados, sem prometer FPS sustentado antes do gate físico.

## 2. Famílias de objetos e reações desejadas

**Alvo de produto: dez famílias interativas com comportamento reconhecível e instâncias distribuídas pelos cinco cômodos**. O executor deve implementar a experiência completa de forma integrada; se houver bloqueio técnico real, documentar precisamente o que ficou faltando em vez de trocar a fase inteira por protótipo isolado de um cômodo.

| Família | Interações e reações desejadas | Preparação BF-4F |
| --- | --- | --- |
| 1. Estantes e nichos | Inspecionar; leve deslocamento de um livro **decorativo** ou detalhe de madeira; brilho/partículas sutis; possível mecanismo ou compartimento secreto; prioridade preservada para seleção dos livros reais | Aproximar, alcançar e escolher estante/livro |
| 2. Mesas de leitura/estudo | Examinar superfícies, abrir livro decorativo, virar página, pena escrever, revelar pergaminho | Estudar/ler e ocupar pontos BF-4D |
| 3. Luminárias | Acender/apagar, graduar intensidade ou alternar temperatura; **efeito perceptível de iluminação real** local na cena, não somente texto ou mudança de ícone | Personagens podem ligar/desligar luz |
| 4. Poltronas, cadeiras e bancos | Reação física/visual pequena: almofada, assento, balanço ou rangido; ação de examinar/acionar, sem fingir que personagem sentou | Futuras poses de sentar e descansar |
| 5. Armários e gavetas | Portas giram, gavetas deslizam e exibem conteúdo cênico/segredo; abrir/fechar com estados coerentes | Futuras ações de procurar/guardar |
| 6. Plantas | Folhas oscilam ao toque; regar ou estimular florescimento temporário; reação opcional à luz | Personagens cuidam de plantas |
| 7. Livros decorativos/pergaminhos | Folhear, revelar inscrições ou mensagens **ficcionais**, sem alterar os registros do usuário | Leitura contextual e descobertas |
| 8. Relógios mecânicos | Ponteiros/engrenagens giram; inspecionar e acionar um ciclo/mechanismo cênico | Eventos de ambiente e observação |
| 9. Globo ou instrumento de observação | Girar diretamente ou por controle semântico; responder à seleção e destacar um detalhe | Personagens observam/manipulam |
| 10. Lareira / elemento de ambiente | Chama/brasas animadas, acender/apagar, alterar luz/ambiente e áudio original; criar como prop novo compatível com a arquitetura | Aquecimento/descanso e reações ambientais |

Outros quadros, portas decorativas, tapetes ou inscrições podem enriquecer a composição se os dez grupos centrais estiverem coerentes. **Exemplos criativos não autorizam conteúdos com direitos de terceiros, novas entidades de domínio ou compras de assets.**

O objeto pode expor `Examinar`, `Usar`, `Abrir/Fechar`, `Acender/Apagar`, `Girar` ou opções específicas. Cada ação precisa de resultado observável; famílias distintas devem ter reações distintas. Evitar um botão universal “interagir” que apenas troca rótulos.

## 3. Mundo inteiro, identidade e distribuição

- Os cinco cômodos **A–E** recebem objetos interativos e detalhes visíveis; não entregar protótipo descartável limitado ao salão.
- Preservar cinco pisos/quatro passagens, três estantes com 70 slots, 13 slots BF-3, 18 ilhas ambientais BF-4C/D, seis categorias, identidade, ordem e overflow.
- Móveis ambientais e novidades usam namespace próprio de ID, sem `entryId`. Um `entryId` pertence apenas ao registro real.
- A posição do objeto, mesh, ordem de instâncias ou índice de array **não** pode ser a identidade. Props BF-4C com IDs existentes devem preservá-los.
- Novos props têm layout declarativo/determinístico e não obstruem regiões, passagens e aproximações da BF-4D.
- O usuário deve conseguir selecionar livro real/estante/registro sem que efeitos decorativos roubem o raycast. Definir prioridade, hit areas e ações explícitas de forma verificável. A interação de uma estante não substitui a abertura dos livros nem a seleção anterior.

## 4. Ações, estado de sessão e encadeamentos

Uma arquitetura simples e testável deverá separar:

1. **Catálogo declarativo** do objeto (`objectId`, família, cômodo, ações autorizadas, rótulos e descrição).
2. **Estado efêmero de sessão**, por instância (por exemplo `lamp:on`, `drawer:open`, `plant:blooms`, `globe:angle`), com estado inicial reprodutível, sem Dexie, backup nem rede.
3. **Despacho de ação** validado: objeto existente, ação habilitada, transição explícita e feedback.
4. **Eventos locais** tipados e limitados, para que outro objeto ou ambiente reaja. Não criar mecanismo genérico que execute comandos arbitrários ou aceite código vindo de texto.
5. **Apresentação** Three.js e React consumindo o mesmo estado/resultado — não dois motores divergentes.

O estado deve persistir **enquanto a montagem/sessão relevante estiver viva**, inclusive em pausa/retomada, e ser descartado com o owner. Reiniciar uma sessão pode restaurar o estado inicial; não adicionar persistência durável sem nova autorização. Garantir cancelamento de animação/efeito ao desmontar e ignorar callbacks tardios. Eventos encadeados precisam de proteção contra loops/ciclos e acionamentos repetidos indevidos.

### Descoberta encadeada mínima — “O segredo do pergaminho”

Uma pequena sequência **inteiramente fictícia e offline** deve ser uma entrega concreta e verificável, com pelo menos quatro momentos:

1. Acender luminária para revelar inscrições no pergaminho.
2. Examinar o pergaminho para receber pista textual.
3. Interagir com um livro **decorativo identificável**, que aciona mecanismo local.
4. Abrir uma gaveta/compartimento e revelar relíquia, bilhete ou detalhe de história do próprio mundo.

Se a ordem estiver incorreta, oferecer feedback coerente sem quebrar o estado. Permitir reinspeção, reset por nova sessão e eventos idempotentes. **Nenhuma descoberta escreve, altera ou desbloqueia um registro pessoal real.** Registrar a sequência em testes para prevenir regressão e permitir reações BF-4F a eventos autorizados.

## 5. Estados ambientais e atmosfera

Oferecer ao menos **três estados cênicos controláveis**, com resposta de múltiplos objetos: **tranquilo**, **noturno** e **encantado/misterioso**. Têm efeitos visuais/iluminação/sons coerentes e devem poder ser ativados/desativados pela UI ou encadeamentos; não dependem de hora real nem rede. Preservar legibilidade de objetos e registros.

Preferir luzes reais adequadas a Three.js quando a promessa for iluminação, animações de emissive/material somente quando fizerem sentido e partículas com lifecycle claro. Não fingir que uma luz ilumina o cômodo se apenas o nome da ação mudou. Efeitos sonoros devem ser originais, gerados localmente ou ter licença/atribuição verificável; haptics opcionais e sob controle do usuário. Respeitar preferências de áudio e redução de movimento. Efeito decorativo não deve prender a navegação ou impedir a função convencional.

## 6. Como o usuário interage

- No **canvas**, um toque em prop interativo abre um contexto legível com nome, descrição e ações disponíveis; tocar livros/registros reais conserva a seleção/abertura existente. Destaque do prop não deve sobrescrever o highlight de um registro real por acidente.
- No **React**, oferecer equivalência semântica das ações essenciais em catálogo/contexto por cômodo, utilizável com teclado, foco adequado e texto de resultado. É importante não depender exclusivamente de WebGL nem de animação para compreender ou operar ações.
- Para ações de arraste específicas (ex.: girar globo), usar modo explícito com início/fim/cancelamento; **não sequestrar pan/pinch/zoom**. Alternativa por botão/slider discreto, quando apropriado.
- Dar feedback consistente de ação concluída, ação indisponível e falha recuperável; permitir reverter estado quando cabível.
- Não construir editor de layout nem drag & drop de móveis pelo usuário.
- Usar acessibilidade semântica e `prefers-reduced-motion`; TalkBack físico continua gate pendente e não pode ser declarado PASS sem verificação humana.

## 7. Fronteiras arquiteturais e implementação

- Manter `React → WorldHost → ThreeWorldRuntime → Three.js`, sem chamadas Dexie no renderer nem nova API desnecessária. Consultar a arquitetura vigente antes de decidir exatamente onde posicionar catálogo, estados, eventos e ponte.
- A atualização de animações/partículas aproveita o loop/lifecycle existente; **não criar segundo RAF por objeto**. Separar simulação/estado de efeitos de render; preferir transições determinísticas sob tempo injetável em testes.
- Ownership claro de geometria, material, luzes, efeitos, áudios e listeners; descarte idempotente, isolamento entre montagens e proteção a falhas/retornos assíncronos.
- Manter F5 diagnóstico e fallback React íntegros; nenhuma mudança em Dexie schema, backup, dados convencionais, world state persistido ou protocolos remotos.
- Assets novos somente com proveniência/licença conforme ADR-010, sem estender automaticamente o perfil GLB para skinning/rigging. Priorizar produção procedural existente; uma dependência ou codec novo requer justificativa concreta.
- **Não antecipar BF-4F:** sem NPCs, IA, agente autônomo, conversação ou interação com usuário no sentido de chat; apenas expor eventos e pontos permitidos para esses sistemas consumirem depois.
- Não declarar cenários vazios/cheios como equivalentes se diferença de densidade afetar testes.

## 8. Execução em checkpoints integrados (sem protótipo isolado)

**E1 — Contrato e ponte:** catálogo, estados de sessão, ações, eventos, superfície React semântica, picking/cancelamento robustos. Definições criadas para os cinco cômodos; sem inflar a etapa em framework genérico.

**E2 — Objetos e animações:** implementar famílias com efeitos físicos/visuais distintos em todos os cinco cômodos; integrar som/haptics opcionais e iluminação real quando prometida.

**E3 — Atmosfera e segredos:** ao menos três modos ambientais, uma sequência de descoberta encadeada e efeitos interdependentes. Múltiplos objetos realmente reagem a um evento.

**E4 — Regressões, Android e handoff:** testes unitários/E2E, build, inspeção de custos e roteiro físico. Nenhum fechamento automático por Codex. Uma implementação pode conter checkpoints internos de commits, mas a entrega final será PR única da BF-4E, salvo decisão posterior.

## 9. Gates de qualidade e critérios de aceite

- Catálogo sem IDs duplicados, transições válidas, sessões independentes, replays idempotentes, efeito encadeado sem loop, fallback após falhas.
- Pelo menos **oito famílias completas**, com **dez como objetivo explícito**; justificar qualquer redução com evidência, sem mascarar famílias parcialmente implementadas. Todas as cinco salas com interações reais, não apenas decoração clicável.
- Animações/effects perceptíveis e específicos, luz cênica perceptivelmente alterada, objetos que abrem/giram/movem fisicamente, três atmosferas e descoberta encadeada completa.
- Seleção, highlight e abertura de livros/estantes/registros continuam corretos via canvas e React; os controles de objeto não prejudicam gestos F3.
- React garante inspeção/ações essenciais sem WebGL e com redução de movimento; foco/feedback/semântica acessíveis. Não alegar TalkBack humano sem gate.
- Ciclo de vida cobre remount, pause/resume, orientação, perda de WebGL, cleanup, cancelamento e isolamento F5.
- Provas com coleção vazia e representativa com 70 livros/13 BF-3, considerando o histórico de E2E pesado. Não relaxar timeouts/asserts só para CI passar.
- Gates usuais: `format:check`, lint, typecheck, Vitest, `audio:check`, build, `performance:report`, Playwright, `git diff --check` e APK debug quando ambiente permitir. Inspeção humana posterior no Moto G06 para mundo inteiro, feedback, luz, áudio/partículas, interações, orientação e background.
- **Riscos existentes:** issue [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4) (`r4-shell` intermitente), [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) (E2E de coleção cheia), R-19 (tremulação de parede), TalkBack ainda pendente. Nenhum deles se considera solucionado só por executar a BF-4E. Se CI falhar, registrar explicitamente quais testes, condições e evidências.

## 10. Entrega, autorização e próximas decisões

Este documento **aprova a visão de produto da BF-4E**, não prova a implementação nem concede permissão genérica para o executor alterar a `main`. O próximo prompt de Codex deve autorizar especificamente sincronização segura com `origin/main`, branch BF-4E exclusiva, implementação, commit, push e criação de PR **sem merge**. A revisão remota pela Luna e gate físico pelo usuário antecedem fechamento da etapa.

A mecânica de **mover livremente móveis e persistir posições** continua uma proposta separada. Personagens visuais, animações de habitantes, comportamento, reação e diálogo pertencem à BF-4F. Não escolher novo provedor de IA, conta externa, serviço pago ou orçamento sem autorização expressa.

**Princípio de aceite criativo:** a Biblioteca deve parecer ter vida própria. O jogador deve poder dizer não só “toquei num móvel”, mas “fiz algo, o mundo reagiu e descobri uma pequena história”.

## Revisão de experiência autorizada pelo usuário — 2026-11-02 (substitui os controles primários manuais)

Após teste do APK BF-4E inicial, o usuário rejeitou explicitamente a experiência centrada em botões. **Direção vigente:** tocar diretamente no prop do mundo executa ação primária, sem etapa obrigatória de painel; toque repetido continua reagindo; pan/pinch/zoom e prioridade legítima de registros continuam intactos. A lista React é alternativa recolhida e fallback acessível, não interface principal. Uma pequena mensagem contextual na cena pode explicar resultados/pistas. As ações secundárias podem ficar na alternativa semântica sem impedir a descoberta completa apenas pelo canvas.

**Atmosfera por contexto:** hora local do dispositivo como base offline; leitura/estudo dentro da sessão pode alterar temporariamente iluminação; descoberta especial provoca clima encantado temporário, com prioridade evento > atividade > horário. Não interpretar registros privados, não acessar GPS/rede e não atualizar lógica de tempo por frame. Transições visuais mantêm legibilidade, redução de movimento e lifecycle. **Retirar botões manuais de atmosfera da UX principal.** Os trechos históricos acima que mencionam alternância manual na interface devem ser interpretados como anteriores a esta decisão.

**Gate:** BF-4E não pode ser fechada com a experiência de painel inicial. Auditar a nova implementação e repetir inspeção no Moto G06, incluindo toques nas dez famílias, segredo por toque, noite/dia/evento, fallback textual, registros reais, orientação e background/retorno.
