# BV-UXC — Continuidade entre toque e ação

**Candidata de 09/11/2026 — PR draft separada, não integrada.**

## Intenção e decisão do proprietário

O objetivo não é simplesmente reduzir a latência absoluta ou diminuir a arte para o Moto G06. A sensação de tocar, selecionar, abrir diálogo ou atravessar um portal deve ser **um ato contínuo**, mesmo quando raycast, React, persistência ou inicialização de WebGL ainda precisem ocorrer. É legítimo usar uma transição de apresentação para sustentar a intenção do gesto. **Não mascarar erros funcionais, não fabricar um spinner longo, não impor espera fixa.**

## Implementação candidata

1. **Contato no Canvas da Biblioteca:** o próprio contêiner existente apresenta uma marca circular discreta via CSS no `pointerdown`, antes do raycast. Confirmação expande/dissolve, pan/pinch/cancelamento não deixam uma seleção fantasma. Sem novo Canvas, textura, luz, RAF próprio ou DOM por clique.
2. **Personagens/quests:** o painel de conversa passa a se revelar pelo deslocamento/opacidade em aproximadamente 205 ms. Conteúdo segue animado em 120 ms; título, foco, Adiar e semântica da sessão continuam presentes no commit.
3. **Dock inferior:** remoção do pré-carregamento no toque; ele permanece possível com hover de mouse. O toque confirma a intenção com o medalhão pendente e o véu visual antes do compromisso de rota. Navegação ocorre após uma fronteira de apresentação entre dois `requestAnimationFrame`, **não depois de um timeout cronometrado**. Links continuam normais para modificadores/nova aba. Alterar a intenção no mesmo intervalo cancela a anterior.
4. **Portal orbital do Duelo Arcano:** seleção preservada, véu imediato e navegação no mesmo contrato de frame. O agendamento é cancelado se a Biblioteca for desativada/desmontada; nenhum trabalho de gameplay/TCG/IndexedDB foi alterado.
5. **Links internos comuns:** um véu fixo sem captura de ponteiro/foco conecta a saída e a entrada; `App` reconhece mudanças de rota e remove o estado quando termina a animação. O conteúdo de destino continua livre para carregar em seu próprio tempo.
6. **Acessibilidade/lifecycle:** `prefers-reduced-motion` e preferência interna desativam animações e não esperam os frames de apresentação; ARIA, foco existente, botão Voltar, rotas e residência da Biblioteca preservados.

## Rodada R2 — intervenção na execução

O proprietário testou a R1 no Moto G06: a animação era perceptível, mas o engasgo após o toque permaneceu claro. **R1 não foi aprovada como solução de fluidez.** A R2 não amplia simplesmente o véu; modifica a execução:

- **Destaque 3D dos personagens e portal:** a seleção inicial conserva bounds precisos, mas o efeito decorativo acompanha a matriz de transformação usando envelope conservador estável, sem revarrer/skinnar a malha de todos os personagens a cada frame. Picking e o resultado da seleção seguem precisos. Possível trade-off: o contorno pode ficar um pouco mais amplo que asas/braços em movimento extremo.
- **Gestos:** na montagem real do mundo, o `pointerup` reconhece a intenção e permite a pintura de feedback; só depois o raycast e as notificações React rodam, sem um atraso de tempo fixo. Se outro gesto começar ou o mundo pausar, a seleção pendente é cancelada. O modo diferido é habilitado pelo WorldHost real e não altera o default dos runtimes de teste; foram adicionados dois cenários para o modo diferido. Movimento reduzido evita adiamento.
- **Pausas de rota:** loop 3D para imediatamente, mas a serialização dos agentes aguarda a ociosidade do navegador, com fallback por temporizador curto somente sem `requestIdleCallback`. As garantias de checkpoint imediato em ocultação, `pagehide` e descarte persistem; retorno antes da captura cancela o trabalho antigo.
- **Arcanário:** separação da importação dos duelistas, arena, cartas, biblioteca de provas, oficinas e outras salas em chunks lazy. O portal deixa de carregar todos esses componentes no primeiro acesso e há um fallback visual acessível enquanto a sala solicitada é carregada.

**Limite técnico:** o raycast preciso ainda exige CPU quando finalmente executado; estas mudanças removem a concorrência com o evento inicial e o custo visual repetido, mas não garantem que nenhum quadro isolado será longo. R2 ainda não foi medida no Moto G06. O estado é **candidata**, não correção certificada.

