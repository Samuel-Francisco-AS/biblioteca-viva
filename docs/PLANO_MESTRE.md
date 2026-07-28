# Biblioteca Viva — Plano Mestre do Aplicativo Completo

> Documento de visão, produto, arquitetura e evolução de longo prazo do aplicativo **Biblioteca Viva**.  
> Nome provisório: **Biblioteca Viva**.  
> Este documento descreve a visão ampla do produto. Ele não representa uma promessa de implementar tudo de uma vez.

---

## 1. Conceito

Biblioteca Viva é um aplicativo de registro pessoal e produtividade cultural em que livros, filmes, séries, estudos, citações, anotações e aprendizados passam a existir dentro de uma biblioteca virtual viva.

A biblioteca evolui conforme o usuário registra, acompanha e conclui experiências.

O aplicativo combina:

- catálogo pessoal;
- diário de leitura;
- diário de estudos;
- acompanhamento de progresso;
- sistema de anotações e citações;
- visualização de dados;
- gamificação;
- construção de ambiente;
- personagens;
- pequenas histórias;
- coleção;
- expressão pessoal.

A proposta central é transformar registros abstratos em um espaço visível, afetivo e persistente.

---

## 2. Frase de produto

> Tudo o que você lê, assiste e aprende passa a habitar a sua biblioteca.

---

## 3. Problema que o aplicativo busca resolver

Muitos aplicativos de leitura e produtividade:

- apresentam dados em listas frias;
- reduzem experiências a números;
- tratam progresso apenas como metas;
- oferecem pouca sensação de continuidade;
- não estimulam revisitar anotações;
- separam leitura, filmes, séries e estudos;
- dependem de recompensas genéricas;
- possuem aparência corporativa ou social excessiva.

Biblioteca Viva pretende resolver isso por meio de uma representação visual persistente.

O usuário não apenas registra “um livro concluído”. Ele vê a estante crescer, personagens reagirem, salas surgirem e elementos da biblioteca refletirem sua trajetória.

---

## 4. Visão de longo prazo

A versão madura deverá permitir que cada pessoa desenvolva uma biblioteca diferente.

Exemplos:

- um leitor de fantasia pode desbloquear vitrais, criaturas e uma ala arcana;
- um estudante pode desenvolver mesas, mapas, instrumentos e uma sala de pesquisa;
- alguém que registra muitos filmes pode desbloquear uma sala de projeção;
- um usuário que salva muitas citações pode criar um arquivo de frases;
- uma pessoa que revisita anotações pode atrair personagens pesquisadores;
- períodos de intensa atividade podem mudar a iluminação e a movimentação;
- registros antigos podem ser revisitados por personagens.

A biblioteca deve funcionar como uma autobiografia indireta do que o usuário consumiu, estudou e preservou.

---

## 5. Princípios de produto

### 5.1 O registro vem antes da gamificação

O aplicativo deve continuar útil mesmo para quem ignora o jogo.

### 5.2 A biblioteca representa o usuário

As mudanças visuais devem surgir das ações reais do usuário, não apenas de pontos genéricos.

### 5.3 Progresso sem culpa

O sistema não deve punir o usuário por pausas, abandonos ou períodos de baixa atividade.

### 5.4 Recompensas significativas

Novos elementos visuais devem guardar relação com:

- tipo de registro;
- frequência;
- profundidade das anotações;
- conclusão;
- revisão;
- diversidade;
- hábitos.

### 5.5 Privacidade por padrão

Registros pessoais, estudos e anotações devem ser privados por padrão.

### 5.6 Crescimento controlado

O produto deverá evoluir por módulos. Nenhuma grande função deve ser adicionada sem preservar o ciclo principal.

---

## 6. Público-alvo

### 6.1 Público principal

- leitores;
- estudantes;
- pessoas que assistem filmes e séries;
- usuários de aplicativos de produtividade;
- pessoas que gostam de jogos aconchegantes;
- pessoas que mantêm diários;
- pessoas que colecionam citações;
- usuários que desejam acompanhar aprendizado.

### 6.2 Público secundário

- clubes de leitura;
- professores;
- pesquisadores;
- criadores de conteúdo;
- estudantes de idiomas;
- pessoas interessadas em organização pessoal;
- jogadores atraídos pela estética da biblioteca.

---

## 7. Plataformas

Ordem sugerida:

1. PWA para navegador e instalação;
2. Android;
3. web desktop;
4. desktop empacotado;
5. iOS, caso o produto seja validado.

A primeira plataforma principal deverá ser Android, mas a base tecnológica pode continuar web.

---

## 8. Estrutura geral do produto

