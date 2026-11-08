# ADR-026 — Oficina, imagens do Relicário e troca autoral

- Data: 08/11/2026.
- Estado: implementação candidata BF-5.6B, dependente da PR #43; aceite e integração pendentes.
- Complementa ADR-020/025. Autorização específica do proprietário para B, com gate físico conjunto A+B; não autoriza C–G.

## Decisão

O Arcanário abre pela rota React `/arcanario/*`, carregada sob demanda, com entradas no painel acessível da Biblioteca e na Coleção. Mantém o dock e o WorldHost residente; não acrescenta Canvas/WebGL. URL identifica salas, cartas, baralhos e rodadas. O Voltar Android existente percorre esses níveis. Textos, formulários e controles são semânticos.

A Oficina cria/edita somente flashcards e lembranças. Campos opcionais de apresentação são parte do conteúdo versionado: tema (`astral`, `verdant`, `ember`, `parchment`) e moldura (`constellation`, `herbarium`, `illuminated`); flashcards aceitam título, lembranças categoria e referência de imagem. Dados anteriores sem apresentação continuam válidos. O fólio preserva apresentação ao editar frente/verso. Questões, filtros dinâmicos, criaturas e combate não recebem editores/motores nesta etapa.

`ArcanariumWorkshop` grava carta/versão, imagem, vínculos de Estudos e associações alteradas de baralhos na mesma transação. Revisões esperadas impedem sobrescrita inadvertida. Eventos de Estudos saem depois do commit. Conflito conserva o rascunho e exige a escolha explícita da base atual antes de aplicar textos preservados. Rascunhos são recuperação privada local (localStorage, chave por banco/carta/família), sem modificar acervo, settings ou backup; há aviso se o armazenamento falhar e descarte explícito. Não há sincronização de rascunhos.

Dexie **v16** acrescenta somente `cardMedia`, chave `&id`, índice `cardId`. A tabela de capas `media` mantém seu contrato/ownership. Cada imagem pertence a uma carta global de lembrança, com identidade própria e bytes imutáveis; nunca é compartilhada por proprietários distintos. A preparação existente aceita JPEG/PNG local até 10 MiB e 24 MP e reencoda em JPEG até 1600 px/350.000 caracteres de data URL. A fronteira de persistência/importação confere assinatura, dimensões, tamanho e ownership. URLs remotas/SVG/HTML/scripts não são conteúdo executável permitido.

Retirar/trocar imagem afeta somente a revisão atual. Bytes referenciados por qualquer versão histórica são conservados, inclusive após arquivamento; excluir a origem ou baralho não os remove. A coleta transacional remove apenas imagens sem referência em nenhuma revisão. Não há coleta destrutiva de versões. Essa retenção consome o backup deliberadamente.

Backup **v8** inclui `data.cardMedia` obrigatório nas novas exportações, mais todo o grafo v7. Importa v6/v7 originais (sem esse campo), validando checksum antes do replace/promoção. Mídias ausentes, sem proprietário ou duplicadas são rejeitadas; falha de escrita após clear reverte tudo. O limite de **10 MiB não muda**: excesso é erro explícito, nunca truncamento ou exclusão automática de imagens. Não há downgrade suportado.

Troca local autoral é um formato separado: `biblioteca-viva-author-deck`, `formatVersion: 1`, `data` com nome, cartas ordenadas e mídias necessárias, integridade SHA-256 sobre JSON canônico. Limites de 500 cartas/10 MiB; schemas estritos e referências conferidas antes da transação. Só baralhos estáticos autorais com Ecos/lembranças ativos são exportáveis; versões fixas são resolvidas para o conteúdo efetivamente referenciado. Cada importação cria uma nova cópia completa com IDs locais novos e mídia própria, revisão inicial 1. Colisões abortam e falhas intermediárias revertem o lote. Importar novamente cria outra cópia, informado na prévia. Não há modo de preservar identidade nesta versão.

A troca não transporta sessões, revisões históricas, Estudos, IDs de registros relacionados ou proveniência privada. A exportação de uma carta compartilhada inclui seu conteúdo no arquivo; não cria dependência do outro deck. Backup pessoal, diferentemente da troca, conserva todo o histórico/vínculos. Não há download, catálogo remoto, pacote oficial, compartilhamento automático ou código de efeitos.

Ecos seguem a ordem estática, usando referências de revisão imutáveis da A; a posição é o número de respostas confirmadas. Revelar/animação não grava nem avança o domínio. Resposta sequencial é persistida antes da UI avançar; sessões incompletas são retomáveis sem depender do deck vivo. Contagens/histórico são derivados; não há agenda espaçada nem inferência de domínio.

## Consequências

A avaliação artística, ergonomia, TalkBack, lifecycle e fluidez no Moto G06 continuam gates humanos. B e A permanecem abertas em PRs distintas até aceite/integração expressos, na ordem A → B. [Relatório e roteiro conjunto](../BF-5_6B_OFICINA_COLECOES_IMPLEMENTACAO.md).
