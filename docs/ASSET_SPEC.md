# ASSET_SPEC.md — Especificação visual e técnica de assets da Biblioteca Viva

> Revisão: 2026-08-18  
> Estado: especificação inicial aprovada para produção do primeiro kit visual do reboot espacial.  
> Escopo: assets 2D/2.5D usados pelo mundo Phaser.  
> Documento relacionado: `ART_DIRECTION.md`, `WORLD_MODEL.md`, `ARCHITECTURE.md`, `ASSET_REGISTRY.md`.

---

## 1. Objetivo

Este documento define a gramática visual e técnica dos assets da Biblioteca Viva antes da produção em escala.

A intenção é impedir que o projeto acumule imagens bonitas, porém incompatíveis entre si em:

- perspectiva;
- escala;
- iluminação;
- pivô;
- footprint;
- rotação;
- profundidade;
- hit area;
- nomenclatura;
- organização;
- uso no Phaser.

A Biblioteca Viva deve ser construída por peças reutilizáveis, e não por uma imagem única pré-renderizada.

A referência artística aprovada é a família de mockups apresentada em 2026-08-18: construção contínua vista de cima, madeira e pedra envelhecidas, vegetação, iluminação quente, exterior escuro/verde, alta densidade de detalhes e leitura clara dos objetos em mobile.

Essas referências orientam **linguagem, proporção e atmosfera**. Elas não devem ser recortadas para formar assets finais.

---

# 2. Decisão de perspectiva

## 2.1 Perspectiva oficial inicial

Adotar:

> **top-down oblíquo 2.5D ortogonal**

Isto significa:

- o mapa continua trabalhando em coordenadas cartesianas X/Y;
- paredes seguem eixos horizontais e verticais;
- não existe grade isométrica;
- o chão é visto predominantemente de cima;
- móveis, paredes e personagens exibem faces frontais/laterais suficientes para transmitir volume;
- profundidade é simulada por arte 2D, sobreposição e ordenação;
- não há geometria 3D real.

A aparência desejada é semelhante aos mockups aprovados: legível como planta vista de cima, mas com espessura de paredes, faces de móveis e personagens visíveis.

## 2.2 O que NÃO usar nesta fase

Não adotar como padrão:

- isometria 2:1;
- câmera perspectiva 3D;
- modelos 3D;
- sprites totalmente frontais sem relação com o chão;
- top-down puro que mostre somente o topo dos móveis;
- rotação arbitrária de bitmaps para fingir novas orientações.

Uma futura revisão para isometria só deve ocorrer após protótipo deliberado e decisão registrada.

---

# 3. Escala do mundo

## 3.1 Regra principal

A escala visual deve seguir o teste feito no Moto G06 com os mockups aprovados:

- o enquadramento normal mostra **uma região da construção**, não o complexo inteiro;
- um cômodo grande pode ocupar aproximadamente toda a largura útil da viewport;
- partes de corredores ou cômodos adjacentes podem aparecer nas bordas;
- personagem e móveis continuam legíveis e tocáveis;
- o mundo deve parecer maior que a tela.

O mockup completo representa uma visão geral da construção. Ele **não representa o zoom normal de uso**.

## 3.2 Unidade lógica

Adotar inicialmente:

```text
1 célula lógica = 32 world units
```

A célula é uma unidade de:

- footprint;
- alinhamento;
- colisão;
- construção;
- snap opcional;
- planejamento espacial.

Ela não é necessariamente um tile visual visível.

## 3.3 Densidade de arte

Exportar assets raster preferencialmente em:

```text
2× a densidade lógica
64 px de imagem para cada 32 world units
```

Exemplo:

```text
footprint lógico: 2 × 1 células
área lógica:      64 × 32 world units
arte base:        ~128 × 64 px ou maior, conforme a altura visual
```

A arte pode ultrapassar o footprint verticalmente.

A resolução do PNG não define a colisão.