O aplicativo será dividido em cinco grandes áreas:

1. **Biblioteca**
2. **Coleção**
3. **Registro**
4. **Arquivo**
5. **Perfil e estatísticas**

### 8.1 Biblioteca

Ambiente visual com:

- estantes;
- personagens;
- criaturas;
- salas;
- decorações;
- iluminação;
- interações;
- eventos;
- progresso visual.

### 8.2 Coleção

Área convencional para:

- listar registros;
- buscar;
- filtrar;
- ordenar;
- editar;
- consultar;
- comparar;
- exportar.

### 8.3 Registro

Área para:

- criar;
- atualizar;
- concluir;
- pausar;
- abandonar;
- avaliar;
- escrever;
- salvar citações;
- anexar referências.

### 8.4 Arquivo

Área para:

- reunir citações;
- anotações;
- reflexões;
- etiquetas;
- favoritos;
- revisões;
- conexões entre registros.

### 8.5 Perfil e estatísticas

Área para:

- progresso;
- hábitos;
- calendário;
- histórico;
- metas opcionais;
- evolução da biblioteca;
- preferências;
- segurança e conta.

---

## 9. Tipos de registro

### 9.1 Livro

Campos possíveis:

- título;
- autor;
- edição;
- ISBN;
- total de páginas;
- página atual;
- gênero;
- idioma;
- formato;
- capa;
- data de início;
- data de conclusão;
- status;
- avaliação;
- resenha;
- etiquetas;
- origem;
- propriedade;
- releitura.

### 9.2 Filme

Campos possíveis:

- título;
- diretor;
- duração;
- ano;
- gênero;
- plataforma;
- data assistida;
- status;
- avaliação;
- resenha;
- citações;
- elenco favorito;
- etiquetas.

### 9.3 Série

Campos possíveis:

- título;
- temporada atual;
- episódio atual;
- total conhecido;
- plataforma;
- status;
- avaliação;
- anotações por episódio;
- personagens;
- temporadas concluídas;
- data de início;
- última atualização.

### 9.4 Estudo

Campos possíveis:

- título;
- área;
- disciplina;
- objetivo;
- unidade de progresso;
- carga horária prevista;
- tempo acumulado;
- materiais;
- tópicos;
- sessões;
- anotações;
- revisões;
- exercícios;
- nível de domínio;
- prazo opcional.

### 9.5 Curso

Pode ser tratado como subtipo de estudo.

Campos adicionais:

- instituição;
- instrutor;
- módulos;
- aulas;
- certificado;
- plataforma;
- carga horária.

### 9.6 Artigo ou texto

Campos:

- título;
- autor;
- fonte;
- link;
- páginas;
- data;
- tema;
- anotações;
- citações;
- status.

### 9.7 Jogo

Possível expansão:

- título;
- plataforma;
- horas jogadas;
- progresso;
- status;
- avaliação;
- anotações;
- personagens;
- data de conclusão.

Esse tipo deve ser avaliado depois, pois amplia o posicionamento do produto.

### 9.8 Registro livre

Permite cadastrar algo que não se encaixe nos tipos existentes.

Deve ser introduzido apenas depois de estabilizar os modelos principais.

---

## 10. Status de registros

Estados gerais:

- Planejado;
- Não iniciado;
- Em andamento;
- Pausado;
- Concluído;
- Abandonado;
- Arquivado.

Regras:

- “Abandonado” não deve ser tratado como fracasso;
- o usuário pode retomar registros;
- status podem ter histórico;
- conclusões podem ser revertidas;
- progresso deve preservar alterações anteriores quando possível.

---

## 11. Sistema de progresso

Cada tipo terá uma unidade apropriada.

### Livro

- páginas;
- capítulos;
- porcentagem manual.

### Filme

- não iniciado;
- assistindo;
- concluído.

### Série

- episódios;
- temporadas;
- porcentagem calculada.

### Estudo

- horas;
- sessões;
- módulos;
- tópicos;
- exercícios;
- porcentagem personalizada.

### Curso

- aulas;
- módulos;
- horas;
- avaliações.

O sistema deverá aceitar casos em que o total é desconhecido.

---

## 12. Anotações, citações e reflexões

### 12.1 Tipos

- nota;
- citação;
- reflexão;
- pergunta;
- resumo;
- ideia;
- referência;
- vocabulário;
- revisão.

### 12.2 Metadados

Cada anotação poderá ter:

- registro relacionado;
- localização;
- página;
- episódio;
- temporada;
- minuto;
- módulo;
- aula;
- data;
- etiquetas;
- favoritos;
- anexos;
- links;
- conexões.

### 12.3 Editor

