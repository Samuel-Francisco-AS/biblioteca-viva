# BF-5.6B — Oficina de Cartas, Coleções, Ecos e Relicário

08/11/2026. **Candidata para auditoria e avaliação física, sem aceite/fechamento de A ou B.** Implementação expressamente autorizada pelo proprietário, incluindo commit/push/PR draft, com gate Moto G06 conjunto A+B. C–G, BF-6 e BF-7 não iniciadas. Sem merge, release, alteração da versão do aplicativo, backend ou contas.

## Base e rastreabilidade

- Checkout inicial limpo; `git fetch origin` executado antes da implementação.
- PR [#43](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/43) consultada pelo GitHub: aberta, draft, `merged: false`, head **e6b8b2c53adf26779c8e3f9b4cd33a998256c6ea**.
- B criada exatamente dessa ponta, na branch **feat/bf-5-6b-arcanario-workshop**. Base da PR B: **feat/bf-5-6a-arcanario-foundation**. Os commits de A permanecem ancestrais, sem modificação da branch A ou de sua PR.
- Contrato complementar: [ADR-026](decisions/ADR-026-arcanario-oficina-midias-troca.md). A migração/fundação da [ADR-025](decisions/ADR-025-arcanario-fundacao-persistencia.md) permanece preservada.

## Produto e telas disponíveis

| Caminho | Experiência funcional |
| --- | --- |
| `/arcanario` | Portal com composição de cartas, contagens reais e entradas das salas |
| `/arcanario/acervo` | Busca textual, famílias, acervo ativo/arquivado e detalhe contextual |
| `/arcanario/cartas/:id` | Frente/verso, origem, registros/vínculos, coleções, versões, progresso e arquivamento confirmado |
| `/arcanario/baralhos` | Coleções estáticas, criação e entrada de importação |
| `/arcanario/baralhos/novo` e `/:id` | Nome, seleção de referências, ordem por botões, retirada, exclusão, exportação e início de revisão |
| `/arcanario/oficina/nova` e `/:id` | Editor de Ecos/lembranças com prévia, aparência, vínculos, imagem e rascunho recuperável |
| `/arcanario/ecos` e `/:id` | Rodadas incompletas, retomada, revisão, resultado e histórico persistidos |
| `/arcanario/relicario` | Coleção de lembranças, criação, edição e arquivadas |
| `/arcanario/importar` | Seleção de arquivo, validação, prévia e confirmação de nova cópia |

Entradas no painel acessível já existente da Biblioteca e na Coleção, inclusive vazia. Dock e controles globais preservados. O runtime Three permanece residente e pausado fora da Biblioteca; não há outro Canvas, objeto orbital, campo ou arena. Rotas têm retornos explícitos e usam o Voltar Android existente; URLs permitem reabrir uma rodada/carta diretamente. Busca usa query string. A visita ao editor preserva rascunho ao navegar pelo dock ou sair.

`ArcanariumPage`, `Catalogue`, `Decks`, `Workshop`, `Echoes`, `DeckImport`, `ArcanaCard` e `ArcanaArt` compõem a apresentação. Todos os comandos passam pela aplicação; nenhum componente acessa Dexie.

## Identidade artística

Portal em material de arquivo violeta com inscrições douradas e duas cartas compostas como objetos, círculos de astrolábio e entradas de salas; volumes de coleção com lombada/páginas, selos gravados de Eco, Relicário e Oficina. Três molduras próprias: Constelação, Herbário, Iluminura. Quatro afinidades puramente decorativas: Astral/violeta, Jardim/jade, Brasa/rubi, Pergaminho/ouro. Relicário combina imagem local com janela arqueada, categoria e inscrição no verso; sem atributos de combate.

SVG/CSS originais de autoria desta implementação, rastreáveis no Git e no [registro de assets](ASSET_REGISTRY.md). Sem imagens externas/licença indefinida, fontes remotas ou dependências novas. Giro CSS de frente/verso e transições de contato, desativados por preferência de movimento reduzido do app/sistema. Nenhuma animação controla persistência. Controles mínimos de toque, foco visível, faces inativas `aria-hidden`/`inert`, textos longos roláveis e botões equivalentes. Retrato/paisagem e modo de contraste tratados em CSS. A evidência automatizada não certifica TalkBack, ergonomia ou aceite artístico humano.

## Oficina, cartas e organização

Flashcard mantém frente (4.000)/verso (8.000) obrigatórios; título opcional (160), tema/moldura e vínculos opcionais a Estudos. Lembrança: título (160), inscrição (8.000), categoria decorativa (80), tema/moldura, imagem e referências opcionais aos seis tipos existentes. Campos opcionais novos não invalidam cartas antigas sem apresentação.

`ArcanariumWorkshop.save` coordena carta + revisão imutável + imagem + alterações de vínculos/associações na mesma transação. Espera revisão da carta e dos baralhos alterados, sem sobrescrever silenciosamente outra edição. Conflito/erro mantém texto digitado e imagem preparada; a UI mostra a versão atual e oferece usar essa revisão como base mantendo o rascunho, por decisão explícita. Tema/prévia não escrevem no acervo.

Rascunhos são privados, em localStorage por banco/identidade/família, validados ao recuperar; persistência curta mais flush ao sair/ocultar, descarte explícito e aviso se a quota falhar. Não são backup, não têm sincronização e não entram em `settings` ou no objeto da carta. Guardar a carta remove o rascunho. Sair conserva o trabalho; descartar não altera a carta salva.

Baralhos estáticos mantêm referências únicas em ordem, com revisão opcional fixada da A. Uma carta integra vários baralhos sem cópia. Ordem/nome/seleção só são aplicados ao salvar; revisar/exportar exige salvar antes. Retirar do baralho só remove a referência. Excluir baralho preserva carta/versões/histórico; arquivar carta global requer confirmação e retira da projeção ativa dos Estudos sem hard delete. Contratos dinâmicos são preservados e identificados como ainda não executáveis na B, sem filtros fictícios.

## Fonte canônica e Ecos

Oficina e fólio leem/escrevem o acervo da A. Nova associação a Estudo cria alias no mapa composto; desvincular deixa tombstone. Reassociar reutiliza o vínculo sem duplicá-lo. O fólio agora conserva os campos de apresentação/título quando altera frente/verso. Origem histórica/IDs globais/versões são preservados. Eventos de Estudos vinculados saem somente após o commit.

Revisão do baralho segue sua ordem, selecionando apenas flashcards ativos; não interpreta questões/combate nem filtros dinâmicos. Carta fixada resolve a revisão indicada. A sessão persiste referências imutáveis e respostas sequenciais da fundação. Revelar verso só muda apresentação; responder confirma na aplicação antes de avançar. Posição é derivada de `answers.length`, protegida contra duplicação/concorrência. Reabrir/retomar volta à primeira resposta não confirmada, sem depender do deck vivo. Resultado/histórico e tentativas por carta conservam versão/timestamp e escolhas. Não há agenda espaçada, nota de conhecimento, XP ou inferência de domínio.

## Relicário, imagens e backup

Dexie **v16**, upgrade aditivo v15→v16 com uma tabela: `cardMedia` (`&id,cardId`). `media` de capas permanece independente. Imagem tem identidade própria, proprietário global e bytes JPEG validados, nunca embutidos em carta/settings. Preparação local reutiliza o pipeline seguro de JPEG/PNG até 10 MiB/24 MP, reencode até 1600 px/350.000 caracteres de data URL (~256 KiB de bytes). Falha preserva formulário; remover imagem atua só na revisão atual.

Toda referência histórica deve encontrar imagem do mesmo proprietário. Bytes antigos ficam enquanto qualquer revisão os usa, inclusive em carta arquivada; a coleta transacional remove somente órfãos de todas as versões. Não há exclusão automática de história para reduzir volume. Excluir registro de origem preserva carta, imagem e IDs históricos; a tela apresenta origem indisponível.

Backup novo **v8** inclui `data.cardMedia` obrigatório junto do grafo v7, com validação de ownership, duplicatas e referências. Originais **v6/v7 continuam importáveis**, com checksum antes de transformação e promoção legado v6 na transação do restore. Restore replace mantém proteções, backup de segurança e rollback após clear. **10 MiB mantidos**; excesso falha com mensagem explícita, sem truncamento ou aumento silencioso. Versões/imagens antigas podem consumir esse limite; exportar baralho é troca de conteúdo, não substituto do backup pessoal. **Não há downgrade suportado de banco ou backup.**

## Troca autoral local

Formato separado **biblioteca-viva-author-deck v1**: nome, cartas na ordem e mídias necessárias, SHA-256 de JSON canônico; até 500 cartas/10 MiB. Schemas estritos, assinatura/dimensões de mídia, unicidade, propriedade e referências verificadas antes da escrita. Versão futura, corrupção, script/HTML em estruturas inesperadas, URL remota de imagem e proprietário inválido são rejeitados. Texto livre é renderizado como texto React, nunca HTML executável.

Exporta deck estático autoral de Ecos/lembranças, resolvendo conteúdo atual ou revisão fixada. Carta compartilhada é incluída no arquivo, sem dependência de outro deck. Questões/combate, cartas arquivadas e origem oficial não são exportáveis nesta B. Exportação deliberadamente remove referências privadas a registros; não transporta Estudos, respostas, revisões históricas ou proveniência privada.

Importação é **sempre nova cópia**, informada na prévia: IDs novos para baralho/cartas/imagens, revisão inicial 1 e origem local. Colisão aborta sem sobrescrever. Importação repetida cria outra cópia explícita. Lote inteiro é atômico, com rollback de falha intermediária. O histórico local não é mesclado/substituído. Android usa seletor de documento já existente; web usa entrega/download de JSON existente. Não há rede, pacotes oficiais, catálogo ou envio automático.

## Verificações e evidências

Resultados locais separados por execução, sem transformar rodadas distintas em ampla verde:

- Dados dirigidos iniciais: **65 PASS/6 arquivos**, incluindo a fundação A, novo serviço/mídia/troca e backups.
- Componentes com aplicação/Dexie reais: **4 PASS** na rodada dirigida; editor/rascunho, conflito, baralho e retomada.
- Única rodada ampla: **1.072 PASS / 11 FAIL / 1.083 casos, 168 arquivos**. Nove falhas eram expectativas antigas de versão/tabelas/exportador (15/7), atualizadas para 16/8 mantendo asserts. Uma falha nova de UI ocorreu após a carta já estar salva, esperando navegação durante a concorrência da ampla; preservada como resultado da ampla, dirigida PASS. A outra é o timeout histórico de 5 s do envelope de Ytha, também presente na A; nenhum código/timeout/assert de animação alterado.
- Regressão dirigida posterior: **129 PASS/23 arquivos**, incluindo as expectativas corrigidas, dados novos, migrações, backups, comandos, composição e UI.
- E2E inicial: **1 PASS/3 FAIL**, zero retries, 30 s intactos. PASS: ida/volta com mesmo Canvas e teclado. Os três cenários novos esgotaram o prazo em etapas distintas após preparação comum que montava/resetava o mundo. A preparação foi focada: contextos novos do Playwright iniciam diretamente no Arcanário para os fluxos de formulário; somente o cenário de residência monta Three. Asserts e tempo não foram relaxados. Essa primeira hipótese de preparação não resolveu os três casos (0/3 na rodada seguinte). A inspeção dos traces identificou controles concretos: `details` com abertura controlada por seleção, rótulo do select de moldura sem identidade explícita para lookup e checkbox de adição removido imediatamente após check. Corrigidos: grupo de abertura nativa, `aria-label` explícito e ação semântica “Adicionar carta”. **3/3 E2E PASS na rodada corrigida** (6,7 s / 3,6 s / 6,0 s), zero retries, mesmos 30 s/asserts de persistência/ordem/reabertura/importação.
- Regressão E2E A/Estudos: **3/3 PASS** (foco/Pomodoro, fólio/flip/layout, fonte global/reabertura/retirada), sem retries.
- Apresentação/fólio/arquitetura após as correções finais: **13 PASS/5 arquivos**, incluindo os quatro casos React sobrepostos à rodada de 129. Não somar conjuntos como se fossem uma única suíte.
- `format:check`, `lint`, `typecheck`, `audio:check`, `build`, `performance:report` e `git diff --check`: **PASS**. Build mantém warning conhecido de chunks acima de 500 kB. Relatório mede bytes estáticos, não FPS/Android/GPU.

Capturas Chromium local de produção com conteúdo fictício, movimento reduzido e viewports 1280×900, 390×844 e 844×390; inspeção visual automatizada seguida de conferência das imagens, sem aceite artístico humano:

- [Portal desktop](audits/evidence/bf56b/portal-desktop.png) e [portal retrato](audits/evidence/bf56b/portal-retrato.png).
- [Oficina com prévia](audits/evidence/bf56b/oficina-retrato.png) e [lembrança do Relicário](audits/evidence/bf56b/relicario-retrato.png).
- [Ecos](audits/evidence/bf56b/ecos-retrato.png), [acervo retrato](audits/evidence/bf56b/acervo-retrato.png) e [acervo paisagem](audits/evidence/bf56b/acervo-paisagem.png).

O cenário do mesmo Canvas passou antes das alterações dirigidas dos controles de formulário; esses reparos não alteram WorldHost/runtime. Falhas intermediárias novas da B estão registradas acima; não foram atribuídas às dívidas históricas. A ampla não foi repetida por cota. A falha nova de navegação na ampla continua resultado dessa execução, embora as execuções dirigidas da UI tenham PASS.

Não há alegação de ampla/CI global verde. CI remota será omitida por cota via `[skip ci]`, sem workflow caro manual. Testes em origens/bancos descartáveis, com textos e imagem fictícios; nenhum backup pessoal usado.

## APK debug e proveniência

`npm run android:build:debug` **PASS**, incluindo build web, Capacitor sync e Gradle assembleDebug (`BUILD SUCCESSFUL`, 184 tasks). APK local, ignorado pelo Git: `android/app/build/outputs/apk/debug/app-debug.apk`.

- **11.642.677 bytes**; SHA-256 **04adb6a85333c4e0b88338fd983a139c691a232749e137adfc3d7219be0f1fe9**.
- Código produtivo do commit **7cce3a4f45b6087fe766305b0cfbbd7473a75b99** sobre A **e6b8b2c53adf26779c8e3f9b4cd33a998256c6ea**. Commits posteriores de auditoria/documentação não alteram o código produtivo compilado.
- Auditoria final reforçou o fixture v7 para usar somente os campos existentes na A (frente/verso, sem aparência nova): o caso dirigido de round-trip v8/restore v7 original teve **1 PASS**; os outros 11 casos do arquivo não foram selecionados nessa execução, já contemplados nas rodadas anteriores. Não houve remoção de asserts.
- Artefato debug local para instalação dirigida; nenhuma publicação de release, instalação em dados pessoais ou teste físico executados pelo agente.
- Arquivos, diff e capturas revisados: apenas conteúdo fictício; nenhum backup/exportação pessoal, credencial ou keystore versionado. Árvore de produção revisada sem alterações 3D ou dependências novas.

## Roteiro físico conjunto A+B

1. **Antes da instalação:** exportar e guardar backup v6 pelo APK atualmente instalado, conferir acesso ao arquivo e manter recuperação externa. Registrar versão/commit da candidata. **Não desinstalar, limpar dados ou fazer downgrade. Não existe downgrade suportado após migração para v15/v16.** Se já usa A, guardar também seu v7.
2. Instalar APK debug como atualização compatível. Comparar Estudos anteriores (contagem, frente/verso/espaços/IDs observáveis), outros cinco tipos, notas/citações, sessões, planos e imagens de capas. Migração não deve pedir limpeza.
3. Abrir Arcanário pelo painel da Biblioteca e pela Coleção. Percorrer Portal/Acervo/Baralhos/Oficina/Ecos/Relicário; testar Voltar por botões e botão Android em todos os níveis. Retornar ao mesmo Canvas/câmera/seleção, sem reconstrução percebida.
4. Criar dois baralhos fictícios, um Eco global e outro vinculado a Estudo. Colocar a mesma carta nos dois; editar na Oficina e no fólio e comparar. Reordenar/renomear, retirar apenas de um deck, desvincular do Estudo, excluir deck e conferir preservação global/histórico, sem ressurreição.
5. Na Oficina experimentar temas/molduras sem salvar; sair/reabrir e recuperar rascunho. Salvar explicitamente, conferir ambas as faces/texto longo, editar/arquivar. Se possível abrir outra tela para conflito e conferir preservação do texto.
6. Revisar dois Ecos por baralho, revelar/responder, interromper após a primeira resposta. Fechar completamente/reabrir o aplicativo, retomar a segunda carta, concluir e comparar contagens/histórico/versões. Respostas confirmadas não podem duplicar/desaparecer.
7. Criar lembrança independente, outra associada a obra/registro fictício, com texto/categoria/imagem local, trocar moldura/imagem e retirar a imagem da revisão atual. Reabrir e conferir. Excluir somente a origem fictícia e verificar referência indisponível sem perda da carta. Não usar registro pessoal para ensaio destrutivo.
8. Exportar/importar deck fictício, conferir prévia e nova cópia; repetir e verificar a política anunciada. Tentar JSON inválido/corrompido e confirmar nenhuma escrita parcial. Exportar backup v8 e conferir destino. Restore v6/v7/v8 e testes de falha/replace **somente em base descartável ou após estratégia explícita de recuperação**, nunca automaticamente sobre dados pessoais.
9. Retrato/paisagem em cada sala, teclado aberto, texto ampliado, contraste, movimento reduzido, navegação por teclado quando disponível; executar TalkBack e registrar separadamente se testado. Verificar rolagem de texto longo, rótulos/frente/verso, foco e conforto de toque, sem disputa com dock.
10. Segundo plano/retorno e fechamento/reabertura durante rascunho/revisão. Comparar fluidez do Canvas com BF-5.5 e inspecionar portal/molduras/coleções no aparelho. Registrar PASS/FAIL por grupo, sintomas e capturas somente fictícias. Sem inferir performance sustentada, temperatura ou memória apenas por percepção curta.

## Pendências e limites

- **Aceite artístico/funcional físico A+B, TalkBack, ergonomia e integração: pendentes.** Não fechar A/B ou fazer merge nesta missão. Após autorização posterior, ordem A → B.
- Dívidas anteriores de CI/E2E globais, HUD paisagem BF-5.5, memória/termal/GPU, Ytha e quests continuam abertas; este trabalho não as declara resolvidas.
- Sem agenda espaçada, motor/editor de questões, filtros dinâmicos executáveis ou diagnóstico (C); sem instalador/catálogo/pacotes oficiais (D); sem TCG/atributos/IA (E); sem construção orbital/arena 3D (F) ou fechamento (G).
- Históricos/imagens têm retenção deliberada e podem alcançar 10 MiB; a B não cria compactação/descarte de versões. Escala de grandes acervos e pacotes continua para avaliação própria.
- Rascunhos são recuperação no aparelho, fora do backup; limpeza do armazenamento pelo sistema/usuário os remove. Erro de quota é anunciado. Importação autoral v1 não preserva identidade nem funde histórico.
