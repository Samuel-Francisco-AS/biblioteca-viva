# ADR-013 — BF-4F com quatro habitantes e conversação RPG ramificada

- **Estado:** aceita para escopo criativo e contrato de produto, sem implementação
- **Data:** 2026-11-02
- **Complementa/atualiza:** ADR-012 (somente quantidade inicial e formato de diálogo da BF-4F); preserva ADR-008–011 e o restante da ADR-012
- **Concepção canônica:** [BF-4F — Bíblia dos quatro habitantes](../BF-4F_CONCEPCAO_HABITANTES.md)

## Contexto

A ADR-012 e o plano BF-4A citavam **três habitantes iniciais** e conversação textual contextual offline por intenções conhecidas. Depois de concluir BF-4E, o usuário aprovou quatro personagens sobrenaturais nomeados, com personalidades, aparências, rotinas, relações e histórias específicas, e preferiu **conversação do tipo quest de RPG** a uma LLM.

## Decisão

1. O alvo inicial e o gate BF-4F passam a exigir **quatro habitantes completos**: **Samael** (espírito demoníaco, 2,00 m, tecnologia, fogo/sombra e noite), **Aryn** (elfa, 1,70 m, luz, cura/reparo e dia), **Ytha** (fada, 1,70 m, asas de borboleta, plantas/ficção e cura) e **Lua** (maga imortal, 1,60 m, desenho/magia instável e necessidade de companhia). Silhuetas e expressões distintas, sem reciclar a mesma figura por recoloração.
2. Conversa é **local, textual e ramificada** com 3–4 alternativas predefinidas por nó decisório, escolhas com condições e efeitos autorizados, histórias próprias e compartilhas, relação contextual e recuperação de falhas. Não exigir campo livre, modelo generativo, provedor pago, internet ou NLP de intenções abertas.
3. O comportamento autônomo utiliza estados/prioridades/rotas e percepção de eventos autorizados, com **relação mútua e evolução efêmera entre os próprios habitantes**; não se limita à presença de jogador. Diálogos e quests não alteram os seis tipos de registro nem dados pessoais.
4. A BF-4F deve alcançar o **mundo completo dos cinco cômodos**, com animações variadas, gestos próprios, interação BF-4E, integridade de seleções, F5, React acessível e ownership/lifecycle. Quatro quests individuais e uma quest compartilhada por todos são o alvo de narrativa da etapa; mais histórias poderão ser refinadas em fases futuras.
5. Permanecem condicionais a seleção final de ferramenta de rigging e eventual extensão ADR-010, escolha de assets, gates físicos e visuais, BF-4G, TalkBack e dívidas CI #4/#11. Esta ADR **não aprova implementação nem merge**, apenas documenta o escopo criativo autorizado.

## Consequências

Toda referência operacional a “três habitantes” na BF-4F é substituída pelo objetivo de **quatro**. Os trechos anteriores são histórico, não autorização para reduzir escopo sem nova decisão. Em vez de um chatbot, o Codex deverá planejar um **motor pequeno de diálogo/quests tipado e testável**, capaz de acionar animações/objetos e seguir caminhos diferentes, sem escrita arbitrária nem persistência obrigatória. Dados de quest e memória começam efêmeros.

As fichas, seis relações, quests, animações e gates estão detalhados no [documento canônico BF-4F](../BF-4F_CONCEPCAO_HABITANTES.md).

## Complemento de planejamento técnico — 2026-11-02

O usuário decidiu **não criar etapa autônoma de preflight para personagens**, devido ao custo de horas e cota Codex. A BF-4F executará **F1–F4 diretamente**. A validação de autoria, articulação, rigging/GLB, animador, normalização e descarte integra a produção de um dos **quatro personagens definitivos durante F1**, reaproveitando material na entrega. Essa escolha **não dispensa** verificações essenciais de compatibilidade/licença/ownership, nem autoriza promoção de GLB animado fora do perfil ADR-010 sem extensão localizada com evidência. O [plano técnico BF-4F](../BF-4F_PLANO_TECNICO.md) é o guia de implementação; ainda não há código BF-4F produzido por esta decisão.
