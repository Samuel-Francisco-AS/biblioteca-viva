# Modelo de dados

## Princípios

- Entidades possuem IDs estáveis, timestamps UTC, revisão positiva e validação nas fronteiras.
- Factories e operações de domínio repetem invariantes importantes; não confiam apenas no schema externo.
- Projeções e estatísticas derivadas não são persistidas sem necessidade comprovada.
- Migrações publicadas não são reescritas.

## Registros

`LibraryEntry` é uma união discriminada com:

- `BookEntry`;
- `MovieEntry`;
- `SeriesEntry`;
- `StudyEntry`;
- `PhysicalActivityEntry`;
- `WorkEntry`.

Campos comuns incluem identidade, tipo, título, estado, datas, revisão, favorito e etiquetas. Cada variante conserva seu progresso próprio. Páginas, episódios, horas, distância e dados de trabalho não são reunidos em uma estrutura amorfa de campos opcionais.

Notas e citações referenciam `entryId`. Localização de citação é discriminada pelos tipos que a suportam. Exclusões e remoções de etiqueta atualizam referências dentro da transação adequada.

## Sessões e fatos derivados

Sessões representam leitura, exibição, estudo, atividade física e trabalho. A duração usa timestamps e `Clock`; ticks de interface não são fonte de verdade. Existe no máximo uma sessão aberta globalmente. Restore converte sessão ativa em pausada quando necessário para evitar tempo fictício.

Timeline, estatísticas e `ProductProgressFacts` são calculados em memória. Unidades incompatíveis não são somadas entre categorias.

## Marcos e progressão estrutural

Marcos são históricos e idempotentes. Uma sessão estruturalmente elegível está concluída, possui duração positiva e referencia um registro existente compatível. Os limiares atuais são 1, 5, 15 e 30.

Concessões são físicas e acumulativas por família. O inventário é derivado da reserva inicial, placements e concessões persistidas; não é uma segunda contagem independente.

## Estrutura e objetos

`WorldStructureState` persiste `world.main`, células de piso, placements estruturais e revisão. `PlacedObject` persiste objetos posicionáveis separadamente. Seleção, preview, câmera, ferramenta ativa e animações não são dados persistidos.

O blueprint 12×10 é usado somente na ausência de estrutura. Edição ou restore pessoal não são sobrescritos.

## Evolução do schema Dexie

| Versão | Mudança principal |
|---:|---|
| v1 | coleções iniciais de livros e efeitos |
| v2 | `settings` e `metadata` |
| v3 | `milestones` |
| v4 | seis variantes de `LibraryEntry` e anotações generalizadas |
| v5 | `tags` e `sessions` |
| v6 | `placedObjects` |
| v7 | `worldStructures` |

O schema v7 possui onze tabelas. A migração v6 para v7 preserva objetos e cria a coleção estrutural vazia; o bootstrap decide se precisa criar o blueprint.

## Backup

O formato vigente é v5 e aceita importação dos formatos v1 a v4. Compatibilidade é governada por `formatVersion`, não pela versão do aplicativo.

O envelope contém identificação do formato, data, versão do aplicativo, versão do banco, dados, política e integridade SHA-256 sobre representação canônica. O digest detecta corrupção ou alteração acidental; não é assinatura nem criptografia.

A inspeção valida sem escrever. O restore revalida e executa uma transação única. Coleções substituíveis seguem a política declarada; marcos preservam união monotônica para que um backup antigo não apague uma conquista legítima. Restore repetido não duplica concessões nem reapresenta eventos.

`metadata` técnica do IndexedDB não é conteúdo de usuário exportável. O inventário derivado não precisa de coleção própria no backup.

## Regras para mudanças

1. Adicionar nova versão; nunca editar uma versão publicada.
2. Validar leitura antiga e nova.
3. Testar upgrade, reabertura, rollback e falha parcial.
4. Atualizar codec e política de restore quando a forma exportada mudar.
5. Preservar leitores anteriores enquanto houver política segura.
6. Atualizar este documento, uma decisão e a checklist Android.
