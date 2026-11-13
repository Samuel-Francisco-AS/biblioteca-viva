# BF-5.7B2.5 — saneamento residual e integridade

## Identidade e escopo

Branch filha: `feat/bf-5-7b2-final-cleanup`.
SHA inicial/base remota R2: `d02a2acf7e8f55b716f7091cbeaac3c9bc0b6f77`,
[PR #56](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/56).
PR filha draft, sem merge. Gates finais serão registrados abaixo antes da entrega.
PNG de auditoria preexistente preservado fora dos commits.

Entrada autorizada pelo checkpoint R2: lint/typecheck/build e 1218 testes
PASS; dois timeouts gráficos permanecem FAIL, não atribuídos exclusivamente
ao ambiente. O avanço é só saneamento, não aceite físico da R2/B2.5.

## Auditoria residual

Busca solicitada em src/e2e/scripts/public/assets: 375 linhas em 27 arquivos
na base. Classificação por ocorrência e inventário estão na evidência desta
entrega. As 293 linhas do fixture v11 TCG são necessárias para rejeição e
saneamento; não são catálogo produtivo nem importadas pelo aplicativo.

Removidos nesta etapa:

- Comentário produtivo em `pages.tsx` que afirmava que Duelo era sala ativa.
- Referência à sala aposentada no teste genérico de readiness de
  `interactionContinuity`: agora testa uma resposta obsoleta de Assuntos,
  conservando a mesma asserção e comportamento de transição.

Nenhum motor, serviço, CSS exclusivo, script ou asset TCG adicional foi
comprovado como morto: as remoções estruturais já ocorreram na B2.4. Não há
remoção de pacote npm justificável: Three.js continua necessário ao mundo.
Não se apagaram recursos nem histórico apenas por palavras encontradas.

Preservados por contrato:

- `orbitalArena`/`ORBITAL_ARENA_ID` e `portal:duelo-arcano`: identificação
  técnica lunar usada em seleção, broadphase, destaque e semântica.
- Rotas antigas em App/ArcanariumPage e `?tipo=combat`: redirecionamentos
  explícitos, cobertos por regressões de aposentadoria.
- `containsRetiredDuelData`: rejeita TCG antes da importação.
- `retireCombatData` e marcador v1: reparo único/transacional de v19 intermediária.
- Testes negativos e fixture histórica assinada: provam rejeição/rollback.
- Rota fictícia antiga em pages.test e alvo legado no teste de privacidade
  do probe: sentinelas de destino incorreto e normalização de rota histórica.
- Cartas, coleções, baralhos e sessões educativos: dependências vigentes.

## Persistência e retenção

Banco ativo `biblioteca-viva-bf57`, Dexie v19, backup v12. Sem mudança de
identidade, schema, versão de aplicativo ou reset. Bootstrap abre o banco,
executa o saneamento com marcador e só então expõe serviços educativos.
A transação cobre stores e marcador; schema e integridade cruzada são
validados antes do commit. Corrupção adicional reverte exclusões/marcador.
Sessões mistas incompatíveis continuam bloqueadas para não deslocar respostas;
isso exige recuperação específica, nunca reset recorrente.

Banco antigo `biblioteca-viva`: código produtivo não o abre, importa nem
exclui. O teste de bootstrap usa banco sintético e comprova retenção do registro
antigo, base nova vazia e persistência após três inicializações. Não houve
acesso ao banco real. Sem aparelho conectado, seu tamanho ocupado é **não
medido**; não há benefício quantitativo demonstrado para exclusão agora.
Uma proposta futura, dependente de autorização própria, pode inventariar
ambas as identidades, mostrar espaço/backup recuperável e oferecer descarte
único explicitamente dirigido ao nome antigo, sem afetar o ativo. Nenhuma
rotina de descarte foi implementada nesta etapa.

## Arquitetura, recursos e desempenho

Inspeção focada de imports, bootstrap, repositório, layout e scheduler não
identificou nova inicialização TCG, consulta TCG ou listener sem liberação.
Repositório educativo lê snapshot em transação readonly; comandos mantêm
transações/eventos após commit. Nenhuma refatoração preventiva foi feita.

WorldHost continua residente. A pausa cancela RAF/gestos e não destrói o
contexto; retorno usa o mesmo renderer. Visibilidade, resize e context listeners
têm caminhos de liberação no dispose. Testes runtime/host/interação cobrem
esse contrato. Retenção GPU fora da rota é intencional; não equivale a render
ativo. E2E gráfico incompleto ainda impede certificação integrada final.

Referência R2: runtime JS 871848 bytes, entrada JS 576082 bytes. Alterações B2.5
são comentário e testes; não há promessa de redução de bundle ou ganho FPS.
Comparação final do build será registrada nos gates abaixo.

## Regressão educativa e limitações

Novo E2E verifica carta educativa + classificação pessoal e gravação de nova
carta com rede offline após módulos carregados; recarrega online e confere
persistência. Esse ensaio é offline de sessão web aquecida. Não afirma cold
start offline do site hospedado; no Android os assets são locais no APK.

Regressões disponíveis abrangem Acervo/Oficina, Ecos/flashcards, Provações,
questões/taxonomia, pacotes, baralhos, Relicário, Estudos, atividades físicas,
backup e bootstrap. Escolhas compartilhadas permanecem radios nativos com
estilo cristalino e foco. Matriz final distingue testes executados e pendentes.

B2.6/B3/B5, merge, CI, aceite físico e liberação de produção não estão aprovados.
