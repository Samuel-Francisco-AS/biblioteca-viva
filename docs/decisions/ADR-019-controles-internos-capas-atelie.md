# ADR-019 — Seletores internos, capas por registro e ateliê compartilhado

- Data: 2026-11-04.
- Estado: implementação candidata BF-5 Parte 2E, autorizada pelo proprietário; validação física pendente.
- Complementa ADR-014–018; não encerra BF-5 nem autoriza merge.

## Contexto e decisão

No Moto G06, o proprietário relatou superfície branca com símbolo azul ao escolher duração de foco e datas. A auditoria do checkout encontrou `<select>` e `<input type="date">` em formulários, fólios, sessões, filtros e Ajustes, além de datas produzidas por helpers. A causa no WebView/Android não foi comprovada. Não se atribui a todas as famílias o mesmo defeito: selects delegam opções ao navegador; datas delegam calendário; importação de arquivos e Share/SAF possuem contratos Android distintos e continuam necessários.

Seleções convencionais passam a `BVSelectSheet`: botão rotulado, opções em rádios DOM dentro de `<dialog>` na top layer, estado provisório, Cancelar/Confirmar. `BVDatePicker` oferece calendário mensal e entrada numérica de ano/mês/dia, validação de data civil, limites e ausência opcional. Valores de formulário mantêm strings anteriores (datas ISO civis); campos auxiliares participam de FormData/validação/reset sem receber foco de navegação. Duração continua 15/25/45 minutos e usa o mesmo seletor. Escolhas curtas existentes continuam rádios; o ateliê usa `BVChoiceGroup`.

A top layer cobre o dock, contém foco e permite rolagem em retrato/paisagem. Escape/Cancelar/Voltar fecham só a superfície superior e devolvem foco. O listener Android em capture verifica o último diálogo aberto antes de consumir o evento; guardas de rascunho permanecem na página. Teclado usa controles DOM e navegação nativa entre rádios, sem reconstruir uma interface externa. TalkBack, teclado, rotação e desaparecimento da tela branca reais exigem teste no Moto G06.

## Imagens

`RecordImage` / `RecordImagesPort` generalizam a porta anterior; `LocalPoster` / `PosterPort` continuam aliases de compatibilidade. Uma imagem por `entryId` para `book`, `movie` ou `series`, tabela `media: &entryId`. Não existem bytes nas entidades de domínio nem nas projeções 3D. Limites/validação da Parte 2D preservados: JPEG/PNG local, até 10 MiB e 24 MP, normalizado para JPEG até 1600 px e 350.000 caracteres de data URL; cabeçalho/dimensões verificados novamente na persistência e exportação.

Dexie **v13 aditiva**, mesmas dez tabelas/índices v12, apenas novo marcador; registros, posters, sessões e relacionamentos não são reescritos. O editor compartilhado permite escolher/pré-visualizar, salvar, substituir e preparar remoção, com confirmação por Salvar capa e cancelamento que preserva o persistido. Falha mantém o rascunho. A exclusão do registro continua transacional e remove somente sua mídia e dependentes anteriores.

Backup **v6** conserva `media?`, checksum, limite global de 10 MiB e restore atômico. Ownership aceita agora livros e audiovisual; órfãos, duplicatas, dimensões/formatos inválidos são recusados. Backup antigo sem mídia restaura registros sem capas. Capas reduzidas entram no backup; originais, fundos e PNGs do ateliê ficam de fora. Muitas capas podem exceder o limite global com erro explícito, sem descarte. Versões antigas não entendem capas de livros e podem recusar o novo conteúdo; downgrade não suportado. Não modificar schema do mundo ou criar vínculo espacial por causa de capas.

## Ateliê

`BVShareComposer` compartilha controles, lifecycle, geração, prévia e entrega. Adaptadores de Livro/Entretenimento mantêm os dois modos de livro (marcador/citação escolhida) e quatro modos audiovisuais. Canvas 2D compartilhado renderiza 1080 × 1350, 1080 × 1920 ou 1080 × 1080; independe da tela e não captura a interface. Prévia é o próprio data URL do PNG exportado.

Três composições, três molduras, alinhamento/posição predefinidos, título editável, mensagem e fundo local/capa/gravura. Escurecimento acrescenta tratamento ao véu de contraste fixo. Citação só entra após escolha explícita; ajuste do trecho não altera a citação salva. Notas privadas não são consultadas. Texto excessivo falha com pedido de redução, sem truncamento silencioso. Alteração do conteúdo, registro ou estilo invalida imediatamente a entrega anterior; resultados assíncronos obsoletos são descartados. Importação/entrega impedem ações concorrentes.

Share/Filesystem/SAF existentes recebem o mesmo artefato da prévia; cancelamento, indisponibilidade e erro conservam a composição. Configuração/fundo são efêmeros durante a visita. Sem rede, editor profissional/crop livre, serviço externo, dependência ou versão de pacote nova.

Contrato, resultados e pendências: [Parte 2E](../BF-5_PARTE2E_CONTROLES_CAPAS_ATELIE.md).