O editor poderá oferecer:

- texto simples;
- Markdown;
- listas;
- destaque;
- negrito;
- itálico;
- títulos;
- links;
- citações;
- modo foco;
- salvamento automático.

### 12.4 Conexões

O usuário poderá ligar:

- uma citação a uma reflexão;
- uma anotação a vários registros;
- temas semelhantes;
- personagens;
- conceitos;
- estudos;
- autores.

Essa função transforma o arquivo em uma pequena rede pessoal de conhecimento.

---

## 13. Revisão e memória

O aplicativo poderá ajudar o usuário a revisitar registros sem impor pressão.

Funções possíveis:

- “Neste dia”;
- citação aleatória;
- anotação antiga;
- livro concluído há um ano;
- revisão de estudo;
- cartões de memória opcionais;
- lembretes gentis;
- biblioteca comentando um registro antigo.

O sistema não deve empregar linguagem de culpa.

---

## 14. Biblioteca visual

### 14.1 Estrutura inicial

A biblioteca começa com:

- sala principal;
- uma estante;
- balcão;
- bibliotecária;
- criatura;
- iluminação limitada.

### 14.2 Expansão

Possíveis áreas:

- salão principal;
- ala de literatura;
- arquivo de citações;
- sala de estudos;
- sala de projeção;
- observatório;
- jardim interno;
- oficina de restauração;
- depósito;
- torre;
- porão;
- galeria;
- sala de mapas;
- ala arcana;
- sala de música;
- pátio.

### 14.3 Critérios de desbloqueio

As salas não devem depender apenas de nível.

Exemplos:

- sala de estudos: horas ou sessões registradas;
- sala de projeção: filmes e séries concluídos;
- arquivo de citações: quantidade e diversidade de citações;
- jardim: constância sem pressão;
- observatório: registros científicos;
- ala arcana: fantasia, mitologia ou ficção especulativa;
- galeria: capas, favoritos ou avaliações;
- torre: biblioteca madura e diversos tipos concluídos.

### 14.4 Estantes

Cada estante pode representar:

- categoria;
- gênero;
- período;
- autor;
- projeto;
- disciplina;
- coleção manual;
- etiqueta.

O usuário poderá:

- nomear estantes;
- mover registros;
- definir critérios automáticos;
- trocar aparência;
- destacar favoritos.

### 14.5 Representação visual

Para evitar milhares de objetos individuais:

- usar estados visuais por lotação;
- agrupar lombadas;
- gerar padrões;
- usar atlas de texturas;
- mostrar apenas parte dos registros;
- permitir inspeção detalhada por interface;
- carregar salas sob demanda.

---

## 15. Ecossistema

O ecossistema deve reagir ao comportamento do usuário.

### 15.1 Elementos

- plantas;
- insetos mágicos;
- pequenos animais;
- espíritos;
- poeira luminosa;
- fungos;
- pássaros;
- peixes;
- objetos encantados;
- clima interno;
- luz;
- sons.

### 15.2 Evolução

Exemplos:

- mais atividade gera movimento;
- revisões fazem personagens procurar livros antigos;
- diversidade de temas aumenta variedade de criaturas;
- registros científicos atraem instrumentos;
- fantasia altera elementos mágicos;
- longos períodos sem uso deixam o local silencioso, nunca degradado de forma punitiva;
- retorno após pausa provoca acolhimento, não repreensão.

### 15.3 Regras éticas

O ecossistema não deve:

- morrer por falta de uso;
- ameaçar o usuário;
- exigir sequência diária;
- punir pausas;
- usar culpa para aumentar retenção;
- esconder funções essenciais atrás de comportamento compulsivo.

---

## 16. Personagens

### 16.1 Bibliotecária

Papel:

- guia;
- guardiã;
- comentarista;
- personagem central;
- mediadora entre aplicativo e biblioteca.

Ela não deve parecer uma assistente artificial onisciente.

### 16.2 Pesquisador

Desbloqueado por:

- estudos;
- anotações;
- revisões;
- conexões entre temas.

### 16.3 Restauradora

Desbloqueada por:

- revisitas;
- releituras;
- edição de registros antigos;
- organização.

### 16.4 Projecionista

Desbloqueado por:

- filmes;
- séries;
- anotações audiovisuais.

### 16.5 Cartógrafa

Desbloqueada por:

- diversidade de assuntos;
- criação de etiquetas;
- conexões;
- exploração de salas.

### 16.6 Criaturas

Podem possuir:

- rotinas;
- preferências;
- animações;
- locais favoritos;
- pequenas histórias;
- interações entre si;
- reações ao toque;
- vínculos com tipos de registro.

