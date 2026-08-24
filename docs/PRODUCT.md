# Produto — Biblioteca Viva

> Contrato atualizado para o reboot espacial de 2026-08-18.

## Núcleo preservado
Permanecem os seis tipos de registro, CRUD, progresso especializado, notas/citações, tags, favoritos, sessões, Arquivo, Estatísticas/timeline, backup/restauração, áudio, preferências, marcos e funcionamento local-first.

## Novo núcleo espacial
A Biblioteca deixa de ser uma coleção de salas temáticas selecionadas por navegação e passa a ser um mundo espacial contínuo.

W1 implementa somente mover a câmera por dois espaços neutros conectados. Progressivamente, o usuário poderá atravessar novos espaços, tocar habitantes e objetos, selecionar objetos posicionáveis, movê-los, girá-los, preservar a organização e expandir a construção.

## Espaços neutros
Um cômodo não significa Estudos, Filmes, Treino ou Trabalho. Os registros podem influenciar desbloqueios, diálogos e objetos, mas não determinam a função física da área.

## Objetos
Separar:
- `ObjectDefinition`: catálogo estável, asset/fallback, footprint, rotações, colisão e capacidades;
- `Unlock`: fato monotônico de que uma definição foi conquistada;
- `PlacedObject`: escolha pessoal de posição, orientação, espaço e camada.

Desbloquear não posiciona automaticamente.

## Fluxo de edição
```text
tocar objeto
→ ação Mover
→ modo de posicionamento
→ arrastar
→ validar destino
→ confirmar/soltar
→ persistir transformação
```

Rotação inicial preferida: 0°, 90°, 180°, 270°, limitada pelas capacidades do objeto.

## Câmera
A viewport é uma janela sobre um mundo maior. A câmera se desloca em X/Y dentro de limites válidos. O modelo não depende mais de “uma sala por tela”.

## Habitantes
Bibliotecária, criatura e residentes pertencem ao mundo, não a páginas de sala. Preferir rotas declarativas e deslocamentos controlados antes de pathfinding geral.

## 2D/2.5D
Phaser e assets 2D permanecem. Profundidade, ordenação por eixo e perspectiva falsa podem produzir 2.5D. 3D real não faz parte deste reboot.

## W1 — slice atual
Considerar a hipótese provada quando houver:
1. mundo maior que a viewport;
2. dois espaços conectados;
3. câmera sem troca de sala;
4. escala arquitetural modular coerente;
5. CRUD/backup/alternativa React preservados;
6. uma instância Phaser;
7. funcionamento aceitável no Moto G06.

Seleção, mover, girar, reload de posição e objetos persistidos pertencem a W2 e não estão implementados.

## Fora do primeiro slice
Editor completo de paredes, construção livre, dezenas de móveis, pathfinding geral, física complexa, multiplayer, sincronização, marketplace, 3D, crafting e economia virtual.