## 3.4 Por que usar fonte 2×

A fonte 2×:

- preserva detalhes do estilo das referências;
- tolera pequenas variações de zoom;
- reduz aparência serrilhada;
- funciona melhor com câmera suave;
- permite exportação futura em densidades diferentes sem redesenhar tudo.

A Biblioteca Viva **não será pixel art estrita de baixa resolução**. A direção é “pixel-art-inspired / illustrated 2D”, com detalhe alto e câmera suave.

### Achado W3-A

A família de paredes mede 300 px visíveis por célula lógica nos segmentos: horizontal 1/2/4 = 300/600/1200 px de largura; vertical 1/2/4 = 300/600/1200 px de altura. Ela é renderizada por escala comum de 32/300, sem crop, rotação ou espelhamento. Os segmentos preservam 24 px transparentes antes e depois do eixo longitudinal. A transformação estrutural ativa usa origem `(0,0)`, `sourceReferencePx`, bounds e planos medidos; offsets e pivôs antigos permanecem somente como compatibilidade e não posicionam sprites ou hit areas. O contrato executável de R2-A está em `art-guides/w3-a-r2-a/`: planos externos ficam nas bordas de pixel 24 e `24 + span×300`, com tolerância longitudinal zero. Esta integração não congela aprovação artística: seams, continuidade transversal e proporção no Moto G06 continuam pendentes.

---

# 4. Grid e posicionamento

## 4.1 O grid é infraestrutura

O usuário não deve enxergar uma malha permanente.

O grid existe para:

- validar posicionamento;
- impedir objetos atravessando paredes;
- simplificar footprints;
- permitir reconstrução determinística;
- facilitar futuras rotas de NPC;
- permitir snap previsível.

## 4.2 Movimento visual

Durante o drag:

- o objeto acompanha o dedo de forma contínua;
- a prévia pode mover-se livremente;
- o destino válido pode usar snap para a célula/posição permitida mais próxima;
- a posição final persistida deve ser determinística.

Não é obrigatório desenhar o grid.

## 4.3 Granularidade futura

Objetos muito pequenos podem futuramente usar meia célula ou subgrid.

Não implementar subgrid no primeiro slice sem necessidade comprovada.

---

# 5. Categorias de assets

Usar as seguintes famílias.

## 5.1 `architecture`

Elementos estruturais:

- piso;
- parede;
- canto;
- soleira;
- porta;
- janela;
- corredor;
- coluna;
- escada futura;
- molduras estruturais.

Normalmente não são movidos pelo usuário no primeiro ciclo.

## 5.2 `furniture`

Objetos grandes posicionáveis:

- escrivaninha;
- mesa;
- cadeira;
- poltrona;
- estante;
- armário;
- banco;
- equipamento de treino;
- projetor;
- sofá.

Possuem footprint e política de rotação.

## 5.3 `prop`

Objetos menores:

- livro;
- caderno;
- tinteiro;
- papéis;
- óculos;
- vaso;
- globo;
- halteres;
- caixa;
- objeto decorativo.

Um prop pode ser:

- posicionável no chão;
- montado em parede;
- colocado sobre uma superfície;
- puramente decorativo.

O suporte a superfícies/tabletop pode ser implementado depois do primeiro slice.

## 5.4 `resident`

Personagens humanos ou humanoides habitantes do mundo.

## 5.5 `creature`

Criaturas não residentes, mascotes ou entidades mágicas.

## 5.6 `fx`

Efeitos separados:

- brilho;
- sombra especial;
- poeira;
- partículas;
- feixe de luz;
- highlight;
- emissive/glow.

## 5.7 `ui-world`

Elementos visuais que pertencem ao canvas, mas representam estado de edição:

- contorno de seleção;
- footprint válido;
- footprint inválido;
- marcador de âncora em DEV.

Texto e menus continuam em React sempre que possível.

---

# 6. Paleta e materiais

