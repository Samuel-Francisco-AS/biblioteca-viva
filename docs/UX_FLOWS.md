# Fluxos de UX e navegação

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

```text
Detalhe do livro
→ ação de atualizar progresso
→ informar página atual
→ domínio valida
→ salvar atividade
→ atualizar detalhe
→ projeção da biblioteca recebe novo estado
```

No Prompt 8, o retorno do caso de uso atualiza o estado local do detalhe. Ao voltar à Coleção, a consulta é refeita pela montagem da rota; não há reload global nem acesso ao Dexie pela apresentação.

## 6. Concluir livro

```text
Detalhe
→ marcar como concluído
→ confirmar apenas se houver consequência relevante
→ aplicar regra de progresso
→ registrar evento
→ avaliar marco
→ exibir feedback textual
→ biblioteca reproduz reação visual e sonora quando acessada
```

A conclusão pode ser desfeita sem apagar histórico.

## 7. Notas e citações

```text
Detalhe
→ adicionar nota ou citação
→ texto simples
→ localização/página opcional
→ salvar
→ aparecer no livro e no Arquivo
```

Rascunho automático pode ser considerado depois; no protótipo, evitar prometer salvamento que não exista.

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

O cartão atual é o protótipo estrutural validado. Em uma revisão futura de UX e direção visual, a sala poderá ocupar a maior parte da tela inicial ou uma área quase inteira, com painéis sobrepostos semelhantes a bottom sheets. Essa intenção deve preservar a navegação inferior e a Coleção convencional e não faz parte desta correção, do Bloco 7 ou do Prompt 14.

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
→ confirmar substituição ou mesclagem, conforme política aprovada
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

Somente substituição está disponível. Selecionar valida sem escrita e move o foco ao resumo. Cancelar limpa a seleção e preserva o banco. Confirmar cria/entrega primeiro um backup de segurança quando necessário, revalida, substitui atomicamente e anuncia contagens. Falha permite nova tentativa. A entrega usa compartilhamento de arquivo quando suportado e download Blob como fallback.

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
