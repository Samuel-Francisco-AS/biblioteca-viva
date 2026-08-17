# Fluxos de UX e navegação

> R3 substituiu a navegação inferior pelo drawer e consolidou a Biblioteca protagonista e suas camadas contextuais nas seções 19–20.

## 1. Princípios

- mobile first, orientação retrato recomendada até decisão contrária;
- tarefas convencionais acontecem em React;
- Phaser não substitui formulários, listas ou texto acessível;
- toda ação possui feedback claro e estado de erro recuperável;
- o usuário nunca precisa “jogar” para acessar ou editar seus dados;
- navegação principal permanece estável.

## 2. Arquitetura de informação do protótipo

Navegação principal:

1. Biblioteca;
2. Coleção;
3. Novo livro;
4. Arquivo;
5. Configurações.

No mobile, usar navegação inferior. Em telas maiores, adaptar sem alterar a hierarquia conceitual.

## 3. Primeiro uso

```text
Abrir app
→ mensagem curta de proposta
→ explicar que dados ficam no aparelho
→ o primeiro gesto válido em React ou Phaser pode habilitar áudio, sem autoplay
→ apresentar biblioteca quase vazia
→ oferecer ação “Cadastrar primeiro livro”
```

Não exigir conta, tutorial longo ou permissões desnecessárias.

## 4. Cadastrar livro

```text
Coleção ou Biblioteca
→ Novo livro
→ título obrigatório
→ autor opcional
→ total de páginas opcional
→ página atual
→ status coerente
→ salvar
→ confirmação
→ voltar ao detalhe ou biblioteca
```

Erros aparecem próximos ao campo, preservam os dados digitados e levam foco ao primeiro problema.

O cadastro navega para `/livros/:id`, agora um detalhe completo com dados bibliográficos, progresso, transições válidas de status, notas e citações. A edição continua em `/livros/:id/editar` e reutiliza o formulário bibliográfico. Status, progresso e data de início ficam somente para leitura nessa rota porque suas ações próprias estão no detalhe.

## 5. Atualizar progresso

> **Implementado tecnicamente em R1-A.**

```text
Detalhe do livro
→ ação de atualizar progresso
→ informar página atual
→ domínio valida
→ se planned e página > 0, mudar para in_progress e registrar início quando ausente
→ se total conhecido e página == total, usar a conclusão existente
→ salvar atividade
→ atualizar detalhe
→ projeção da biblioteca recebe novo estado
```

Sem total conhecido, progresso pode iniciar a leitura, mas não calcula porcentagem nem conclui automaticamente. Nenhum total é inventado e `paused` ou `abandoned` não ganharam novas transições. O retorno do caso de uso atualiza o estado local do detalhe, sem acesso Dexie pela apresentação.

## 6. Concluir livro

> **Implementado tecnicamente em R1-A; a conclusão explícita permanece disponível.**

```text
Detalhe
→ atualizar progresso até o total conhecido
→ domínio mudar automaticamente para completed
→ reutilizar a regra e a cadeia de conclusão existentes
→ registrar evento
→ avaliar marco
→ exibir feedback textual
→ biblioteca reproduz reação visual e sonora quando acessada
```

A conclusão pode ser desfeita sem apagar histórico.

No detalhe com total conhecido, a interface mostra porcentagem derivada, páginas lidas, total, páginas restantes e um elemento `progress` horizontal nomeado por texto equivalente. Zero e 100% são tratados e a apresentação defensiva limita valores ao intervalo. Sem total, mostra a página atual e informa que o total não foi definido, sem porcentagem ou barra.

## 7. Notas e citações

```text
Detalhe
→ adicionar nota ou citação
→ texto simples
→ localização/página opcional
→ salvar
→ aparecer no livro e no Arquivo

Detalhe ou Arquivo
→ escolher editar, compartilhar ou excluir
→ edição preserva identidade e atualiza o item após commit
→ compartilhamento envia texto humano somente por ação explícita
→ exclusão pede confirmação inline e remove o item após commit
```

