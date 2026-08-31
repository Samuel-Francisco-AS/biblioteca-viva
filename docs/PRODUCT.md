# Produto — Biblioteca Viva

## Contrato atual

A Biblioteca Viva mantém registros pessoais localmente e oferece uma Biblioteca visual opcional. A pessoa pode construir uma biblioteca estrutural simples: adicionar/remover pisos, colocar, mover, girar e guardar paredes/cantos/porta horizontal a partir de inventário físico.

O mundo começa com um único cômodo simples e persistido. Pisos são células; paredes 1/2/4, cantos e porta horizontal são peças declaradas. A porta vertical não existe por decisão de assets. Assets ausentes degradam para fallback utilizável, sem bloquear dados ou operações.

## Progressão estrutural

Uma sessão conta para estrutura somente se estiver concluída, tiver duração positiva e estiver ligada a um registro existente do mesmo tipo. Os marcos cumulativos são 1, 5, 15 e 30 sessões elegíveis. Cada marco grava concessões físicas por família; não há XP, moedas, nível ou streak. Depois do marco 30 não há nova mecânica oculta: a projeção informa conclusão dos marcos atuais.

O unlock apresenta feedback consolidado, anúncio acessível e a ação `Abrir construção`. O usuário pode dispensar o feedback; nenhum áudio ou animação reaparece em reload sem um novo evento persistido.

## Limites W3-A

W3-A não implementa estantes reativas, livros visuais associados a atividades, livro aberto manipulável, leitor em forma de livro, portas verticais, novos mundos, personagem, multiplayer, nuvem ou analytics. A arte, seams e ergonomia no Moto G06 dependem de aprovação humana posterior.
