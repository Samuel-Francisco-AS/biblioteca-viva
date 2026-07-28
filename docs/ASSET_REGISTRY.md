# Registro de assets e licenças

Todo asset visual, sonoro, fonte ou ícone incluído no projeto deve aparecer neste arquivo antes de um release.

## Regras

- não usar material sem origem conhecida;
- registrar licença e restrições;
- preservar comprovante quando a licença depender de compra;
- indicar modificações realizadas;
- diferenciar asset temporário, definitivo e gerado;
- não incluir arquivo de fonte proprietário no repositório sem permissão;
- não assumir que “gratuito” significa uso comercial ou redistribuição permitidos;
- assets gerados por IA precisam ter ferramenta, data e revisão humana registradas quando forem mantidos.

## Status

| ID | Tipo | Arquivo/manifesto | Origem/autoria | Licença | Modificado | Uso | Estado |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | nenhum asset registrado |

## Estados

- `provisório`: pode ser substituído e não entra em release sem revisão;
- `aprovado`: origem e uso validados;
- `restrito`: permitido apenas em condição específica;
- `remover`: não pode permanecer no projeto;
- `gerado`: produzido para o projeto, aguardando ou com aprovação.

## Dados mínimos por item

- ID estável;
- categoria: imagem, sprite, atlas, áudio, fonte, ícone ou outro;
- caminho no repositório;
- URL ou referência de aquisição, quando aplicável;
- autor e plataforma;
- nome e versão da licença;
- permissão para modificação e redistribuição;
- atribuição obrigatória;
- data de aquisição;
- alterações feitas;
- telas/cenas que usam o asset;
- responsável pela validação.

## Assets próprios

Para assets criados no projeto, registrar:

- arquivo-fonte;
- exportações usadas;
- autoria;
- data;
- ferramentas;
- resolução/escala;
- versão do manifesto;
- decisão sobre licença futura do repositório.

## Fontes

Fontes exigem cuidado separado:

- confirmar licença para embedding em aplicativo;
- não redistribuir arquivo comprado sem permissão;
- manter fallback de sistema;
- testar acentos e caracteres pt-BR;
- registrar subconjunto ou conversão, se houver.

## Release

Antes do Gate G11:

- [ ] todos os assets do bundle aparecem neste registro;
- [ ] atribuições obrigatórias estão no aplicativo ou documentação;
- [ ] nenhum item está em estado `remover` ou `restrito` incompatível;
- [ ] arquivos-fonte privados não foram empacotados por engano;
- [ ] screenshots e vídeo de portfólio também usam conteúdo autorizado.