## 6.1 Família cromática

A paleta deve permanecer coerente com as referências:

- carvão / preto esverdeado;
- verde floresta profundo;
- madeira nogueira escura;
- madeira média quente;
- caramelo / carvalho;
- bronze / latão;
- âmbar;
- pergaminho;
- vinho / bordô;
- azul petróleo ou teal apenas como acento;
- vegetação em verdes naturais pouco saturados.

## 6.2 Âncoras cromáticas aproximadas

Estas cores são referência, não trava de pixel:

```text
exterior escuro       #0B1511
verde floresta        #173228
madeira escura        #3A2418
madeira média         #6B4127
madeira clara         #A66A36
latão                  #C58B3A
âmbar                  #E0A64A
pergaminho             #D8C6A6
bordô                  #743B2D
azul petróleo          #35555A
```

Variantes são permitidas para material e iluminação.

## 6.3 Saturação

Evitar:

- cores neon;
- plástico muito brilhante;
- brancos puros;
- pretos puros extensos;
- madeira laranja saturada;
- verdes radioativos fora de efeitos mágicos.

O ambiente deve parecer quente, antigo, acolhedor e ligeiramente misterioso.

---

# 7. Iluminação

## 7.1 Regra central

Assets base devem ser produzidos em **iluminação neutra controlada**.

Não criar:

```text
bookshelf-morning.png
bookshelf-afternoon.png
bookshelf-night.png
bookshelf-late-night.png
```

O ciclo de tempo pertence ao runtime.

## 7.2 O que pode ser baked no sprite

Permitido:

- sombra de contato curta;
- oclusão ambiente discreta;
- pequenas diferenças de material;
- volume básico do objeto.

Evitar no asset base:

- feixe de sol forte;
- sombra longa;
- reflexo dourado de tarde;
- azul intenso de madrugada;
- luz de janela atravessando o objeto;
- glow ambiental que só existe em um período.

## 7.3 Ciclo temporal

O Phaser combina o asset neutro com atmosfera:

### Manhã
- luz natural clara;
- temperatura levemente quente;
- sombras suaves;
- sensação de ar fresco.

### Tarde
- luz natural dourada;
- direção de luz mais evidente;
- contrastes um pouco maiores;
- fachos longos permitidos como FX da cena.

### Noite
- ambiente externo escuro;
- fontes internas quentes tornam-se dominantes;
- menor exposição global.

### Madrugada
- exterior frio/azulado;
- ambiente interno mais escuro;
- pequenos bolsões quentes de luz;
- sensação mais silenciosa e íntima.

## 7.4 Objetos luminosos

Objetos que emitem luz devem preferir camadas separadas:

```text
lamp-base.png
lamp-emissive.png
```

ou estados:

```text
lamp-off.png
lamp-on.png
lamp-glow.png
```

`glow` deve possuir transparência e poder ser composto pelo Phaser.

A sprite base não deve obrigar a luz a permanecer acesa.

---

# 8. Sombras

## 8.1 Sombra de contato

Pode fazer parte do sprite quando:

- curta;
- suave;
- próxima à base;
- compatível com todos os períodos.

## 8.2 Sombra direcional

Deve ser:

- efeito de cena;
- layer separada;
- ou omitida no primeiro slice.

Nunca baked de forma forte em todos os móveis.

## 8.3 Personagens

Personagens podem usar uma pequena sombra elíptica separada e reutilizável.

Isso facilita animação e alteração de atmosfera.

---

# 9. Footprint

## 9.1 Definição

`footprint` representa a área do chão ocupada pelo objeto.

Não usar o retângulo do PNG como footprint.

Exemplo:

```text
Estante visual:

       ┌───────────┐
       │  livros   │
       │  livros   │  <- arte acima do chão
       │  livros   │
       └───────────┘
         ███████      <- footprint no chão
```

## 9.2 Primeiro formato suportado

