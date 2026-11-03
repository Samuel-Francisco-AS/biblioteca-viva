# BF-5 — Tela Biblioteca: manifesto criativo e contrato funcional da exploração

- **Estado:** direção criativa aprovada como base de planejamento; contrato conceitual/funcional da tela principal **proposto para refinamento**, não implementação iniciada nem design final homologado
- **Data:** 2026-11-03
- **Escopo:** primeira tela discutida da BF-5 — rota **Biblioteca** no APK Android
- **Base observada:** capturas do APK vigente fornecidas pelo usuário (tela com canvas dentro de card, diagnóstico local, seleções, listas de seis tipos, botões convencionais e dock inferior)
- **Autoridades:** [ADR-014](decisions/ADR-014-replanejamento-pos-bf4.md), [ROADMAP](ROADMAP.md), [STATUS](STATUS.md), [UX](UX.md), [ACCESSIBILITY](ACCESSIBILITY.md), [ART_DIRECTION](ART_DIRECTION.md)
- **Método da BF-5:** grande reforma de interface integrada, seguida de refinamentos orientados pelo aceite humano. **Não decompor a reforma em pequenos checkpoints obrigatórios.**

> **Tese criativa:** a Biblioteca Viva não deve mais parecer um aplicativo que exibe um cenário 3D. Sua tela de entrada deve parecer **um mundo vivo que se deixa explorar** — um espaço acolhedor, misterioso e lúdico, com vocabulário visual e interativo de RPG mobile. O software convencional continua útil, mas deixa de comandar a apresentação da experiência.

## Parte I — Manifesto criativo

### 1. De página funcional a lugar habitado

Entrar na Biblioteca deve transmitir a sensação de **chegar a um lugar**, e não a uma página longa. O ambiente ortográfico estilizado, seus cinco cômodos, livros, objetos reativos e quatro habitantes não são uma ilustração decorativa de um formulário: são a presença central da experiência.

A reformulação da tela Biblioteca é o **primeiro gesto visível de uma possível evolução para um game/RPG estilizado**, sem afirmar que a conversão total em jogo já foi decidida ou implementada. Elementos de exploração, RPG narrativo, curiosidade, resposta ao toque e encenação substituem a gramática visual de dashboards. O resultado desejado é contemplativo quando nada acontece e expressivo quando algo acontece.

**Princípio:** o mundo apresenta possibilidades; a interface aparece para ajudar a vivê-las e recua quando deixa de ser necessária.

### 2. Identidade, não maquiagem de aplicativo

Não basta trocar cores de cards ou arredondar botões. Criar uma linguagem de interface própria da Biblioteca Viva, coerente com a fantasia sóbria, madeira, latão, pergaminho, marfim quente, verde profundo e magia contextual já presentes na direção artística. Essas referências são **ponto de partida**, não paleta final nem tema imutável. Evitar duas armadilhas: HUD genérica de jogo mobile e ornamentação fantasiosa que prejudica legibilidade.

A experiência deve comunicar cuidado artesanal: hierarquia clara, animações intencionais, espaços de respiro, respostas visuais expressivas e tipografia confortável. O usuário deve reconhecer o estado da interação sem precisar ler instruções extensas.

### 3. Gamificação como comportamento, não como pontuação

A orientação RPG se traduz primeiro em **ações com significado**: explorar, observar, conversar, examinar, descobrir, escolher e perceber consequências. Não presumir introdução de XP, moedas, streaks, combate, inventário persistente, níveis ou economia. Essas mecânicas exigiriam decisões posteriores próprias, caso façam sentido ao produto.

O mundo não deve exigir que o usuário aprenda menus escondidos para descobrir sua função. A interface deve criar curiosidade sem sacrificar previsibilidade.

### 4. Ambição criativa primeiro; conforto sempre

