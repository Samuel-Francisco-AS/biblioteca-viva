# BF-5R3 — Enquadramento do Mundo Vivo e compêndio responsivo

**Estado:** candidata de refinamento não homologada na PR draft #20; a `main` permanece intocada. Revisão motivada pelas capturas de 14h30–14h36 do Moto G06 em 2026-11-03.

## Problemas relatados

1. Uma “barra” ou limite verde/escuro parece cortar o mundo 3D; o fenômeno some ao aplicar zoom/pan.
2. Telas de Coleção/Detalhes continuam parecendo cartões e formulários grandes, repetitivos, duros e pouco agradáveis.
3. Falta continuidade e prazer nas transições e nas interações, mesmo após simplificação dos filtros e introdução de feedback ao toque.

## Diagnóstico técnico

O canvas já tinha dimensões de viewport, e a vinheta inferior da BF-5R1 havia sido eliminada na R2. **A câmera do mundo composto, porém, continuava iniciando em zoom 0,7**, concebido para mostrar a construção inteira. Em telas estreitas a frustum ortográfica conserva margens profundas de cenário vazio, evidenciando linhas do perímetro do modelo e uma região verde inferior. O zoom manual faz o piso voltar a dominar a cena: isso diferencia **enquadramento** de uma suposta chapa HTML.

O componente `ThreeWorldRuntime` monta o `CameraNavigation` antes de dispor de medidas válidas do host. A R3 preserva isso, mas **após o primeiro viewport válido** aplica **uma única vez** o enquadramento de abertura: zoom 2 para proporções de tela muito altas, 1,45 para retratos intermediários e 0,7 para paisagem. O usuário continua livre para pinçar e afastar, e a rotação continua preservando navegação escolhida. A vista padrão fica mais próxima do cenário e pode cortar cômodos laterais de forma intencional, acessíveis por pan.

**Não houve validação física da efetividade desse enquadramento.** A geometria real, o equilíbrio visual e a reação ao retorno de outra aba ainda requerem inspeção no aparelho.

## Implementação de linguagem e conforto

- `RealmIntro` recebe capítulo contextual real (acervo, memória, constelações, rituais), marca visual e composição compacta; não altera rotas.
- `CollectionPage` exibe cada registro como artefato de compêndio compacto, com símbolo puramente decorativo por tipo, título, status, metadados e abertura pela mesma rota que antes. Sem capas falsas ou alterações de domínio.
- `EntryDetailPage` ganha uma área de identidade, símbolo do tipo, status e edição, seguida de seções organizadas, mantendo todas as ações existentes (progresso, notas, citações, organização, sessões, exclusão).
- `styles-ritual.css` define hierarquia de superfícies, alinhamentos, campos, painéis e estados de foco; transições de posição e opacidade limitadas e movimentos reduzidos respeitados.
- Navegação ainda usa React Router e o `ThreeWorldRuntime` atual. **Não foi afirmada nem resolvida a causa de eventuais travadas de montagem/desmontagem ao trocar de abas**; esta é uma investigação funcional separada, que precisa de medição real antes de alterar ownership ou lifecycle.

## Validação solicitada

- Formatação, lint, TypeScript, testes unitários (inclusive câmera), build web e E2E da Coleção/Detalhes. CI não executada no momento de autoria do texto.
- No Moto G06: abrir Biblioteca sem mexer na câmera e conferir o preenchimento do viewport; arrastar até os cômodos periféricos, afastar e aproximar; girar retrato/paisagem; alternar 5 vezes entre Biblioteca e outras abas; avaliar se o conteúdo aparece e reage com menor sensação de atraso; verificar Coleção com dez registros, detalhes de dois tipos, filtros, teclado e salvar notas.
- TalkBack, memória/desempenho sustentado, CI e testes físicos posteriores à R3 continuam pendentes até evidência objetiva.

## Proteções

Sem novas dependências, alterações de schema, persistência, backup, dados, personagens, motor narrativo, assets ou regras de jogo. Sem merge, release ou alteração em `main`. BF-5 continua aberta para aceite artístico e ergonômico.
