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
→ solicitar primeiro gesto para habilitar áudio, sem obrigar
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

Após o Prompt 7, o cadastro navega para `/livros/:id`, um detalhe mínimo com título, autor e ações de editar ou voltar à Coleção. A edição ocorre em `/livros/:id/editar`, carrega pelo ID e reutiliza o mesmo formulário. Status, progresso e data de início ficam somente para leitura na edição porque seus fluxos próprios pertencem ao Prompt 8; título, autor, total de páginas e avaliação usam a atualização bibliográfica vigente.

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

Não recriar o jogo inteiro. A atualização visual pode ocorrer ao voltar à Biblioteca ou em tempo real quando a rota estiver aberta.

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

- busca por título e autor;
- filtro por status;
- ordenação por atualizado, título e criação;
- estado vazio explica como remover filtros;
- busca não bloqueia digitação nem consulta a cada tecla de modo caro sem necessidade.

## 9. Biblioteca visual

Phaser recebe `LibraryViewModel` e exibe:

- estante vazia, inicial, ocupada ou com concluído;
- bibliotecária em idle;
- criatura com movimento delimitado;
- iluminação e destaque do livro recente.

Interações:

- estante: abre painel React com resumo e acesso à Coleção;
- bibliotecária: abre fala React acessível;
- criatura: abre descrição React;
- livro em destaque: abre detalhe correspondente.

A rota oferece uma alternativa textual com os mesmos dados essenciais.

## 10. Backup

```text
Configurações
→ Exportar backup
→ aviso de conteúdo pessoal
→ escolher destino pelo sistema
→ confirmação com data e versão
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
