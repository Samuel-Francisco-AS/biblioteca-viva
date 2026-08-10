# Direção artística

> A identidade final ainda precisa de referências aprovadas no Gate G0. Este documento define princípios e pipeline, não uma paleta fechada.

## 1. Intenção

A Biblioteca Viva deve parecer um lugar íntimo, antigo, mágico e habitado, sem se tornar sombria demais ou infantil. O visual precisa apoiar leitura e registro, não competir com eles.

Palavras-guia:

- acolhedora;
- contemplativa;
- artesanal;
- misteriosa;
- viva;
- legível;
- pessoal.

## 2. Estilo do protótipo

- pixel art ou arte 2D de baixa complexidade;
- câmera fixa;
- orientação retrato;
- sala pequena;
- poucos assets reutilizados com intenção;
- animações curtas e discretas;
- iluminação simples;
- composição que funcione em telas estreitas;
- fallback geométrico sempre disponível.

## 3. Hierarquia visual

1. ação atual e texto da interface;
2. objeto recentemente alterado;
3. estante e bibliotecária;
4. criatura e elementos ambientais;
5. partículas e decoração.

Efeitos não devem obscurecer texto, navegação ou objeto tocável.

## 4. Estados da primeira estante

- vazia;
- inicial;
- ocupada;
- possui concluído.

Usar faixas de ocupação e grupos de lombadas, não um sprite completo para cada livro. Livro recente pode receber destaque temporário.

## 5. Personagens

### Bibliotecária

- presença calma;
- idle pequeno;
- silhueta clara;
- não sexualizada;
- reação acolhedora, sem fiscalizar produtividade.

### Criatura

- pequena;
- reconhecível em escala mobile;
- movimento delimitado;
- personalidade expressa por animação simples;
- não bloqueia toque em outros objetos.

## 6. Cor e iluminação

- paleta limitada;
- contraste suficiente entre cenário e UI;
- cor nunca é único indicador;
- iluminação comunica atmosfera, não progresso obrigatório;
- estados concluídos podem acrescentar calor ou brilho sem transformar a tela em carnaval arcano de shopping.

Para a arte procedural do Prompt 13, a paleta provisória combina madeira escura e média, papel creme, piso ocre, parede azul acinzentada, verde suave para a criatura, violeta discreto para a bibliotecária e dourado para conclusão. Esses valores vivem no manifesto técnico e continuam sujeitos a moodboard e teste no aparelho; não constituem paleta final.

A bibliotecária é uma figura geométrica com cabelo, rosto, corpo e avental; a criatura usa corpo oval, orelhas triangulares e olhos claros. A iluminação é composta por áreas circulares quentes e translúcidas. A estante vazia preserva prateleiras claramente visíveis; os estados preenchidos acrescentam grupos limitados de lombadas, e conclusão acrescenta um selo dourado sem substituir a faixa de ocupação.

O primeiro desbloqueio usa uma pequena luminária de leitura procedural sobre o balcão. Ela reaproveita formas e paleta do manifesto, sem asset binário novo. Ao ser concedida, surge com uma animação discreta de até 650 ms; com movimento reduzido, aparece diretamente no estado final. O objeto permanece parte da sala após o marco histórico, mesmo que o livro de origem seja retomado ou excluído.

O modo de alto contraste do Prompt 17 preserva a identidade quente da sala, mas prioriza a camada funcional React por tokens de superfícies, texto, bordas, foco, links, controles e erros. Não constitui novo tema artístico e não recolore o canvas. As escalas grande/maior aplicam-se ao shell sem zoom da cena. Movimento reduzido mantém personagens, destaque e luminária reconhecíveis em poses estáticas, sem remover informação.

## 7. Assets e nomes

Organização sugerida:

```text
public/assets/phaser/
  room/
  shelves/
  characters/
  creatures/
  decorations/
  effects/
  atlases/
```

IDs internos estáveis e nomes de arquivo em `kebab-case`. Manifests definem posição, frame, animação e fallback. Código não espalha caminhos e coordenadas.

## 8. Pipeline

Para cada asset:

1. registrar origem e licença;
2. manter arquivo-fonte fora do bundle quando necessário;
3. exportar em escala e formato definidos;
4. validar transparência e bordas;
5. incluir em atlas quando vantajoso;
6. testar no aparelho;
7. registrar tamanho e impacto;
8. manter fallback.

## 9. Limites do protótipo

- sem múltiplas salas;
- sem editor livre;
- sem pathfinding complexo;
- sem dezenas de NPCs;
- sem ciclos climáticos avançados;
- sem animação longa de desbloqueio;
- sem arte final antes de o fluxo de dados funcionar.

## 10. Aprovação visual

Uma mudança artística só é aprovada quando:

- funciona em 320 px e no aparelho alvo;
- objeto tocável permanece claro;
- modo reduzido continua coerente;
- asset ausente não causa tela preta;
- desempenho atende `PERFORMANCE.md`;
- screenshot e teste manual foram registrados.