Começar com footprints retangulares:

```ts
type Footprint = {
  widthCells: number
  heightCells: number
}
```

Polígonos complexos só entram quando um objeto real exigir.

## 9.3 Exemplos iniciais

```text
cadeira simples     1 × 1
vaso grande         1 × 1
estante pequena     2 × 1
escrivaninha        3 × 2
mesa grande         4 × 2
poltrona             2 × 2
```

Valores finais devem ser validados visualmente.

---

# 10. Pivô e ponto de colocação

## 10.1 Regra

A posição lógica do objeto deve corresponder ao **centro da base/footprint**, não ao centro geométrico do PNG.

A arte pode se estender acima dessa posição.

## 10.2 Metadado

Cada orientação exportada deve registrar:

```text
pivotX
pivotY
```

Preferir valores normalizados ou pixels documentados no manifesto.

Exemplo:

```text
pivot = centro da base do móvel
```

Não assumir `origin(0.5, 0.5)` para todos os sprites.

## 10.3 Motivo

Sem pivô explícito:

- rotação “teleporta” objeto;
- y-sort fica incorreto;
- interação não coincide com o chão;
- footprint e arte divergem.

---

# 11. Orientação e rotação

## 11.1 Rotação lógica

Persistir somente orientações discretas:

```text
0°
90°
180°
270°
```

ou enum equivalente:

```text
north
east
south
west
```

## 11.2 Regra visual crítica

**Não rotacionar automaticamente o PNG em 90° como regra geral.**

Nesta perspectiva 2.5D, cada orientação pode mostrar faces diferentes.

Portanto:

```text
bookshelf-north.png
bookshelf-east.png
bookshelf-south.png
bookshelf-west.png
```

é preferível a:

```text
bookshelf.png + sprite.angle = 90
```

## 11.3 Exceções

Objetos visualmente simétricos podem reutilizar orientação quando a perspectiva não quebra.

Exemplo possível:

- tapete;
- marcador de chão;
- objeto circular.

Essa reutilização deve ser declarada no manifest.

## 11.4 Objetos com duas orientações

Alguns móveis precisam apenas:

```text
horizontal
vertical
```

O manifest deve informar as orientações reais suportadas.

O botão Girar percorre apenas essas orientações.

---

# 12. Profundidade e ordenação

## 12.1 Objetivo

Personagens devem poder:

- passar na frente de uma mesa;
- passar atrás de uma mesa;
- desaparecer parcialmente atrás de paredes frontais;
- conviver com objetos sem parecer colagem.

## 12.2 Estrutura de layers

Modelo recomendado:

```text
00  exterior/background
10  floor
20  rugs/floor-decor
30  rear architecture
40  world sortable objects + residents
50  wall-mounted decor
60  foreground walls/occluders
70  lighting/fx
80  debug world overlays
```

UI textual permanece no React.

## 12.3 Y-sort

Objetos e habitantes que convivem no chão usam um ponto de base:

```text
sortY = bottom do footprint / ponto de contato com chão
```

Conceitualmente:

```text
depth = WORLD_BASE + sortY
```

Não usar centro da textura.

## 12.4 Occluders

Paredes frontais e elementos que precisam esconder personagens devem possuir layer própria ou segmentos de foreground.

Não desenhar toda a arquitetura em uma única textura se isso impedir oclusão correta.

---

# 13. Hit areas e toque mobile

## 13.1 Sprite não é hit area

A área de toque pode ser maior que o objeto visível.

## 13.2 Meta mobile

Alvos essenciais devem aproximar-se de pelo menos:

```text
44 × 44 CSS px percebidos
```

quando possível.

Como o mundo possui câmera/zoom, a hit area pode precisar de padding em world units.

## 13.3 Objetos pequenos

Objetos muito pequenos não devem obrigatoriamente ser selecionados por precisão de pixel.

Opções futuras:

- selecionar a superfície pai;
- modo “inspecionar”;
- lista contextual;
- hit area expandida.

## 13.4 Sobreposição

Quando duas hit areas se sobrepõem, priorizar:

1. objeto visualmente superior no depth;
2. depois o mais próximo do pointer;
3. fallback determinístico.

---

# 14. Estados visuais de edição

Não exportar quatro imagens extras para cada móvel só para indicar seleção.

Preferir tratamento em runtime:

### Normal
sprite base.

### Selecionado
- outline;
- halo;
- leve elevação visual;
- ou tint controlado.

### Movendo — válido
- transparência leve;
- footprint válido;
- feedback discreto.

### Movendo — inválido
- footprint inválido;
- feedback de cor + forma/ícone;
- não depender somente de vermelho.

### Confirmado
pequena resposta finita.

Reduced motion deve trocar estados sem animação contínua.

---

# 15. Arquitetura modular

## 15.1 Piso

Pisos precisam ser:

- tileáveis;
- sem costura perceptível;
- com variações suficientes para não formar repetição óbvia.

Recomendação:

```text
floor-wood-01-a
floor-wood-01-b
floor-wood-01-c
floor-wood-01-d
```

As variantes compartilham material.

## 15.2 Paredes

Produzir inicialmente:

- horizontal;
- vertical;
- canto interno;
- canto externo;
- terminal;
- abertura de porta;
- segmento com janela.

As junções precisam passar por teste de seam.

## 15.3 Portas

Porta é estrutura/interação própria, não apenas pintura sobre a parede.

Preparar estados quando necessário:

```text
closed
open
```

Animação futura pode usar frames intermediários.

## 15.4 Corredores

Corredores usam a mesma gramática de piso/parede das salas para preservar continuidade.

---

# 16. Personagens

## 16.1 Escala

Primeiro alvo:

```text
footprint lógico: 1 × 1 célula
altura visual:    ~1.7 a 2.2 células
```

A cabeça e o corpo podem ultrapassar bastante o footprint.

## 16.2 Canvas de frame inicial

Candidato para o primeiro personagem:

```text
96 × 128 px por frame na fonte 2×
```

Exibição aproximada:

```text
48 × 64 world units
```

Ajustar depois do primeiro teste real.

## 16.3 Direções mínimas

Preparar quatro direções:

```text
north
east
south
west
```

## 16.4 Animações mínimas iniciais

Para o primeiro kit real:

```text
idle
walk
```

Estados especializados entram depois:

```text
read
write
sit
observe
interact
carry
```

Não produzir todos antes de a escala ser aprovada.

## 16.5 Frames

Primeiro alvo:

```text
idle: 2–4 frames por direção
walk: 4–8 frames por direção
```

Animações devem ser lentas e contemplativas.

## 16.6 Reduced motion

O sistema precisa possuir frame estático legível para cada estado essencial.

---

# 17. Criatura

A criatura pode usar proporções próprias, mas deve seguir:

- mesmo sistema de direção;
- mesma lógica de pivô/base;
- shadow separada quando aplicável;
- sprite legível no zoom mobile aprovado;
- silhueta imediatamente reconhecível.

A criatura não precisa obedecer antropomorfismo.

---

# 18. Assets de superfície

Objetos sobre mesas e estantes criam um problema diferente de móveis no chão.

No primeiro slice:

- podem vir incorporados ao móvel-base;
- ou permanecer fora do sistema de posicionamento livre.

Quando o sistema de tabletop for implementado, usar anchors de superfície:

```text
surfaceAnchorId
localX
localY
```

Não projetar agora um editor completo de objetos sobre objetos.

---

# 19. Formato dos arquivos

## 19.1 Runtime

Preferir:

```text
PNG RGBA
sRGB
fundo transparente quando aplicável
```

Sem JPEG para sprites com transparência.

WebP pode ser estudado depois por tamanho, não antes da primeira integração.