---

## 17. Rotinas e interações

Personagens poderão:

- caminhar;
- ler;
- conversar;
- organizar estantes;
- observar objetos;
- descansar;
- visitar salas;
- reagir a eventos;
- interagir com criaturas;
- carregar livros;
- escrever;
- acender luzes;
- limpar;
- examinar decorações.

As rotinas devem ser:

- simples;
- previsíveis;
- leves;
- determinadas por estados;
- não dependentes de simulação pesada.

---

## 18. Sistema de diálogo

### 18.1 Fontes de contexto

Diálogos podem considerar:

- tipo de registro;
- status;
- progresso;
- horário;
- marco;
- atividade recente;
- revisita;
- primeira ação;
- quantidade de registros;
- categoria predominante;
- sala atual.

### 18.2 Limites

O sistema não deve afirmar conhecer o conteúdo de uma obra apenas pelo título.

Comentários sobre conteúdo real só devem ocorrer quando:

- existirem dados confiáveis;
- o usuário tiver fornecido contexto;
- houver integração externa autorizada;
- o comentário for explicitamente marcado como baseado em metadados.

### 18.3 Estrutura

Diálogos serão organizados por:

- personagem;
- evento;
- condição;
- prioridade;
- frequência;
- histórico;
- variações;
- bloqueios de repetição.

### 18.4 Futuro uso de IA

Uma camada de IA poderia, futuramente:

- resumir anotações autorizadas;
- sugerir conexões;
- gerar perguntas de revisão;
- ajudar a organizar etiquetas;
- produzir comentários contextuais.

Mas deverá ser:

- opcional;
- transparente;
- separada do núcleo;
- limitada por privacidade;
- desativável;
- nunca responsável por funções essenciais.

---

## 19. Gamificação

### 19.1 Progressão

Possíveis indicadores:

- nível da biblioteca;
- reputação de salas;
- coleção;
- diversidade;
- profundidade;
- revisitas;
- conclusão;
- organização.

### 19.2 Recompensas

- estantes;
- salas;
- móveis;
- iluminação;
- personagens;
- criaturas;
- músicas;
- efeitos;
- roupas;
- temas;
- molduras;
- objetos interativos.

### 19.3 Conquistas

Devem celebrar:

- primeiro registro;
- primeira conclusão;
- primeira citação;
- primeira revisão;
- diversidade;
- releitura;
- sequência de estudos sem obrigatoriedade diária;
- retorno após pausa;
- coleção temática;
- organização.

### 19.4 Moeda

Uma moeda interna pode existir apenas se possuir função clara.

Riscos:

- transformar leitura em trabalho;
- incentivar ações vazias;
- criar economia artificial;
- abrir caminho para monetização predatória.

Recomendação:

- não incluir moeda na primeira versão pública;
- preferir desbloqueios por marcos reais.

---

## 20. Metas e hábitos

Metas serão opcionais.

Exemplos:

- ler determinada quantidade;
- estudar certo número de horas;
- concluir um registro;
- revisar anotações;
- registrar citações;
- acompanhar uma série.

O aplicativo deve aceitar:

- metas sem prazo;
- pausas;
- alteração;
- cancelamento;
- metas privadas;
- ausência completa de metas.

---

## 21. Calendário e histórico

Funções:

- calendário de atividades;
- linha do tempo;
- sessões;
- conclusões;
- anotações;
- revisões;
- marcos da biblioteca;
- filtros por tipo;
- períodos personalizados.

O histórico deve preservar a trajetória sem transformar tudo em ranking.

---

## 22. Estatísticas

### Gerais

- registros criados;
- registros concluídos;
- tempo acumulado;
- páginas;
- episódios;
- filmes;
- estudos;
- anotações;
- citações.

### Por período

- semana;
- mês;
- ano;
- intervalo personalizado.

### Por categoria

- gênero;
- autor;
- tema;
- disciplina;
- formato;
- idioma;
- etiqueta.

### Visuais

- gráficos simples;
- mapas de calor opcionais;
- evolução da biblioteca;
- distribuição;
- linha do tempo;
- comparações pessoais.

Evitar comparações sociais por padrão.

---

## 23. Busca, filtros e organização

Busca por:

- título;
- autor;
- texto de anotação;
- citação;
- etiqueta;
- gênero;
- personagem;
- disciplina;
- ano;
- plataforma.

Filtros:

- tipo;
- status;
- avaliação;
- progresso;
- data;
- favorito;
- sala;
- estante;
- coleção;
- origem.

Ordenação:

- recente;
- título;
- progresso;
- conclusão;
- avaliação;
- criação;
- atualização;
- autor.