Nesta etapa **não usar medo especulativo de performance como filtro de criatividade**. Conceber a experiência desejada; avaliar e otimizar problemas reais posteriormente, sem esconder riscos ou ignorar estabilidade e integridade. O Moto G06 é o dispositivo principal de validação visual e ergonômica humana, não um teto imaginário que obriga a reduzir a proposta.

A expressão artística não compete com acessibilidade: uma interface limpa e imersiva também deve admitir leitura sem canvas, controles equivalentes e menor movimento. A alternativa acessível não precisa ocupar a tela o tempo todo para continuar existindo.

### 5. Promessa ao usuário

A tela principal deve permitir chegar, olhar, tocar, compreender o que respondeu e continuar. A **Biblioteca é o mundo**; a **Coleção é o lugar de administrar registros**. Nenhuma dessas funções deve sequestrar a outra.

## Parte II — Contrato funcional da nova tela principal

### 6. Transformação estrutural

**Decisão de direção já expressa pelo usuário:** remover da superfície principal a apresentação longa baseada em card, permitir que o **canvas ocupe toda a área visual disponível** (edge-to-edge perceptivo), e manter **somente o dock inferior como elemento de navegação persistente**, com identidade estilizada de game.

**Composição pretendida por camadas:**

1. **Mundo 3D / exploração:** viewport dominante, sem moldura/card interno nem página rolável de listas sobre ele. React/WorldHost/ThreeWorldRuntime continuam separados pelas fronteiras existentes.
2. **Dock inferior:** navegação persistente por Biblioteca, Coleção, Arquivo, Resumo e Ajustes. Tratamento de game/HUD, não bottom nav genérica; destaque da aba ativa inequívoco.
3. **HUD contextual e transitória:** nome de alvo, sinal de interação, feedback, breve objetivo/evento e outras indicações apenas **quando úteis**. Não criar cabeçalho informativo volumoso ou indicadores permanentes sem necessidade.
4. **Superfícies de interação:** painéis/overlays de seleção, conversa, ações, descoberta e diário aparecem por gatilho concreto, conservando o mundo perceptível ao fundo quando possível.
5. **Alternativa semântica/fallback:** funções essenciais disponíveis por controles React acessíveis e em condição sem WebGL, sem voltar a impor um painel técnico sempre expandido durante a exploração normal.

**Alcance de “tela cheia”:** o desenho deve respeitar áreas seguras, status/navigation bars do Android, teclado quando aplicável e hit testing do dock. O canvas pode ser visualmente renderizado atrás da HUD, mas não deve receber toques que pertençam ao dock ou ao sistema. Não inferir que a remoção de cards autoriza esconder controles necessários do sistema operacional.

### 7. O que desaparece da apresentação principal e para onde vai

| Elemento visível hoje | Tratamento pretendido |
| --- | --- |
| título, descrição introdutória e grande card “Registros da Biblioteca” | deixar de ocupar a tela explorável; orientação inicial curta ou contextual, se necessária |
| canvas confinado em uma caixa responsiva dentro da página longa | cenário protagonista, ocupando viewport visual da Biblioteca |
| diagnóstico local com FPS/triângulos/chamadas/GLB | mover para **Ajustes → Diagnósticos** ou superfície técnica sob demanda; manter capacidade diagnóstica |
| listas longas por livros, filmes, séries, estudos, atividades físicas e trabalhos | navegação e gestão na **Coleção**; acesso contextual aos registros representados no mundo continua possível |
| botões permanentes de seleção Anterior/Próximo e catálogos React expansíveis | substituí-los visualmente por mecanismos de exploração e oferecer **alternativa semântica acionável**, sem perder cobertura de alvos ou seleção |
| botões convencionais “Abrir Coleção” e “Criar registro” no rodapé do card | navegação pelo dock e ação de criação no fluxo convencional da Coleção |
| painel extenso de diálogo/pergaminho sempre competindo com a cena | apresentação narrativa dedicada em estado de diálogo, legível e com escolhas acessíveis |