## 19.2 Arquivos fonte

Manter, quando existirem, originais editáveis fora da pasta servida:

```text
art-source/
```

Exemplos:

- `.kra`;
- `.xcf`;
- `.aseprite`;
- `.psd` quando necessário;
- arquivos de referência próprios.

O runtime recebe somente exportações finais.

## 19.3 Transparência

Não deixar:

- fundo branco;
- halo opaco;
- bordas contaminadas;
- padding absurdo sem documentação.

---

# 20. Filtragem e aparência no Phaser

A direção não é pixel art estrita.

Portanto:

- câmera pode mover suavemente;
- não exigir `roundPixels` global;
- não exigir zoom inteiro;
- usar filtragem que preserve detalhe sem borrar excessivamente;
- testar LINEAR versus NEAREST no primeiro kit;
- escolher uma política única depois do teste no Moto G06.

A decisão final de filtering deve ser registrada após o primeiro asset real.

---

# 21. Nomenclatura

## 21.1 IDs de produto

IDs são estáveis e independem de nome de arquivo.

Formato recomendado:

```text
architecture.floor.wood-01
architecture.wall.stone-01
furniture.desk.wood-01
furniture.bookshelf.wood-01
prop.book.closed-01
prop.inkwell.brass-01
resident.librarian.base
creature.familiar.green-01
```

## 21.2 Arquivos

Usar kebab-case.

Exemplo:

```text
wood-bookshelf-01-north.png
wood-bookshelf-01-east.png
wood-bookshelf-01-south.png
wood-bookshelf-01-west.png
```

Não usar:

```text
estante_final_final2_nova.png
```

Nem sob ameaça.

---

# 22. Estrutura de diretórios proposta

```text
public/
└── assets/
    └── world/
        ├── architecture/
        │   ├── floors/
        │   ├── walls/
        │   ├── doors/
        │   └── windows/
        ├── furniture/
        │   ├── desks/
        │   ├── shelves/
        │   ├── seating/
        │   └── lighting/
        ├── props/
        │   ├── books/
        │   ├── stationery/
        │   ├── plants/
        │   └── decorations/
        ├── residents/
        ├── creatures/
        └── fx/
```

Arquivos fonte:

```text
art-source/
└── world/
```

Se `art-source/` ficar no Git, controlar tamanho e licenças. Não guardar material externo sem direito de uso.

---

# 23. Manifest técnico

Cada asset funcional deve possuir definição declarativa.

Exemplo conceitual:

```ts
interface WorldAssetDefinition {
  id: string
  category: "architecture" | "furniture" | "prop" | "resident" | "creature"

  sources: Partial<Record<
    "north" | "east" | "south" | "west",
    string
  >>

  footprint?: {
    widthCells: number
    heightCells: number
  }

  pivot: {
    x: number
    y: number
  }

  movable: boolean
  rotatable: boolean
  allowedOrientations?: Array<"north" | "east" | "south" | "west">

  collision?: "none" | "solid"
  interaction?: "none" | "selectable"

  depthPolicy: "floor" | "world-y-sort" | "wall" | "foreground"
}
```

O código final deve refletir necessidade real. Este exemplo serve como contrato de produção de arte, não como ordem para implementar todos os campos agora.

---

# 24. Registro de asset

Todo asset que entrar no projeto deve possuir entrada em:

```text
docs/ASSET_REGISTRY.md
```

Registrar no mínimo:

- ID;
- nome;
- categoria;
- autoria;
- origem;
- licença;
- data;
- arquivo(s);
- se foi gerado por IA;
- se foi editado manualmente;
- observações de uso.

Não versionar asset de procedência incerta.

---

# 25. Assets gerados por IA

Assets gerados por IA podem ser usados, desde que tratados como material de produção e não como resultado intocável.

Regras:

