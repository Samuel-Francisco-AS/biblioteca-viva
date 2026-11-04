# ADR-018 — Entretenimento: agrupamento visual, catálogo e mídia local

- Estado: implementada como candidata BF-5 Parte 2D, por solicitação explícita do proprietário; sem aceite físico/artístico.
- Data: 2026-11-04.
- Complementa ADR-008/009/011/014–017. Não autoriza merge, fechamento BF-5 ou BF-6.

## Decisão

Entretenimento é um agrupamento de apresentação, nunca um novo discriminante persistido. `movie` continua obra unitária; `series`, episódica. A interface oferece Filme, Série, Anime e Animação; os dois últimos exigem escolher estrutura no cadastro. Editar uma obra preserva a estrutura original, inclusive ao mudar sua classificação visual. Os registros anteriores, sem `catalog`, são lidos como Filme ou Série.

Os cinco grupos visíveis da Coleção, cadastro, Arquivo e Resumo usam a mesma ordem. Filtros antigos `movie`/`series` continuam reconhecidos. Estatísticas conservam seis chaves técnicas; a consulta aditiva `entryGroup: "entertainment"` agrega os dois tipos sem duplicar registros, sessões ou timeline. Biblioteca/Canvas mantêm suas seis projeções técnicas.

`catalog?` contém somente metadados opcionais convencionais. Estados globais não mudam: Quero assistir/Aguardando lançamento usam `planned`; Assistindo/Reassistindo usam `in_progress`; demais correspondem aos estados existentes. `intent?` distingue expectativa/reassistida e só é apresentado quando compatível com o estado atual. `wishlist?` é independente de favorito e do estado; sua ausência usa `status === "planned"`. Listas podem se sobrepor sem cópias da entidade. `SaveEntertainment` relê em transação, exige revisão esperada e publica evento depois do commit; a regra específica de acompanhamento fica no domínio.

A estreia é uma data civil ISO, informada manualmente. A contagem compara ordinais de datas civis, sem dividir a duração entre meias-noites locais, evitando efeitos de fuso/DST. Montagem, retorno de visibilidade/Activity e atualização local de 30 segundos reconciliam o dia; não há consulta externa, tarefa garantida em segundo plano ou calendário editorial. A estreia não converte automaticamente o estado escolhido pelo usuário.

## Mídia e backup

Dexie **v12 aditiva** parte da v11 e acrescenta apenas `media: &entryId`: uma imagem de poster por obra proprietária. As nove tabelas anteriores, IDs, revisões, datas, sessões e histórico não são reescritos. Nada é colocado nos objetos ou snapshots do mundo.

JPEG/PNG locais entram com limite de 10 MiB e dimensão declarada até 24 megapixels, inspecionada antes da decodificação. A imagem é redesenhada localmente, removendo metadados do arquivo original, com maior lado até 1600 px, em JPEG de até 350.000 caracteres de data URL (aproximadamente 256 KiB binários). Imagens que não couberem são recusadas com feedback, sem apagar o poster anterior. SVG, URLs remotas, MIME incoerente e payloads inválidos são recusados. O codec revalida inclusive as dimensões no cabeçalho JPEG, além do tamanho e formato.

Ownership é exclusivo por `entryId`; `put` substitui somente o poster daquela obra, e exclusão em transação remove somente a mídia do registro excluído. Não há arquivo órfão compartilhado, deduplicação global nem coletor que possa remover a imagem de outra obra. Falha de poster após criar a obra mantém o registro e permite repetir apenas a imagem ou abrir a obra salva, evitando duplicação.

Backup permanece **v6**, com `data.media?` opcional e validado, ordenação determinística, checksum e verificação de ownership/duplicatas. A extensão contém somente o JPEG já reduzido, em coleção separada, sem fontes originais ou banners. Backups v6 antigos, sem `media`/`catalog`, continuam aceitos com seu checksum original. A restauração protegida substitui dados e posters na mesma transação; backup antigo restaura sem posters, sem reaproveitar acidentalmente imagens do destino. O limite global de 10 MiB permanece: muitos posters podem impedir a exportação, com erro explícito, sem truncamento ou descarte silencioso. Não há downgrade garantido para APK antigo.

A escolha de JPEG limitado numa tabela separada simplifica ownership e backup atômico, sem introduzir arquivos externos difíceis de restaurar, dependência, backend ou permissão ampla. O custo é ampliação do backup; arquivo de mídia separado/backup multipartes permanece possível trabalho futuro, sem contrato especulativo nesta entrega.

## Compositor

Canvas 2D desenha uma peça própria, independente do DOM/display: PNG **1080 × 1350** (4:5) ou **1080 × 1920** (9:16). Noturno editorial e Estreia celestial mudam a composição/alinhamento. Gravura local, poster e fundo fornecido pelo usuário recebem recorte central, degradê escuro, cobre, molduras, poeira estelar e tipografia. Texto excessivo produz erro legível em vez de exportação cortada.

A prévia é o próprio PNG; alterações invalidam a entrega até a nova imagem ficar pronta. Os quatro modos incluem apenas título, formato e dados próprios do modo (estreia/contagem, progresso ou avaliação), além da mensagem editada explicitamente. Notas/citações não são consultadas pelo compositor. Fundo personalizado e PNG são efêmeros, não entram em entidades, banco ou backup; o poster só entra quando escolhido para a composição. Sem imagens remotas ou inferência de licença de distribuição.

Reutiliza `ImageFilesPort`, Share/Filesystem existentes e o plugin local `ImageDocument` da Parte 2. O nome permitido `biblioteca-viva-cinema.png` é aditivo aos nomes de livros; o salvamento Android permanece SAF, `image/png`, sem permissão ampla. Cancelamento, API indisponível e falhas de leitura/espaço/entrega preservam a possibilidade de tentar novamente. Contratos automatizados não provam recebimento, permissão percebida ou funcionamento físico do seletor.

## Consequências e evidência

Nenhum `entryId`, `instanceId`, `modelTypeId`, namespace, ordenação espacial, renderer, seleção ou contrato de filme/série foi substituído. Teste compara snapshots antes/depois da classificação e mantém regressões de projeção e arquitetura. Não se migram objetos de usuário nem se persiste posição.

[Relatório, limites, capturas e roteiro Moto G06](../BF-5_PARTE2D_ENTRETENIMENTO.md). Limites físicos, TalkBack, teclado Android, arte e fluidez continuam sujeitos à rodada humana acumulada da BF-5. Sem CI global verde por implicação desta ADR.