## Limites do que foi confirmado

- **Confirmado:** inspeção do código da `main`, preparação das modificações em branch separada, commit remoto e adição de testes de interface e de gesto. A mudança é isolada em apresentação/navegação, sem alteração de schema, arte de personagens, regras de quest ou motor do duelo.
- **Ainda não confirmado:** execução dos novos testes, `typecheck`, lint, build, E2E e instalação física. Ações de CI não devem ser solicitadas por causa da cota esgotada; commits da candidata usam `[skip ci]`. A existência dos testes **não equivale a PASS**. Nenhum ganho de FPS, redução real de long tasks ou desaparecimento de travamentos pode ser declarado sem evidência.
- **Dívida conhecida preservada:** picking/skinning e highlight 3D ainda possuem custo síncrono; esta rodada sustenta a continuidade visual, mas não reivindica eliminação definitiva do custo. Problemas de timeouts orbitais, CI e BF-5.6G continuam independentes.

## Gate físico proposto — Moto G06

Repetir o toque em cada um dos quatro habitantes e a abertura/fechamento de diálogos (incluindo toques consecutivos); o primeiro sinal deve aparecer antes do painel, sem quadro congelado aparente ou diálogo duplicado. Alternar Biblioteca ↔ Coleção/Arquivo/Ajustes pelo dock, repetindo rapidamente e usando Voltar. Entrar pelo grimório/lua orbital no Arcanário, sair e retornar; conferir se o cenário residente volta corretamente e se o duelo não perde estado. Exercitar pan/pinch, toque cancelado, retrato/paisagem, segundo plano/retorno, toque no vazio e redução de movimento. Registrar **suavidade percebida, qualquer engasgo residual e regressões**, separadamente dos testes automatizados.

**Critério de aceite:** sensação contínua no Moto G06, sem toques perdidos, gestos fantasmas, sobreposição persistente, bloqueio de interface ou quebra de dados. Proprietário decide aceitação/merge somente após seu gate; sem integração automática da PR e sem declarar encerramento de BF-5.6G.


## Rodada R3 — eliminar geometria de toques no vazio

**Evidência física R2 (Moto G06):** melhorou, porém um toque no vazio ainda interrompe a conclusão do halo; cliques rápidos em áreas vazias também afetam o movimento do mundo e dos personagens. Portanto, a R2 tampouco é considerada concluída.

**Achado no código:** `ThreeWorldInteraction.pick()` chamava `updateMatrixWorld(true)`, preparava todas as `SkinnedMesh` com `computeBoundingBox()` e `computeBoundingSphere()` e executava `intersectObjects()` para todos os roots. Isso ocorria até quando não havia nada sob o toque.

**R3:**

- Novo `worldPickBroadphase.ts`: pré-calcula envelopes conservadores de objetos estáticos fora do gesto; para habitantes, usa os limites de animação já medidos (`INHABITANT_ENVELOPES`) e a posição atual, sem consultar vértices articulados.
- Na versão Android real, primeiro filtra os roots que o raio sequer poderia tocar. Somente os candidatos passam pelo raycast original, incluindo prioridade, profundidade, oclusão e seleção exata. Objetos sem limite confiável continuam no caminho preciso, evitando falsos negativos; objetos com geometria substituída devem invalidar o envelope.
- Em toques claramente vazios, nenhuma preparação de esqueleto nem raycast de triângulos é feita. A seleção ampliada das pequenas peças vivas continua disponível.
- O halo passa imediatamente a `released` no `pointerup`, independentemente da conclusão do raycast. O cálculo do alvo ainda ocorre após oportunidade de apresentação e pode ser cancelado por outro gesto.
- Diagnóstico mínimo por Canvas: `data-pick-candidate-roots` e `data-pick-skipped-roots` permitem conferir se a poda realmente foi ativada.
- O modo é opt-in só no mundo do aplicativo; testes históricos de resultado exato continuam com o caminho antigo, e três novos testes cobrem descarte de miss, alvo movido e seleção aninhada.

**Limites:** isto é uma intervenção concreta, mas não demonstra FPS/latência sem teste no Moto G06. Envelopes conservadores dos habitantes devem ser conferidos nas animações mais expansivas e nas diferentes escalas da câmera; a malha continua exata quando candidata. Não há CI nem build local nesta operação remota. **Não aprovar merge sem gate R3**.