1. usar as referências aprovadas como direção, não como imagem para recorte;
2. gerar o objeto isolado quando possível;
3. exigir perspectiva e escala coerentes;
4. remover fundo;
5. corrigir bordas;
6. alinhar pivô;
7. testar footprint;
8. padronizar cor/contraste;
9. gerar orientações necessárias de forma consistente;
10. registrar origem no `ASSET_REGISTRY.md`.

Não aceitar um asset apenas porque “ficou bonito”.

Ele precisa funcionar dentro do sistema.

---

# 26. Checklist de aprovação de um asset

Antes de marcar um asset como pronto:

- [ ] segue a perspectiva top-down oblíqua aprovada;
- [ ] escala combina com personagem e mobiliário existentes;
- [ ] fundo/transparência corretos;
- [ ] não possui luz de período baked de forma incompatível;
- [ ] pivô definido;
- [ ] footprint definido;
- [ ] orientações necessárias existem;
- [ ] colisão coerente;
- [ ] hit area possível;
- [ ] y-sort funciona;
- [ ] não cria halo/borda estranha;
- [ ] legível na escala do Moto G06;
- [ ] nome/ID seguem convenção;
- [ ] autoria/licença registradas;
- [ ] asset testado dentro do Phaser, não apenas aberto como imagem.

---

# 27. Kit Zero — primeira produção

A primeira rodada de assets deve ser pequena.

## 27.1 Estrutura

Produzir:

1. piso de madeira base;
2. pelo menos 3 variantes discretas do piso;
3. parede horizontal;
4. parede vertical;
5. canto;
6. abertura de porta;
7. porta simples;
8. janela simples.

## 27.2 Mobiliário

Produzir:

9. escrivaninha inicial;
10. cadeira inicial;
11. luminária inicial;
12. estante simples.

## 27.3 Props

Produzir:

13. caderno;
14. livro fechado;
15. livro aberto;
16. tinteiro/caneta;
17. pequeno conjunto de papéis.

## 27.4 Vida

Produzir:

18. personagem inicial — somente idle/walk necessários para teste;
19. criatura inicial — idle/movimento básico;
20. sombra reutilizável.

## 27.5 Efeitos

Produzir:

21. glow de luminária;
22. highlight de seleção;
23. indicador de placement válido/inválido, inicialmente procedural se preferível.

Não produzir ainda:

- dezenas de plantas;
- equipamentos completos de treino;
- objetos de escritório em massa;
- projetores variados;
- cinco residentes finais;
- roupas;
- coleções temáticas;
- decoração rara.

Primeiro provar consistência.

---

# 28. Ordem recomendada de produção

```text
01. piso
02. parede
03. canto
04. porta
05. janela
06. escrivaninha
07. cadeira
08. luminária
09. estante
10. personagem
11. criatura
12. props pequenos
```

Após esses itens:

```text
montar uma sala-teste
→ abrir no Phaser
→ testar no Moto G06
→ ajustar escala/perspectiva
→ congelar Asset Spec v1
```

Só então aumentar o catálogo.

---

# 29. Teste visual mínimo

A sala-teste precisa permitir avaliar:

- escala do personagem;
- escala da escrivaninha;
- largura de porta;
- altura aparente de parede;
- continuidade do piso;
- y-sort;
- contraste;
- leitura mobile;
- câmera;
- pan;
- objeto selecionado;
- rotação visual;
- iluminação manhã/tarde/noite/madrugada.

A avaliação deve ocorrer no aplicativo, não apenas em mockup.

---

# 30. Relação com o ciclo de tempo

Uma mesma sala deve continuar reconhecível nos quatro períodos.

A mudança deve vir principalmente de:

```text
atmosfera global
+
luz natural
+
fontes locais
+
FX
```

e não de quatro cópias completas dos assets.

Objetos comuns permanecem os mesmos.

Objetos luminosos podem mudar de estado.

---

# 31. Relação com o reboot

Esta especificação acompanha as decisões do reboot:

