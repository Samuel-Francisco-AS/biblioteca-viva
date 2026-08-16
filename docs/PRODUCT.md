# Produto — contrato histórico do protótipo e fase atual

> Escopo vigente até o Gate G11. Alterações exigem decisão registrada.

O contrato abaixo permanece como história verdadeira do protótipo. D-049 autorizou uma fase de produto paralela aos gates humanos ainda abertos; isso não reescreve nem aprova retroativamente o protótipo.

## Contrato atual — P1

A Biblioteca Viva é um espaço pessoal em que aquilo que a pessoa lê, assiste, aprende, pratica e constrói deixa memória. Continua local-first, privada, acolhedora, sem coerção e sem gamificação punitiva.

Os tipos oficiais de P1 são `Book`, `Movie`, `Series`, `Study`, `PhysicalActivity` e `Work`. Filmes, séries e estudos realizam a direção histórica; atividade física e trabalho são expansões novas aprovadas em D-049. P1 adiciona infraestrutura comum de etiquetas, favoritos, sessões, busca, Arquivo, histórico, timeline e estatísticas. Conta, backend, sincronização, social, múltiplas salas e recursos médicos ou empresariais continuam fora.

## 1. Objetivo do protótipo

Entregar um aplicativo Android de uso pessoal que permita cadastrar livros, acompanhar progresso, salvar notas e citações, preservar dados localmente e observar uma biblioteca visual e sonora reagindo a essas ações.

## 2. Usuário principal

O criador do projeto. O protótipo deve suportar uso real contínuo, não apenas demonstração de cinco minutos.

## 3. Primeiro ciclo emocional

```text
Abrir o aplicativo
→ acessar a coleção
→ cadastrar um livro
→ voltar à biblioteca
→ ver a estante reagir
→ ouvir uma resposta sonora discreta
→ atualizar progresso
→ concluir o livro
→ receber reação visual, fala e pequeno desbloqueio
→ fechar e reabrir sem perder dados
```

## 4. Funcionalidades incluídas

### Ferramenta

- criar, editar, consultar e arquivar livros;
- status e progresso por páginas;
- total de páginas opcional;
- notas e citações simples;
- busca, filtros e ordenação básicos;
- coleção e detalhe do livro;
- arquivo de notas e citações;
- configurações essenciais;
- exportação e restauração versionadas;
- funcionamento offline.

### Experiência

- uma sala principal;
- uma estante reativa por estados;
- uma bibliotecária;
- uma criatura;
- iluminação simples;
- música ambiente e efeitos;
- diálogos contextuais pequenos;
- um marco de conclusão e um desbloqueio;
- alternativa textual do estado visual.

### Plataforma e qualidade

- versão web durante desenvolvimento;
- APK de depuração antecipado;
- APK release assinado ao final;
- acessibilidade essencial;
- testes automatizados e manuais;
- documentação de manutenção.

## 5. Fora do protótipo

- conta, login e backend;
- sincronização em nuvem;
- filmes, séries, estudos, cursos e jogos;
- múltiplas salas;
- editor de decoração;
- anexos e imagens pessoais;
- download automático de capas;
- editor Markdown avançado;
- recursos sociais;
- IA;
- monetização;
- notificações complexas;
- SQLite sem necessidade comprovada;
- telemetria de conteúdo pessoal.

## 6. Áreas do aplicativo

1. **Biblioteca:** cenário Phaser e alternativa textual.
2. **Coleção:** lista, busca, filtros e acesso aos detalhes.
3. **Novo livro / edição:** formulários React.
4. **Arquivo:** notas e citações.
5. **Configurações:** áudio, movimento, backup e preferências.

## 7. Critérios de sucesso

O protótipo é bem-sucedido quando:

- pode ser usado por semanas sem perda de dados;
- cadastrar e atualizar um livro é rápido e claro;
- a biblioteca reage de forma perceptível e coerente;
- som acrescenta atmosfera sem ser obrigatório;
- coleção funciona mesmo se Phaser falhar;
- backup restaura uma instalação limpa;
- APK funciona no aparelho alvo;
- o código aceita novas adições sem cirurgia global;
- o usuário deseja retornar espontaneamente.

## 8. Critérios para não expandir ainda

Não adicionar um novo tipo de registro, sala ou sistema enquanto:

- houver atrito no CRUD de livros;
- backup não estiver validado;
- APK não estiver estável;
- a metáfora visual não estiver funcionando;
- o gate atual não estiver aprovado;
- a expansão exigir quebrar contratos centrais ainda instáveis.

## 9. Definição de pronto do protótipo

A definição completa está no Gate G11 de `EXECUTION_PLAN.md`. “Pronto” exige comportamento observado, testes, APK, documentação, dados recuperáveis e continuidade possível sem memória da conversa.