Cancelar edição ou exclusão preserva o item e devolve foco à ação correspondente. Falha mantém o formulário/conteúdo visível e oferece nova tentativa. O Arquivo conserva a consulta atual e filtra sobre o estado atualizado sem recarregar a aplicação. Excluir uma anotação não apaga sua atividade histórica de criação nem o milestone histórico. Rascunho automático pode ser considerado depois; no protótipo, evitar prometer salvamento que não exista.

## 8. Busca e filtros

- a Coleção busca parcialmente por título e autor, sem diferença de caixa ou acento;
- o filtro possui todos os cinco status reais e combina com a busca;
- a ordenação oferece atualização recente, título e progresso;
- livros com porcentagem conhecida vêm antes dos sem total na ordem por progresso; estes usam página atual decrescente;
- busca, status e ordem ficam na URL e retornam intactos após abrir o detalhe;
- Coleção vazia e nenhum resultado possuem mensagens e ações distintas;
- o Arquivo pesquisa conteúdo de notas e citações, título e autor relacionados;
- abrir um livro pelo Arquivo preserva a busca para a ação de retorno;
- os dados são carregados uma vez por rota e nenhuma consulta ocorre por tecla.

## 9. Biblioteca visual

Abrir Biblioteca
→ carregar dados
→ projetar estado
→ observar sala reativa
→ tocar estante, bibliotecária ou criatura
→ Phaser emitir interação tipada
→ React substituir o painel atual pelo painel correspondente
→ abrir Coleção ou fechar painel.

Phaser recebe `LibraryViewModel` resumido e exibe:

- estante vazia, inicial, ocupada ou com concluído;
- bibliotecária em idle;
- criatura com movimento delimitado;
- iluminação e destaque do livro recente.

Interações:

- estante: abre painel React com resumo e acesso à Coleção;
- bibliotecária: solicita ao `DialoguePort` uma fala contextual localizada e abre o painel React;
- criatura: solicita uma resposta curta localizada e abre o mesmo painel React;
- livro em destaque: mantém contrato tipado, sem fluxo funcional adicional nesta etapa.

Somente um painel fica aberto. Abrir outro substitui o anterior; fechar remove o painel; sair da rota desmonta painel, canvas, listeners e animações. Coleção permanece permanentemente disponível por link React.

A rota oferece uma alternativa textual com os mesmos dados essenciais.

O cartão atual é o protótipo estrutural. Em R3, a sala deverá ocupar a maior parte da tela inicial ou área quase inteira, com informação secundária progressiva e painéis semelhantes a bottom sheets. O tema escuro será um sistema coerente, não uma simples inversão de cores. A direção preserva navegação inferior, Coleção convencional e alternativa React acessível sem fazê-la dominar visualmente. Trata-se de redesign extenso ainda não implementado.

## 10. Backup

```text
Configurações
→ Salvar backup no dispositivo
→ aviso de conteúdo pessoal
→ preparar e validar o JSON
→ abrir seletor de documentos Android
→ usuário escolher nome e local
→ escrever em UTF-8 pela URI via ContentResolver
→ confirmar sucesso após concluir a escrita
→ usuário verificar o arquivo externo
```

```text
Configurações
→ Compartilhar backup
→ preparar e validar o JSON
→ criar arquivo temporário em Cache
→ abrir folha Android
→ usuário escolher Drive, computador ou outro aplicativo
→ encerrar fluxo sem afirmar salvamento permanente
→ usuário confirmar o destino
```

```text
Configurações
→ Restaurar backup
→ selecionar arquivo
→ validar sem modificar dados
→ mostrar resumo
→ se banco vazio, confirmar e restaurar sem backup de segurança obrigatório
→ se banco preenchido, escolher criar backup, continuar sem backup ou cancelar
→ ao continuar sem backup, confirmar aviso claro de substituição
→ restaurar transacionalmente
→ reiniciar projeções
```

## 11. Estados obrigatórios

Toda tela de dados deve tratar:

- carregando;
- vazio;
- sucesso;
- validação;
- falha recuperável;
- falha de persistência;
- dados incompatíveis;
- conteúdo visual indisponível.

Uma falha do Phaser mostra alternativa textual e opção de tentar novamente; não bloqueia a Coleção.

## 12. Android

