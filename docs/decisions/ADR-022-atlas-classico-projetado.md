# ADR-022 — Atlas clássico projetado

- Data: 2026-11-05.
- Estado: candidata de refinamento da BF-5, por solicitação expressa do proprietário após rejeição artística do atlas articulado.
- Substitui somente a apresentação de Atlas Vivo da ADR-021; Empreitadas, avaliações, perfil físico, MET e persistência permanecem vigentes.
- Branch da PR draft #30, base desta revisão `750dcf53046892d559a23a0b2ae30753ff23b36e`.

## Decisão

Remover `BodyStudy`, `atlasMotion`, testes de poses, rig SVG, loop RAF, controles de movimento e `living-atlas.css`. O app não depende dessas estruturas. A gravura estática anterior à Parte 2F permanece como asset histórico, sem consumo pelo novo atlas.

`ClassicAtlas` apresenta seis artes raster originais, três masculinas e três femininas: frontal, três quartos e estudo do passo. São gravuras assistidas por ImageGen, em sépia/ameixa/ouro, com figuras adultas vestidas, anatomia estilizada e construção geométrica. Os desenhos variam efetivamente; não são uma mesma imagem escalada. A seção mantém a arte protagonista no retrato e a coloca ao lado da estimativa diária em fólios largos. Sem engine, biblioteca ou dependência nova.

Cada prancha permanece por **8 segundos**. A próxima é carregada e decodificada antes da troca. Duas imagens se sobrepõem apenas durante uma dissolução de **1,8 segundo**, feita exclusivamente por opacidade CSS. Ao terminar, a anterior é removida. Não há animação de membros, transformação corporal, reconhecimento de exercício ou loop de frames JavaScript.

A rotação roda somente com a seção visível e a página ativa. IntersectionObserver e visibilitychange interrompem o ciclo; pausa manual e movimento reduzido do sistema/app mantêm uma única arte. É possível avançar manualmente, sem dissolução quando pausado ou sob movimento reduzido. Retomar inicia uma nova espera completa; não recupera um grande tempo acumulado de background. Pausar durante a dissolução preserva a prancha corrente.

Falha de leitura/decodificação tenta cada outra prancha local no máximo uma vez e mantém a anterior, com indicação concisa. Não há loop de retries, descarte de registro ou bloqueio das informações metabólicas. Falha na primeira arte tem estado de indisponibilidade e permite tentar a próxima. Falha do perfil usa a coleção padrão com aviso. Timers, observers e listeners são liberados; resultados assíncronos cancelados não substituem a imagem.

## Perfil, acessibilidade e dados

Em Automático, gênero masculino seleciona a coleção masculina e feminino a feminina. Ausência, Outro e Prefiro não informar usam o conjunto masculino, identificado na legenda e documentado como padrão editorial. A preferência visual manual já existente continua independente e prevalece sobre Automático, preservando a escolha do usuário. Não inferir anatomia individual a partir do gênero.

O perfil continua voluntário, local, editável/removível e incluído no backup. Somente peso participa do MET. Nenhuma fórmula, regra de treino, snapshot, campo persistido, discriminante ou projeção 3D muda. Dexie continua v14 e backup v6; nenhuma migração é necessária.

Imagens têm texto alternativo de coleção/estudo, a camada temporária é decorativa e não há região live anunciando continuamente cada troca. Controles são nativos, com foco visível e alvos ≥44 px. Informações de energia, duração, intensidade e link de perfil permanecem fora das camadas de imagem.

## Assets e evidências

Seis WebPs locais de 1024 × 1536, alpha preservado, codificados dos PNGs originais em qualidade 88 sem recorte/redesenho. [Prompts completos, origem e arquivos finais](../../assets/atlas-classico/README.md). Não há solicitação externa em runtime. A geração de arte não usou dados pessoais nem imagens do usuário.

[Relatório, verificações, capturas e roteiro Moto G06](../BF-5_ATLAS_CLASSICO_PROJETADO.md). Sem merge, fechamento BF-5, aceite artístico/físico, TalkBack humano ou declaração de CI global verde. A estabilidade/fluidez do novo atlas no Moto G06 precisa ser avaliada fisicamente.
