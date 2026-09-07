# Áudio

## Papel

Som reforça atmosfera e feedback, mas nunca é a única forma de compreender estado ou confirmar ação.

## Arquitetura

Áudio fica atrás de uma porta da aplicação. O manifesto declara IDs estáveis, tipo, fontes e política. React solicita intenções; Phaser não controla persistência sonora nem regra de produto.

Preferências de música e efeitos são independentes. Preparação após gesto permitido, pause/resume, visibility, término natural, troca de rota e dispose devem manter uma única cadeia ativa e ignorar callbacks obsoletos.

## Playlist e fallback

Playlist é declarativa, ordenada e validada. Referência ausente, duplicada, não musical ou lista vazia falha em desenvolvimento. Falta de backend ou arquivo degrada para silêncio, sem loop de tentativas.

## Feedback equivalente

Conclusão, desbloqueio, erro e seleção possuem texto ou estado visual equivalente. Movimento reduzido não altera semântica sonora. Autoplay não pode surpreender nem contornar preferências.

## Assets

Os WAVs atuais são criações internas determinísticas e permanecem substituíveis pelo manifesto. Mudança exige atualizar arquivo-fonte, manifesto, teste, `ASSET_REGISTRY.md` e licença.

## Verificação

- manifesto, arquivos e formatos válidos;
- ausência segura de asset;
- volumes e mute persistidos;
- entrada/saída repetida sem player duplicado;
- término natural e wrap-around;
- background/foreground;
- feedback textual equivalente;
- validação auditiva no navegador e no Moto G06.

A validação auditiva final em aparelho permanece aberta; build ou teste automatizado não equivale à aprovação percebida.