- botão voltar navega dentro do histórico;
- na raiz, comportamento de saída deve ser simples e consistente;
- retorno do segundo plano preserva formulário e dados seguros;
- teclado virtual não cobre campo ativo ou ação principal;
- safe areas respeitadas;
- áreas de toque adequadas;
- nenhuma interação depende de hover.

## 13. Backup e recuperação implementados

Somente substituição está disponível. Banco vazio é derivado pela aplicação como ausência de livros, notas, citações, atividades, settings e milestones; metadata técnica não muda essa classificação. Nesse caso, confirmar restaura sem criar ou compartilhar backup vazio. Em banco preenchido, a interface oferece criar backup pelo mecanismo existente, continuar sem backup com uma segunda confirmação inequívoca ou cancelar. Selecionar continua validando sem escrita, restaurar revalida imediatamente antes do replace atômico, e mudança concorrente de vazio para preenchido exige nova decisão. Falha preserva seleção e permite nova tentativa.

Falha de renderização apresenta “Tentar novamente” e “Recarregar aplicativo”; nenhuma opção apaga ou restaura dados automaticamente.

## 14. Excluir livro

```text
Detalhe do livro
→ seção destrutiva “Excluir livro”
→ abrir confirmação inline
→ conferir título e aviso sobre notas e citações
→ cancelar e preservar tudo, ou confirmar “Excluir permanentemente”
→ remover livro, notas, citações e atividades na mesma transação
→ após commit, voltar à Coleção
```

Falha mantém o detalhe e a confirmação utilizáveis, sem remover o livro visualmente. A exclusão não existe na listagem, na cena Phaser, por gesto ou sem confirmação.

## 15. Áudio e preferências

```text
abrir aplicativo sem autoplay
→ primeiro pointerdown global ou keydown válido, em React ou Phaser
→ inicializar AudioPort uma única vez
→ se Biblioteca estiver ativa, iniciar uma música
→ navegar, tocar estante/bibliotecária/criatura ou concluir e emitir intenções discretas
→ receber sempre feedback React/visual equivalente
```

```text
Configurações
→ alterar volume da música, volume dos efeitos ou mute
→ aplicar imediatamente à sessão
→ persistir na tabela settings
→ recarregar/reabrir com a mesma preferência
```

Ao perder visibilidade ou receber `appStateChange` inativo, o serviço interrompe música e efeitos. Ao retornar, retoma somente a música desejada e nunca reproduz efeitos acumulados. Sair da Biblioteca interrompe sua música; retornar solicita uma única instância. Falha de backend, arquivo ou persistência sonora degrada para silêncio e não bloqueia os demais fluxos.

## 16. Diálogos contextuais

```text
carregar Biblioteca
→ React envia somente contagens agregadas ao DialogueService
→ registrar instante mínimo da visita em settings
→ tocar bibliotecária ou criatura
→ Phaser emitir interação tipada
→ áudio receber sua intenção independente
→ DialogueSelector aplicar contexto, once, cooldown e fallback
→ painel React atual apresentar LocalizedDialogue em pt-BR
```

Biblioteca vazia, primeiro livro, leitura em andamento, primeira conclusão e retorno após três dias são contextos da bibliotecária. Toques gerais e criatura possuem pequenas sequências previsíveis. Fala especial em cooldown não se repete incessantemente; `once` não retorna após persistido. Falha do histórico usa estado seguro e não bloqueia a sala, Coleção ou dados pessoais.

## 17. Primeiro desbloqueio

```text
concluir o primeiro livro
→ persistir livro, atividade, marco e recompensa na mesma transação
→ publicar sucesso somente após commit
→ atualizar projeção com a luminária de leitura
→ exibir anúncio React polite e diálogo book.first-completed
→ emitir efeito sonoro, se áudio estiver habilitado
→ animar brevemente a luminária, ou mostrá-la estática com reduced motion
```

A notificação informa “Primeiro livro concluído” e “Luminária de leitura desbloqueada”, não toma foco e pode ser dispensada. A luminária sobrevive a recarga, retomada e exclusão posterior do livro. Reconstruir a sala só lê o desbloqueio; nunca concede recompensa. Eventos repetidos, restauração e subscribers duplicados não repetem a reação.

