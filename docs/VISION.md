# Visão da Biblioteca Viva

> Revisão de direção: 2026-08-18
> Estado: direção aprovada; W1 tem implementação técnica corrigida e aguarda validação humana no Moto G06.

## Frase de produto
> Aquilo que você lê, assiste, aprende, pratica e constrói deixa memória em um lugar que cresce com você.

## Propósito
Transformar registros culturais, de aprendizado, prática e trabalho em um espaço pessoal, visível, afetivo e persistente. A Biblioteca Viva não deve apenas mostrar estatísticas ou uma coleção: deve materializar a trajetória do usuário em um ambiente que se expande, ganha objetos, habitantes, marcas e organização própria.

## Promessa central
Registrar e viver experiências altera a memória estruturada do aplicativo e o mundo visual pessoal que a representa. O usuário não recebe uma sala pronta para cada categoria: ele constrói, ocupa e reorganiza uma biblioteca/casa viva ao longo do tempo.

## Princípios
1. Registro antes da gamificação.
2. O mundo é consequência da vida registrada, não um placar.
3. Liberdade espacial: o usuário decide como ocupar o espaço.
4. Desbloqueio não é imposição: conquistar um objeto não determina onde colocá-lo.
5. Progresso sem culpa.
6. Visual e som são núcleo; dados e ações essenciais continuam acessíveis fora da cena.
7. Privacidade por padrão e local-first.
8. Phaser é mundo, não banco.
9. Crescimento modular.
10. Manutenção humana.

## Experiência desejada
O usuário deve sentir que aquele lugar é dele; que existe continuidade espacial; que explora um ambiente em vez de trocar artificialmente de aba; que objetos conquistados podem ser posicionados e reorganizados; que novas áreas parecem expansão da construção; e que retornar é reencontrar um lugar conhecido.

## Anti-visão
Não virar planilha com pixel art, cinco dashboards fantasiados de cômodos, casa em que cada categoria exige um quarto, jogo de decoração desconectado dos registros, máquina de streaks, editor penoso ou arquitetura inflada.

## Horizonte espacial
O ambiente começa pequeno e cresce organicamente. Cômodos, corredores e expansões são semanticamente neutros. Categorias vivem no domínio dos dados; o espaço pertence ao usuário.

## Horizonte técnico
React permanece responsável pela aplicação convencional e acessível. Phaser evolui de renderer de “sala atual” para runtime de mundo 2D/2.5D persistente com câmera, espaços conectados, objetos e habitantes. Dexie continua como adaptador local enquanto atender ao produto. 3D real, conta, sincronização e social ficam fora deste reboot.