---

## 24. Importação e integrações

### 24.1 Importação manual

- JSON;
- CSV;
- planilha;
- Markdown;
- arquivo de backup.

### 24.2 Catálogos externos

Possíveis integrações:

- Open Library;
- Google Books;
- TMDB;
- APIs de séries;
- metadados de ISBN.

Essas integrações precisam ser verificadas quanto a:

- licença;
- limites;
- estabilidade;
- privacidade;
- custo;
- disponibilidade regional.

### 24.3 Captura

Possibilidades futuras:

- leitura de código de barras;
- busca por ISBN;
- seleção de capa;
- reconhecimento de texto;
- compartilhamento para o aplicativo;
- captura rápida de citação.

---

## 25. Conta e sincronização

### 25.1 Conta opcional

O aplicativo deverá funcionar localmente sem conta sempre que possível.

A conta será necessária apenas para:

- sincronização;
- backup em nuvem;
- uso em vários aparelhos;
- recuperação;
- funções sociais opcionais.

### 25.2 Sincronização

Requisitos:

- funcionamento offline;
- fila de sincronização;
- resolução de conflitos;
- versionamento de registros;
- criptografia em trânsito;
- controle de exclusão;
- indicador de estado.

### 25.3 Backup

- automático opcional;
- manual;
- exportação;
- restauração;
- histórico limitado;
- verificação de integridade.

---

## 26. Privacidade e segurança

### 26.1 Princípios

- privado por padrão;
- coleta mínima;
- consentimento claro;
- exclusão real;
- exportação;
- sem venda de dados;
- sem publicidade baseada em conteúdo pessoal;
- transparência.

### 26.2 Dados sensíveis

Estudos e anotações podem conter:

- informações acadêmicas;
- pensamentos pessoais;
- dados profissionais;
- saúde;
- projetos;
- relacionamentos.

O sistema deve tratar todo conteúdo como potencialmente sensível.

### 26.3 Segurança

- autenticação segura;
- tokens protegidos;
- políticas de acesso;
- criptografia em trânsito;
- proteção contra injeção;
- validação;
- backups;
- logs sem conteúdo privado;
- auditoria;
- controle de sessão.

---

## 27. Notificações

Notificações devem ser opcionais.

Tipos:

- lembrete de meta;
- registro parado;
- revisão;
- marco;
- backup;
- sincronização;
- evento da biblioteca;
- citação antiga.

Tom:

- gentil;
- não punitivo;
- sem urgência falsa;
- sem manipulação.

Frequência configurável.

---

## 28. Personalização

O usuário poderá personalizar:

- tema;
- iluminação;
- estantes;
- móveis;
- disposição;
- trilha sonora;
- efeitos;
- roupas da bibliotecária;
- aparência de criaturas;
- nome da biblioteca;
- nome de salas;
- organização.

A personalização deve vir principalmente do uso, não de compras.

---

## 29. Acessibilidade

Requisitos:

- modo de alto contraste;
- redução de movimento;
- tamanho de fonte;
- navegação por teclado;
- suporte a leitor de tela na interface;
- rótulos;
- legendas;
- controle de áudio;
- feedback visual e textual;
- áreas de toque adequadas;
- ausência de informações transmitidas apenas por cor.

A biblioteca visual não poderá ser a única forma de acessar funções.

---

## 30. Modo offline

O aplicativo deverá:

- abrir offline;
- permitir criar e editar registros;
- salvar anotações;
- atualizar progresso;
- mostrar a biblioteca;
- sincronizar depois;
- informar estado de conexão sem bloquear o usuário.

---

## 31. Compartilhamento e social

Funções sociais devem ser posteriores e opcionais.

Possibilidades:

- compartilhar card de conclusão;
- compartilhar citação;
- exportar resenha;
- mostrar imagem da biblioteca;
- clube privado;
- recomendações entre amigos;
- visitas controladas.

Riscos:

- comparação;
- exposição de dados;
- moderação;
- assédio;
- aumento de complexidade;
- perda do caráter íntimo.

Recomendação:

- iniciar apenas com compartilhamento de imagens e textos escolhidos pelo usuário;
- não criar feed social no MVP.

---

## 32. Layout geral

### 32.1 Navegação móvel

Sugestão de barra inferior:

- Biblioteca;
- Coleção;
- Novo;
- Arquivo;
- Perfil.

### 32.2 Biblioteca

- ocupa maior parte da tela;
- interface mínima;
- botões flutuantes;
- painéis abertos sobre o cenário;
- gestos simples;
- nenhum joystick.

### 32.3 Coleção