## 18. Preferências de experiência e alternativa textual

```text
Configurações
→ escolher seguir sistema/reduzir/movimento normal
→ ativar/desativar alto contraste
→ escolher texto padrão/grande/maior
→ aplicar imediatamente
→ persistir em settings e preservar no backup
```

Seguir sistema é o padrão. Preferência inválida volta a defaults sem impedir abertura. Volumes e mute continuam no grupo de áudio e em sua fonte de verdade existente.

Na Biblioteca, o resumo React precede o canvas e apresenta contagens, estado da estante, livro recente e primeira conclusão/luminária. Botões React abrem detalhes da estante e diálogos de bibliotecária/criatura; link convencional abre a Coleção. Fechar painel devolve foco ao botão textual correspondente. A mesma camada permanece funcional se o canvas falhar ou não puder ser usado por tecnologia assistiva.

## 19. Navegação e rotas convencionais em R3-A

```text
botão Menu
→ drawer sobrepõe a rota
→ escolher uma linha integral
→ drawer fecha
→ rota abre e o conteúdo principal recebe foco
```

Escape, botão de fechar e backdrop fecham o drawer e devolvem foco ao acionador; navegar fecha sem disputar o foco que será levado ao `main`. Coleção preserva busca, filtro, ordenação e origem na URL, mas o card inteiro do livro abre o detalhe. Detalhe, editores, Arquivo e Configurações mantêm seus fluxos funcionais e usam agrupamentos contínuos em vez de caixas aninhadas. R3-B substituiu a ordem antiga da Biblioteca registrada na seção 18 por canvas dominante, alternativa compacta e camadas contextuais.

## 20. Biblioteca protagonista em R3-B

```text
abrir Biblioteca
→ sala ocupa a área útil
→ botão superior abre drawer sobre a sala
→ handle inferior abre resumo em bottom sheet
→ toque curto na estante abre o mesmo sheet em modo contextual
→ bibliotecária/criatura mostram fala curta em balão React
```

O sheet sobrepõe sem redimensionar ou recriar Phaser; Escape/fechar devolvem foco ao acionador React quando conhecido. O balão não recebe foco automaticamente, contém uma única frase localizada e é substituído pela interação seguinte. “Resumo acessível” expande os equivalentes React para estante, personagens e Coleção; falha do canvas o abre automaticamente. O período local atualiza a atmosfera na mesma instância e, ao voltar do background, é recalculado sem rede ou persistência.

## 21. Novo registro e Coleção em P1-A

`Novo registro → escolher um dos seis tipos → formulário específico → detalhe genérico`. Livro reutiliza seu formulário maduro; os demais mostram somente campos próprios. Coleção busca metadados seguros por variante, filtra tipo/status/favorito e ordena por atualização, criação ou título. O card inteiro abre `/registros/:id`; URLs antigas redirecionam. O detalhe mantém conclusão explícita para Filme, Atividade Física e Trabalho e progresso especializado para Série e Estudo. Sessões, etiquetas operáveis e timer entram somente em P1-B.

## 22. Organização e sessões em P1-B

No detalhe, `Organização` permite favoritar, criar/associar, renomear e excluir etiquetas. Coleção busca nomes de tags e filtra por tag; Arquivo filtra tipo de anotação, tipo de registro, favorito e tag.

`Sessões` oferece iniciar/pausar/retomar/concluir/cancelar, registro manual e edição/exclusão do histórico. Apenas uma sessão pode ficar aberta. Um indicador React global persiste entre rotas/reload e abre o registro; timestamps preservam precisão em background sem serviço Android, wake lock, som ou notificação.

## 23. Estatísticas e histórico em P1-C

`Drawer → Estatísticas` abre `/estatisticas`. A página oferece 7 dias, 30 dias ou todo o período, filtro por tipo e categoria do histórico. Resumo global mostra registros, andamento, conclusões, favoritos, sessões e tempo; cards por tipo mantêm páginas, episódios, unidades de estudo e distância semanticamente separados. Sessões recentes abrem o Entry. Timeline usa data, ação e título obtido por join; item sem Entry degrada para “Registro removido”. Não existem score, ranking, streak ou linguagem prescritiva.