Essa tabela define **mudança de lugar e aparência**, não remoção de dados, eventos, handlers, casos de uso ou fallback. Os seis tipos de registro e seus IDs continuam integrais; overflow de objetos não pode impedir o acesso por Coleção.

### 8. Estados principais da interface

| Estado | O que vê | Entrada | Saída |
| --- | --- | --- | --- |
| **Exploração** (padrão) | mundo como protagonista + dock inferior; nenhuma ficha grande aberta | abrir Biblioteca, fechar overlay, voltar de subestado | tocar alvo, abrir outra aba ou acionar informação contextual |
| **Alvo em foco** | destaque do alvo, nome curto, indicação de ação disponível; sem bloquear todo o canvas | tap válido em alvo | cancelar/tocar vazio, abrir ação, iniciar diálogo, trocar alvo |
| **Interação contextual** | ação principal visível e, se houver, alternativas breves | ação sobre objeto/registro/habitante elegível | efeito + feedback; retornar à exploração ou mudar para diálogo/evento |
| **Diálogo RPG** | personagem/falante em evidência, fala legível, 2–4 escolhas conforme nó narrativo, controles de avançar/adiar/sair | convite de conversa ou evento explícito | avançar nó, adiar, terminar, voltar |
| **Evento/quest/descoberta** | feedback de acontecimento, pista ou consequência; diário consultável por invocação contextual | gatilho já existente da experiência | confirmação breve ou continuação da exploração |
| **Alternativa acessível/fallback** | controles/descrições React com todas as funções essenciais, inclusive sem WebGL | opção de acessibilidade, teclado/leitor de tela, indisponibilidade do renderer | retorno à exploração quando possível, sem perda injustificada de dados convencionais |

**Sobreposição de estados:** definir prioridade explícita (por exemplo, diálogo acima de seleção e acima de dicas), fechamento previsível, restauração de foco e cancelamento seguro. Evitar simultaneamente diálogo, ficha de objeto e várias dicas flutuantes. Não permitir que toque no dock acione objeto no canvas.

### 9. Gramática das interações — proposta inicial, ainda refinável

- **Tap no objeto vivo:** manter a intuição já aprovada na BF-4E de **ação primária diretamente no canvas** e feedback imediato. Não impor obrigatoriamente um segundo clique antes de toda interação.
- **Tap no habitante:** selecionar/reconhecer o personagem e oferecer caminho visível para conversar; diálogos iniciam apenas quando a intenção estiver clara. Animação, identificação ou posicionamento do painel não devem provocar abertura acidental.
- **Tap em registro representado:** reconhecer a instância e permitir abrir seu registro pelo `entryId` existente, preservando a integridade do vínculo e sem obrigar navegar por longa lista.
- **Tap no vazio:** desfazer o foco transitório quando não há ação/quest em andamento.
- **Pan/pinch/zoom:** manter exploração tátil do mundo e distinguir gesto de arrasto/zoom de tap, sem regressão de câmera, seleção ou orientação.
- **Ação contextual compacta:** quando um alvo admitir múltiplas ações, preferir uma principal clara e poucas secundárias; uma ficha leve pode surgir perto da região de alcance do polegar, não necessariamente ao redor do alvo que pode ficar no topo.
- **Toque longo/menu radial:** hipótese visual **opcional**, não decisão obrigatória; não esconder ação essencial atrás de gesto longo, preciso ou secreto.
- **Feedback:** selecionar, agir, falhar ou descobrir deve produzir sinais proporcionais e verificáveis — visual, texto e quando apropriado áudio/háptica, sem depender exclusivamente de nenhum deles.

**Uma hipótese promissora de UX:** “tap para explorar/agir; comandos adicionais quando fizerem sentido”. A mecânica exata por classe de alvo será fechada no planejamento da experiência, **não inferida deste documento como APIs já aprovadas**.

### 10. Diálogos, escolhas e narrativas em linguagem de RPG