- cards ou lista;
- busca fixa;
- filtros em gaveta;
- indicador de progresso;
- suporte a capas;
- carregamento eficiente.

### 32.4 Registro

- formulário em etapas;
- campos adaptados ao tipo;
- preenchimento rápido;
- opção avançada;
- rascunho automático.

### 32.5 Arquivo

- pesquisa textual;
- agrupamento por tipo;
- etiquetas;
- favoritos;
- conexões;
- modo de leitura.

### 32.6 Perfil

- estatísticas;
- calendário;
- marcos;
- configurações;
- backup;
- conta;
- acessibilidade.

---

## 33. Direção artística

### 33.1 Estilo

- pixel art;
- visão superior;
- detalhes acolhedores;
- fantasia discreta;
- sensação de espaço íntimo;
- evolução gradual;
- animações econômicas.

### 33.2 Paleta

Base:

- madeira escura;
- dourado;
- verde profundo;
- azul noturno;
- creme;
- luz âmbar.

Variações podem surgir por sala e tema.

### 33.3 Princípios

- legibilidade antes de detalhe;
- silhuetas claras;
- poucos elementos animados;
- reutilização inteligente;
- contraste;
- consistência;
- escala adequada ao celular.

---

## 34. Áudio

### 34.1 Música

- temas por sala;
- variações de intensidade;
- loops longos;
- opção de desligar;
- volume separado.

### 34.2 Efeitos

- páginas;
- passos;
- madeira;
- sino;
- escrita;
- criaturas;
- conclusão;
- desbloqueio;
- ambiente.

### 34.3 Acessibilidade

- legendas para eventos importantes;
- feedback visual equivalente;
- controle individual de volume.

---

## 35. Arquitetura técnica sugerida

### 35.1 Front-end

Possível composição:

- TypeScript;
- React para interface;
- Phaser 3 para biblioteca;
- Vite;
- gerenciamento de estado leve;
- sistema de design próprio;
- PWA;
- Capacitor.

### 35.2 Persistência local

- IndexedDB;
- Dexie;
- cache;
- fila offline;
- migrações;
- exportação.

### 35.3 Back-end futuro

Possibilidades:

- Supabase;
- serviço próprio com Node.js;
- PostgreSQL;
- autenticação;
- armazenamento de arquivos;
- filas;
- API.

Decisão deverá considerar:

- custo;
- simplicidade;
- portabilidade;
- privacidade;
- escalabilidade;
- domínio da equipe.

### 35.4 Divisão por camadas

```text
Presentation
├── React UI
├── Phaser View
└── Accessibility Layer

Application
├── Use Cases
├── Commands
├── Queries
└── Events

Domain
├── Entities
├── Value Objects
├── Rules
├── Progress
├── Unlocks
└── Validation

Infrastructure
├── IndexedDB
├── API
├── Authentication
├── Sync
├── Files
└── Analytics

Content
├── Dialogues
├── Milestones
├── Rooms
├── Characters
├── Decorations
└── Localization
```

---

## 36. Modelo conceitual de dados

Entidades principais:

- User;
- Profile;
- Library;
- Room;
- Shelf;
- Decoration;
- Character;
- Creature;
- Record;
- Book;
- Movie;
- Series;
- Study;
- Course;
- Note;
- Quote;
- Reflection;
- Tag;
- Collection;
- ProgressEntry;
- Session;
- Goal;
- Milestone;
- Unlock;
- DialogueHistory;
- Activity;
- Attachment;
- SyncState;
- Backup.

Relacionamentos importantes:

- usuário possui biblioteca;
- biblioteca possui salas;
- sala possui estantes;
- estante contém registros;
- registro possui progresso;
- registro possui anotações;
- anotação possui etiquetas;
- marcos geram desbloqueios;
- atividades alimentam estatísticas;
- personagens usam condições de diálogo;
- conta sincroniza dispositivos.

---

## 37. Eventos de domínio

Exemplos:

- RecordCreated;
- RecordUpdated;
- ProgressUpdated;
- RecordPaused;
- RecordResumed;
- RecordCompleted;
- RecordAbandoned;
- NoteCreated;
- QuoteCreated;
- ReviewCompleted;
- MilestoneReached;
- DecorationUnlocked;
- RoomUnlocked;
- CharacterUnlocked;
- BackupCreated;
- SyncCompleted.

Esses eventos permitirão que o aplicativo reaja sem acoplar toda a lógica.

---

## 38. Motor de progressão

O motor receberá eventos e avaliará regras.

Exemplo:

```text
Evento: RecordCompleted
Tipo: Book
Gênero: Fantasy

Possíveis efeitos:
- aumentar contador de livros;
- aumentar progresso da ala literária;
- avaliar marco de primeira conclusão;
- avaliar marco de fantasia;
- desbloquear decoração;
- agendar diálogo;
- atualizar estatísticas;
- atualizar estante;
```

As regras deverão ser:

- declarativas quando possível;
- testáveis;
- versionadas;
- independentes do Phaser;
- reconstruíveis a partir dos dados.

---

## 39. Motor de diálogo

Cada entrada poderá possuir:

- id;
- personagem;
- evento;
- condições;
- prioridade;
- peso;
- intervalo;
- bloqueio;
- texto;
- variações;
- ações;
- localização.

Exemplo conceitual:

```json
{
  "id": "librarian.first_book_completed",
  "character": "librarian",
  "event": "RecordCompleted",
  "conditions": {
    "recordType": "book",
    "completedBooks": 1
  },
  "priority": 100,
  "once": true
}
```

---

## 40. Localização

O produto deve nascer preparado para tradução.

Inicialmente:

- português do Brasil.

Futuro:

- inglês;
- espanhol.

Requisitos:

- textos fora do código;
- pluralização;
- datas;
- números;
- unidades;
- nomes próprios;
- tamanho variável;
- fontes compatíveis.

---

## 41. Telemetria e análise

Somente com consentimento e sem coletar conteúdo pessoal.

Métricas possíveis:

- abertura;
- criação de registro;
- conclusão de fluxo;
- erro;
- abandono de tela;
- uso de funções;
- desempenho;
- falhas de sincronização.

Nunca coletar por padrão:

- texto de anotações;
- citações;
- títulos privados;
- conteúdo de estudos;
- nomes de arquivos.

---

## 42. Monetização

A monetização não deve ser definida antes da validação.

Modelos possíveis:

- compra única;
- assinatura para nuvem;
- plano gratuito local;
- pacote de apoio;
- temas cosméticos;
- versão premium.

Evitar:

- anúncios invasivos;
- venda de dados;
- energia;
- recompensas limitadas por tempo;
- caixas aleatórias;
- pressão diária;
- bloqueio de exportação;
- pagamento para acessar dados próprios.

Modelo recomendado:

- núcleo local gratuito ou compra única;
- assinatura opcional para sincronização e armazenamento;
- cosméticos não predatórios.

---

## 43. Estratégia de versões

### Fase 0 — Protótipo

- livros;
- uma sala;
- uma estante;
- bibliotecária;
- criatura;
- progresso;
- anotações;
- persistência local;
- PWA.

### Fase 1 — MVP

- livros, filmes, séries e estudos;
- coleção;
- busca;
- filtros;
- várias estantes;
- estatísticas básicas;
- exportação;
- Android;
- acabamento.

### Fase 2 — Biblioteca em expansão

- salas;
- mais personagens;
- desbloqueios;
- rotinas;
- calendário;
- metas;
- revisão.

### Fase 3 — Conta e sincronização

- autenticação;
- nuvem;
- vários aparelhos;
- backup;
- conflitos;
- privacidade.

### Fase 4 — Arquivo de conhecimento

- conexões;
- Markdown;
- etiquetas avançadas;
- revisão;
- busca completa;
- anexos.

### Fase 5 — Personalização e eventos

- decoração;
- temas;
- roupas;
- eventos;
- novas criaturas;
- conteúdo sazonal não compulsivo.

### Fase 6 — Recursos sociais opcionais

- compartilhamento;
- cartões;
- clubes privados;
- visitas;
- moderação.

---

## 44. Roadmap macro

### M0 — Pesquisa e validação

- entrevistas;
- análise de concorrentes;
- protótipo de papel;
- teste de fluxo;
- definição de público.

### M1 — Protótipo funcional

- executar planta específica do protótipo;
- testar ciclo principal;
- avaliar retenção qualitativa.

### M2 — Fundação do produto

- arquitetura;
- sistema de design;
- banco local;
- migrações;
- testes;
- acessibilidade.

### M3 — Registros múltiplos

- livros;
- filmes;
- séries;
- estudos;
- modelos de progresso.

### M4 — Coleção e arquivo

- busca;
- filtros;
- anotações;
- citações;
- etiquetas;
- favoritos.

### M5 — Biblioteca evolutiva

- estantes;
- salas;
- níveis;
- desbloqueios;
- decoração;
- personagens.

### M6 — Estatísticas e histórico

- calendário;
- linha do tempo;
- gráficos;
- hábitos;
- sessões.

### M7 — Android público

- Capacitor;
- testes;
- permissões;
- publicação;
- política de privacidade.

