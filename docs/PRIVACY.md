# Privacidade

## 1. Princípio

Registros pessoais são privados por padrão. Na fase de protótipo, o aplicativo funciona sem conta e mantém dados no aparelho, salvo quando o próprio usuário exporta um backup.

## 2. Dados tratados no protótipo

- títulos e autores;
- status e progresso;
- notas e citações;
- etiquetas e avaliações;
- histórico de atividade;
- preferências de áudio e experiência;
- estado de marcos e biblioteca.

Esses dados podem revelar interesses, rotina, estudo e opiniões. Devem ser tratados como conteúdo pessoal mesmo sem nome ou e-mail.

No Prompt 6, livros, notas, citações e atividades passam a ser armazenados localmente em IndexedDB/Dexie. O aplicativo não adiciona criptografia própria. O sistema operacional ou navegador pode remover armazenamento local, especialmente sem persistência concedida; mesmo com a concessão, preservação absoluta não é prometida e backup ainda não existe.

## 3. Coleta e transmissão

No protótipo:

- não existe conta;
- não existe sincronização;
- não existe analytics de terceiros;
- não existe envio automático de conteúdo;
- não existe publicidade;
- não existe IA processando notas.

Qualquer mudança nesses pontos exige revisão deste documento, `SECURITY.md` e decisão explícita.

## 4. Backups

- exportação é iniciada pelo usuário;
- arquivo deve indicar que contém dados pessoais;
- o app não controla a segurança do destino escolhido;
- exemplos e testes não usam backup real do usuário;
- arquivos de backup devem estar no `.gitignore` quando o repositório existir.

## 5. Exclusão

O usuário deve poder:

- excluir ou arquivar registros;
- apagar notas e citações;
- limpar todos os dados com confirmação forte;
- exportar antes da limpeza;
- compreender quando uma exclusão é reversível ou definitiva.

## 6. Logs e diagnóstico

Logs técnicos podem conter IDs e códigos de erro, mas não:

- texto de notas ou citações;
- títulos reais por padrão;
- conteúdo de backup;
- caminhos com dados sensíveis;
- tokens futuros.

O painel disponível apenas em desenvolvimento e em builds diagnósticos internos mostra nome/versão do banco, abertura, suporte à persistência, contagens e falha sanitizada. Ele nunca lista títulos, autores, notas, citações, payloads ou stack traces e não integra o build normal de produção.

## 7. Portfólio e demonstração

Screenshots, vídeos e fixtures públicas devem usar conteúdo fictício ou de domínio público. Nunca publicar biblioteca pessoal sem revisão deliberada.

## 8. Gatilhos para política pública

Criar política de privacidade formal antes de:

- publicar em loja para terceiros;
- criar conta;
- coletar telemetria;
- usar serviços externos;
- sincronizar dados;
- permitir compartilhamento;
- monetizar;
- tratar dados de crianças ou grupos sensíveis.