O diálogo deve ser percebido como uma cena narrativa e não um chat/formulário. Apresentação sugerida: painel de leitura ancorado na porção confortável do viewport, nome de falante, potencial retrato/expressão, fala com excelente contraste e escolhas claras; tratamento de luz/dim leve no cenário quando favorecer a concentração.

- Preservar os grafos narrativos locais existentes, os cinco arcos já criados, adiamento/retomada e o diário de sessão conforme contrato vigente.
- Manter narrativa textual íntegra quando WebGL indisponível ou movimento reduzido.
- Evitar rolagem que esconda respostas sob o dock; ajustar altura e rolagem **dentro da superfície narrativa**, com ações essenciais sempre alcançáveis em retrato e paisagem.
- Em retrato, a composição não precisa mostrar sempre toda a cena; deve, porém, preservar contexto de personagem e uma saída confortável. Em paisagem, avaliar leitura ao lado da cena sem copiar mecanicamente o layout atual.
- Não antecipar nova engine de quests, mudanças de consequência, novos episódios, persistência narrativa ou LLM: a BF-5 reforma a **apresentação e condução de interação**; aprofundamento do sistema de RPG é objetivo da **BF-6**.
- A escolha deve informar claramente resposta/consequência percebida, inclusive por texto acessível quando os efeitos 3D ou mágicos não forem vistos.

### 11. Dock, zonas de alcance e orientação

O dock é o elemento estrutural mais presente: **Biblioteca, Coleção, Arquivo, Resumo e Ajustes** permanecem os destinos conhecidos, embora ícones, acabamento, espessura, espaço, estados e rótulos possam ganhar personalidade. Renomear seções para “Códice”, “Jornada” etc. é **possibilidade em aberto**, não decisão aprovada. Não inventar abas ou caminhos externos.

- Preferir área inferior para ações frequentes e manter ícones/rótulos compreensíveis sem depender só de cor.
- Produzir um dock com personalidade fantástica discreta (materiais, brilho ou microanimação intencional), sem virar uma placa pesada que consome a cena.
- Respeitar alvos de toque, safe area inferior, contraste e teclado; não cobrir texto, escolhas ou modais.
- Retrato e paisagem devem receber composição intencional, não mera rotação que espreme ou tapa controles.
- Durante diálogo/modal, decidir no design se dock fica perceptível, recolhido ou visualmente subordinado; **a navegação deve permanecer recuperável e não acionar rotas por erro**. “Dock como única navegação persistente” não significa que ele precise competir com cada cena cinematográfica.

### 12. Contratos de acessibilidade e preservação funcional

A remoção da interface técnica exposta **não** remove seu papel essencial.

- Todas as funções essenciais continuam acessíveis em HTML/React sem depender exclusivamente de canvas, gesto preciso, animação, áudio ou cor; caminho alternativo deve ser **descobrível**, e não apenas escondido em DOM sem acesso real.
- Preservar seleção bidirecional pelo catálogo/IDs estáveis (`modelTypeId`, `instanceId`, `entryId`), anúncio legível, foco semântico e retorno de foco após overlays.
- Manter estados de loading, erro, vazio e WebGL indisponível distinguíveis; falhar 3D não pode impedir Coleção nem o uso essencial da Biblioteca.
- Respeitar texto ampliado, movimento reduzido, contraste, leitura por TalkBack e Android Back/Escape; documentar dependências e verificar no build real.
- Não destruir dados nem alterar Dexie, backup ou persistência espacial para executar um redesign visual. O mundo de sessão continua efêmero conforme os contratos atuais.
- O histórico **TalkBack NOT RUN** permanece uma lacuna; esta concepção não o converte em PASS.

### 13. Limite entre BF-5 e BF-6 / caminho para um RPG