### M8 — Sincronização

- conta;
- backend;
- conflitos;
- backup;
- segurança.

### M9 — Conhecimento conectado

- relações;
- revisões;
- editor avançado;
- pesquisa completa.

### M10 — Expansão de conteúdo

- personagens;
- criaturas;
- salas;
- eventos;
- áudio;
- personalização.

---

## 45. Estimativa macro de desenvolvimento

Com uma pessoa, Codex e ajuda de planejamento:

- protótipo: 1 a 2 meses;
- MVP utilizável: 4 a 6 meses;
- versão pública bem acabada: 9 a 12 meses;
- visão ampla: 12 a 24 meses;
- produto maduro com nuvem e conteúdo constante: trabalho contínuo.

Essas estimativas dependem de:

- tempo semanal;
- experiência;
- disponibilidade de assets;
- mudanças de escopo;
- qualidade esperada;
- testes;
- backend;
- publicação;
- suporte.

---

## 46. Riscos principais

### 46.1 Escopo excessivo

Mitigação:

- versões;
- gates;
- critérios de aceite;
- lista explícita de fora de escopo.

### 46.2 Mistura de app e jogo

Mitigação:

- separar interface, domínio e Phaser;
- manter funções essenciais fora da cena;
- garantir acesso por listas.

### 46.3 Produção artística

Mitigação:

- paleta limitada;
- assets modulares;
- animações curtas;
- contratar ou adquirir pacotes apenas após validação.

### 46.4 Dados perdidos

Mitigação:

- persistência testada;
- backups;
- exportação;
- migrações;
- sincronização posterior.

### 46.5 Desempenho mobile

Mitigação:

- câmera fixa;
- carregamento por sala;
- sprites agrupados;
- efeitos limitados;
- testes em aparelhos modestos.

### 46.6 Dependência do Codex

Mitigação:

- documentação;
- revisão humana;
- testes;
- commits pequenos;
- arquitetura compreendida;
- decisões registradas.

### 46.7 Gamificação predatória

Mitigação:

- sem punição;
- sem perda;
- sem culpa;
- sem sequência obrigatória;
- metas opcionais;
- revisão ética.

### 46.8 Produto bonito, mas inútil

Mitigação:

- validar o registro;
- testar uso real;
- medir retorno;
- priorizar velocidade;
- manter coleção funcional.

---

## 47. Decisões que ainda precisam ser tomadas

- nome final;
- identidade visual;
- React ou outra camada de UI;
- PWA ou APK como primeira distribuição;
- IndexedDB puro ou Dexie;
- backend;
- modelo de monetização;
- uso de capas externas;
- armazenamento de imagens;
- profundidade da personalização;
- existência de avatar;
- sistema de salas;
- tipos definitivos de registro;
- editor Markdown;
- notificações;
- recursos sociais;
- uso de IA;
- política de conteúdo;
- classificação etária.

---

## 48. Documentação futura recomendada

Criar posteriormente:

- `VISION.md`;
- `PRODUCT.md`;
- `ROADMAP.md`;
- `ARCHITECTURE.md`;
- `GAME_DESIGN.md`;
- `DATA_MODEL.md`;
- `PRIVACY.md`;
- `SECURITY.md`;
- `TEST_PLAN.md`;
- `ACCESSIBILITY.md`;
- `ART_DIRECTION.md`;
- `CONTENT_GUIDE.md`;
- `DECISIONS.md`;
- `CHANGELOG.md`;
- `CONTRIBUTING.md`;
- `AGENTS.md`.

---

## 49. Critérios para avançar do protótipo ao MVP

Avançar apenas se:

- usuários entenderem a proposta;
- o registro for prático;
- a biblioteca gerar valor emocional;
- houver retorno espontâneo;
- os dados forem confiáveis;
- o aplicativo funcionar em celular;
- o projeto puder ser mantido;
- a expansão não exigir reescrita completa;
- houver disposição real para continuar.

Caso contrário:

- reduzir;
- reposicionar;
- transformar em projeto de portfólio;
- preservar o protótipo;
- documentar aprendizados.

---

## 50. Definição de sucesso do produto

Biblioteca Viva será bem-sucedida se:

- ajudar pessoas a preservar experiências;
- tornar revisitas mais naturais;
- funcionar como ferramenta real;
- possuir identidade própria;
- não depender de manipulação;
- respeitar privacidade;
- crescer junto com o usuário;
- permitir que cada biblioteca conte uma história diferente.

O objetivo não é criar o maior catálogo possível.

O objetivo é criar um lugar onde aquilo que o usuário leu, assistiu e aprendeu pareça ter deixado uma presença.