- `World` é maior que a viewport;
- `Space` é semanticamente neutro;
- `PlacedObject` guarda escolha espacial do usuário;
- Phaser renderiza o mundo;
- React mantém interfaces e semântica;
- posição/orientação futura são persistidas fora do Phaser;
- salas não são categorias;
- assets devem suportar personalização real.

---

# 32. Decisões ainda abertas

Não congelar ainda:

- dimensões finais dos cinco espaços;
- grid secundário/subgrid;
- zoom editável pelo usuário;
- inventário definitivo;
- colocação de props sobre móveis;
- wall decor livre;
- animação de portas;
- sistema completo de iluminação;
- atlas de texturas;
- formato WebP;
- pathfinding;
- culling;
- orientação física definitiva do app.

Essas decisões entram após o primeiro kit funcionar.

---

# 33. Regra de ouro

> **Um asset da Biblioteca Viva não é apenas uma imagem. É uma peça espacial com identidade, escala, footprint, pivô, orientação, profundidade, comportamento e procedência.**

Se essas propriedades não estiverem claras, o asset ainda não está pronto para o mundo.

---

# 34. Primeiro objetivo prático

O objetivo imediato não é “produzir todos os assets da Biblioteca Viva”.

É produzir um conjunto pequeno e coerente capaz de montar:

```text
uma sala
+
um corredor curto
+
uma escrivaninha
+
uma cadeira
+
uma luminária
+
uma estante
+
a personagem inicial
+
a criatura
```

na escala já aprovada visualmente no Moto G06.

Quando isso funcionar, a direção deixa de ser apenas referência artística e se torna um **pipeline real de produção**.

## Adendo W3-A — assets estruturais vigentes

O kit ativo W3-A usa escala comum de 300 px-fonte para 32 world units e autoridade visual declarativa. Paredes de 1/2/4 células existem nos eixos horizontal e vertical corretos; cantos NE/NW/SE/SW são peças próprias e a porta horizontal fechada/aberta compartilha o mesmo vão. Phaser não rotaciona bitmaps estruturalmente para fingir outra orientação. A geometria lógica produz intervalos e vértices; `structureVisualGeometry` produz canvas, alpha, planos, regiões e escala; `structureVisualDepth` e `structureVisualFallback` derivam da mesma saída. Porta vertical continua fora do produto porque não há asset aprovado.

W3-A-R2-A mede alpha no canvas original e fixa o contrato dos cantos em `art-guides/w3-a-r2-a/wall-corner-contract.json`: PNG sRGBA 8-bit, canvas 1248×1248, bbox `1200x1200+24+24`, dois braços de 1200 px e nenhuma opacidade fora da união dos corredores horizontal/vertical da orientação. O validador usa 0 px de tolerância para canvas, extensão e planos; aceita 1 px apenas na diferença transversal registrada das retas verticais. Em R2-B2-B, os quatro cantos `production` foram promovidos às fontes e ao runtime, e o comando padrão deixou de tolerar os cantos legados. Gabaritos e montagens continuam diagnósticos, não runtime.

### Continuidade transversal validada

Canvas, alpha bbox, orientação e planos longitudinais conformes são necessários, mas não suficientes. O defeito histórico de R3-C-B2 mostrou que uma reta e um canto podiam alcançar o mesmo plano usando perfis em lados opostos do eixo lógico. FIX-A/B1/B2 tornou normal, lateral ocupada, centerline e perfil estrutural comparáveis parte do contrato geral e separou o envelope visual da interface contínua das portas.

A correção deriva a normal interior exclusivamente do piso adjacente e aplica a translação assinada uma vez na transformação canônica, sem valor, tolerância, asset ou offset por coordenada/blueprint. Retas 1/2/4, quatro cantos, portas e fallback participam do oráculo; a repetição R3-C-B2 passou 9/9 e 31/31 emendas. Os PNGs e demais assets não foram alterados por R4.
