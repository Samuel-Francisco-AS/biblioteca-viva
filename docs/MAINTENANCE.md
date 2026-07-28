# Manutenção e evolução

## 1. Objetivo

Evitar que o protótipo funcional se torne uma base rígida ou uma coleção de remendos produzidos por prompts sucessivos.

## 2. Regra de mudança vertical

Uma expansão entra como fatia completa:

- domínio;
- caso de uso;
- persistência;
- interface React;
- projeção visual quando aplicável;
- conteúdo;
- testes;
- migração;
- documentação.

Não adicionar campo no banco e “resolver o resto depois” sem registrar dívida e prazo.

## 3. Dependências

- atualizar em lotes pequenos;
- ler notas de versão;
- executar suíte e APK;
- evitar salto simultâneo de React, Phaser, Capacitor e banco;
- registrar mudança estrutural;
- manter lockfile;
- remover dependência não usada.

## 4. Banco e migrações

- nunca editar migração publicada para fingir que sempre esteve correta;
- adicionar nova versão;
- manter fixtures antigas;
- testar atualização e restauração;
- garantir que versão anterior de backup tenha política clara;
- preservar exportação antes de migração arriscada.

## 5. Conteúdo

- IDs permanecem estáveis;
- texto pode mudar sem alterar lógica;
- remoção de decoração ou marco precisa de fallback;
- manifests possuem schema e teste;
- assets ausentes não quebram cena.

## 6. Refatoração

Refatorar quando houver evidência:

- mesma regra duplicada;
- camada violada;
- teste difícil por acoplamento;
- mudança recorrente exige editar muitos lugares;
- arquivo não pode ser explicado;
- desempenho medido exige mudança.

Não refatorar para seguir moda, criar “clean architecture” cerimonial ou satisfazer um agente inquieto.

## 7. Documentação

Ao concluir um prompt:

- atualizar `STATUS.md`;
- atualizar `ROADMAP.md` se estado mudou;
- registrar decisão relevante;
- atualizar modelo/UX/testes afetados;
- adicionar changelog quando comportamento observável mudou;
- não duplicar a mesma informação em três documentos.

## 8. Débito técnico

Todo débito aceito precisa de:

- descrição;
- motivo;
- impacto;
- gatilho para resolver;
- gate máximo até o qual pode permanecer;
- responsável, normalmente Sam.

Débito sem gatilho é só abandono com roupa social.

## 9. Backup do projeto

- repositório remoto;
- tags de gates relevantes;
- keystore em local separado;
- assets-fonte protegidos;
- documentos no Git;
- backups pessoais nunca no repositório.

## 10. Continuidade

O projeto é considerado manutenível quando uma nova sessão consegue:

1. ler `STATUS.md`;
2. localizar a decisão e o prompt;
3. executar testes;
4. entender o diff;
5. continuar sem depender da conversa anterior.