**BF-5** cria a **gramática visual e de interação do jogo possível**: mundo protagonista, HUD, menu contextual, diário/diálogo, animações de UI, feedback e conforto. **BF-6** poderá aprofundar efetivamente personagens, agência, efeitos, consequências e mecânicas narrativas. **BF-7** consolidará a integração, a acessibilidade e os gates de qualidade restantes.

A perspectiva de tornar a Biblioteca Viva um **game/RPG estilizado** é uma **direção estratégica e criativa a explorar**, não autorização para eliminar a natureza utilitária, renomear todas as abas, introduzir progressão artificial ou migrar engine. Decisões concretas sobre a identidade final de jogo e seus sistemas deverão surgir do planejamento posterior.

### 14. Critérios de apreciação para a macroreforma

O primeiro candidato integrado da BF-5 deve ser avaliado visual e funcionalmente, **em conjunto**, e refinado até aceite do usuário. Critérios pretendidos:

1. A primeira impressão é de **explorar um mundo** e não rolar cards técnicos.
2. Mundo e dock têm hierarquia clara, inclusive durante rotação e em viewport estreito.
3. Tocar em objeto, habitante e registro traz resposta legível, sem confusão entre seleção, ação e câmera.
4. Diálogo e escolhas não ficam cobertos pela navegação, funcionam com toque confortável e não interrompem indevidamente a exploração.
5. Seis tipos e registros fora da capacidade visual ainda são acessíveis pela Coleção; diagnóstico permanece encontrável sob demanda.
6. Alternativa semântica, fallback, Android Back, foco e redução de movimento continuam previstos e operáveis; TalkBack requer prova humana específica.
7. O visual é autoral, coerente e suficientemente elaborado; os ajustes posteriores buscam o **resultado esperado**, não um checklist cosmético mínimo.
8. Regressões técnicas reais são verificadas; a preferência criativa não autoriza mascarar CI, dados ou lifecycle.

**Gates e evidência:** usar verificações internas direcionadas durante a grande reforma, uma candidata integrada e avaliação física no Moto G06 com refinamentos subsequentes. Não impor vários pequenos checkpoints de entrega. Evitar otimização preventiva; se surgir gargalo concreto, medir e corrigir preservando o efeito desejado.

### 15. O que está decidido e o que ainda vamos escolher

**Direção já expressa pelo usuário e incorporada neste planejamento:** protagonismo do canvas em tela inteira, saída dos cards/listas/diagnóstico do fluxo principal, dock inferior estilizado como única navegação persistente, interações contextuais com sensação de RPG, ergonomia e estética criativa como prioridades, e evolução potencial da Biblioteca Viva em direção a game. BF-5 será uma grande reforma seguida de refinamentos.

**Propostas da Luna sujeitas a discussão/ajuste:** gatilhos específicos por tipo de objeto, layout exato dos prompts/fichas, posição de HUD contextual, retratos, tratamento de fundos, animações, forma de acesso à alternativa React, aparência final do dock, iconografia, tipografia, rótulos e comportamento do dock durante diálogos. Não tratar exemplos de menu radial, retrato ou nomes alternativos como funcionalidades aprovadas para implementação.

**Próxima decisão de planejamento:** explorar opções visuais para **esta tela Biblioteca** e seus estados (exploração, alvo, ação, conversa, evento e fallback), validar o que melhor traduz a ambição RPG e, só depois, desenhar o contrato visual completo das demais telas. **Sem código, APK, merge de produção, assets ou implementação autorizados por este documento.**

## Restrições, rastreabilidade e honestidade do estado

A BF-4/BF-4G foi encerrada no escopo dirigido com exceções. A CI integrada da PR #18 permaneceu **FAIL** (30 E2E PASS, 3 FAIL, 1 flaky); issues [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4), [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) e [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15), R-19, avaliação individual da cena de Lua, finais narrativos não totalmente validados, TalkBack e desempenho sustentado continuam com seus estados próprios. Nada nesta proposta transforma essas dívidas em correções, nem representa teste no Android ou redesign já realizado.
