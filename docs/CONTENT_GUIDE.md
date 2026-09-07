# Conteúdo, diálogos e localização

## Princípios

Conteúdo é local, versionado e validado. Não existem CMS, serviço remoto, interpretação automática de obras ou IA processando registros pessoais.

- IDs são estáveis e não mudam com revisão textual.
- `pt-BR` é o locale inicial e fallback.
- Texto é curto, claro em mobile e não punitivo.
- O sistema não afirma fatos que não conhece.
- Histórico mínimo não armazena conteúdo pessoal.

## Estrutura

`src/content/` contém bundles de locale, catálogo declarativo, schemas e testes. `DialogueSelector` e o serviço pertencem à aplicação; histórico técnico mínimo usa a infraestrutura existente.

Phaser emite interação tipada. React solicita conteúdo localizado e apresenta painel acessível. Áudio e diálogo podem coexistir, mas não dependem um do outro.

## IDs

Use nomes hierárquicos e estáveis, por exemplo:

- `dialogue.librarian.first-book`;
- `character.librarian`;
- `room.main`;
- `decoration.reading-lamp`;
- `interface.dialogue.close`.

## Novo texto em contexto existente

1. Criar chave no locale.
2. Adicionar definição com ID, personagem, evento, condições, prioridade, `once` e cooldown.
3. Validar referências e fallback.
4. Executar testes de conteúdo e seleção.

## Novo contexto

1. Confirmar que o fato é conhecido e não expõe conteúdo pessoal.
2. Ampliar contrato somente quando os fatos existentes não expressarem o caso.
3. Definir fallback.
4. Testar prioridade, repetição, cooldown e ausência de referência.
5. Integrar pela aplicação/React, não pela cena.

## Revisão

- schema e referências válidos;
- tom sem culpa, ranking ou coerção;
- limite epistemológico respeitado;
- texto legível e anunciável;
- fallback presente;
- repetição aceitável;
- nenhuma informação pessoal em log ou histórico;
- licença registrada quando o conteúdo não for autoria interna.
