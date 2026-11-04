# BF-5 — Parte 2C: ficha viva de Atividade Física

Data: 2026-11-04. Candidata de implementação. **BF-5 aberta; sem merge ou aceite artístico/físico.**

## Stack e autorização

Checkout inicial limpo em `feat/bf5-parte2b-estudo`, HEAD e `origin/feat/bf5-parte2b-estudo` confirmados em `e4d88e7562aed7c08f9da2055934c455bba4d578` após `git fetch origin`. Nova branch `feat/bf5-parte2c-atividade-fisica`, com base na PR draft #26, que já depende da #25. O pedido autoriza implementação, commit, push e PR draft; não autoriza merge ou fechamento da BF-5. Sem alteração de versão do pacote, dependência, serviço remoto ou cena 3D. Seis tipos preservados.

Lidos AGENTS, STATUS, README, índice de decisões, ADR-014/015/016, relatórios Partes 2/2B, contratos ativos de UX/dados/Android/testes/arte/desempenho; inspecionados código, schemas, transações, backup, formulário, sessões, projeção e Git. Notas antigas de planejamento não revogam a implementação expressamente solicitada.

## Experiência e decisões de UX

Uma superfície contínua em papel marfim, tinta ameixa e cobre; identidade compacta, ficha diária, gráfico, atlas corporal e disclosures secundários. Sem hero grande ou sequência de cards principais. Livro e Estudo conservam suas páginas próprias.

- Cadastro: nome, tipo, início/fim, dias da semana e ficha. Cada exercício permite séries e meta por repetições ou segundos. Adicionar, editar, remover e subir/descer usam controles DOM, sem drag obrigatório. Séries/metas são obrigatórias nos planos com calendário; registros antigos sem calendário continuam válidos. Campos legados de carga/nota de exercício, modalidade e objetivo são preservados na edição.
- Tipo: **rádios estilizados visíveis**, com Força, Resistência e Aeróbico. A categoria antiga de um registro continua disponível ao editá-lo. Não há `<select name="category">` nem diálogo nativo desse campo. A superfície branca relatada no APK é contornada eliminando o picker afetado; não se declara reprodução/correção física aprovada sem Moto G06. Há precedente do mesmo problema WebView documentado em ANDROID/F5-A.
- Ficha do dia: seleção por data ou calendário; indicação previsto/fora do plano. Base e execução real lado a lado no mesmo fluxo; grupos adicionais permitem `3 × 15 + 1 × 10`, remoção permite menos séries ou nenhuma. Check por exercício, desmarcação e marcar todos. **Salvar execução** confirma o conjunto; antes disso, aviso de alterações não salvas e proteção de saída/Back/unload. Trocar o dia pede confirmação de descarte. Limpar dia pede confirmação e conserva a ficha-base. Datas futuras são consultáveis, mas não registráveis.
- Intensidade percebida (1–10) e duração são opcionais e explícitas, sem preenchimento fictício ou cronômetro implícito. Ausência impede estimativa, mas permite registrar o treino. Observação breve pertence ao dia e começa recolhida. Favoritos/etiquetas, estado, sessões anteriores e exclusão ficam em áreas recolhidas; exclusão tem contraste explícito e confirmação.
- Gráfico: calendário mensal navegável com contorno para dias previstos e símbolos/cores distintos para previsto, realizado, não realizado, parcial, menos, mais e adaptação mista. O toque abre o dia. Dias futuros não viram faltas. Resumo mostra previstos no período, completos no plano até hoje e aderência contra dias previstos decorridos (incluindo hoje). Treinos fora do plano aparecem no mês e não inflacionam aderência. Comparação usa volume de cada exercício (soma séries × alvo), com unidade preservada; sinais opostos entre movimentos produzem adaptação mista. Não se somam repetições e segundos em uma unidade fictícia, nem se premia volume maior. Carga não participa dessa comparação.
- Atlas corporal: gravura original local gerada por ImageGen, em WebP com transparência, de corpo em movimento, sem requisição externa em runtime ou telemetria. Painel mostra a estimativa **salva do dia selecionado**, duração e intensidade. Não apresenta projeção como medição fisiológica.

## Persistência e backup

[ADR-017](decisions/ADR-017-ficha-viva-e-estimativa-local.md). Dexie **v11 aditiva**, mesmas nove tabelas e índices v10. Upgrade só atualiza marcador, sem reescrever linhas. Não se altera a migração histórica do reset v8. Backup **v6 mantido**, checksum/restauração protegida existentes, schemas estritos ampliados. Backups v6 anteriores continuam válidos; aplicativos antigos não suportam os campos novos nem downgrade do banco.

| Contrato | Persistência |
| --- | --- |
| `PhysicalActivityEntry.schedule?` | `{start,end,weekdays}`; datas civis ISO inclusivas, dias 0=domingo…6=sábado, lista não vazia e única. Separado de `startedAt/completedAt`, que continuam marcadores de estado do registro. |
| `PhysicalActivityEntry.workoutDays?` | Lista de dias únicos por data; máximo 20.000 execuções por registro. Cada dia contém movimentos com nome, unidade `reps/seconds`, grupos-base e grupos reais `{count,target}`, check, duração/intensidade/nota opcionais e timestamp. Até 80 movimentos, 100 grupos por movimento, 100 séries por grupo e alvo até 86.400. |
| Perfil global | Uma linha removível em `settings`, chave `physical.profile.v1`, `{weightKg}` validado entre 20 e 400 kg. Sem altura, idade ou sexo, pois o método não os utiliza. Incluído no backup como dados pessoais locais, sem envio automático. |
| Estimativa do dia | `{method:"met-v1",weightKg,met,kcal}`; conserva parâmetros efetivamente usados. Mudar/remover perfil não recalcula o histórico. Editar duração/intensidade recalcula com o perfil atual, se houver; sem dados, remove a estimativa daquele dia. |

Primeira gravação captura a ficha-base vigente; gravações seguintes preservam a referência já capturada, mesmo após editar o plano. Dia novo deriva da ficha-base atual. O comando reconsulta e grava em transação, exige revisão esperada, recusa sobrescrita obsoleta (inclusive quando resume reconsulta o registro e conserva um rascunho anterior) e publica evento **após commit**. Rollback não publica evento. UI acessa portas/comandos, nunca Dexie. Exclusão do registro remove as execuções embutidas junto do restante do histórico vinculado. Reabertura e round-trip/restore cobrem perfil, plano, execução, grupos e estimativa.

Sessões anteriores não são convertidas artificialmente em execuções por exercício. Permanecem consultáveis/editáveis no histórico recolhido, sem formulário para criar novas sessões pelo caminho antigo; uma sessão antiga ainda aberta pode ser concluída ou cancelada. São preservados duração/distância/notas originais e backup. O calendário novo representa `workoutDays`, sem inventar checks nas sessões antigas; estatísticas globais de sessões mantêm seu contrato anterior, sem duplicar o novo calendário.

## Método metabólico aproximado

Referências primárias: [2024 Adult Compendium — Conditioning Exercise](https://pacompendium.com/conditioning-exercise/) e [artigo de atualização do Compendium](https://pmc.ncbi.nlm.nih.gov/articles/PMC10818145/).

Fórmula pragmática de energia bruta: `kcal ≈ MET × 3,5 × pesoKg ÷ 200 × minutos`, arredondada para dezenas. Inclui gasto de repouso do intervalo; não mede calorias ativas, metabolismo basal ou composição corporal. Não se extrapola gasto com base em repetições. Os valores do Compendium são médias de atividades; a intensidade subjetiva não é uma medição de MET.

| Tipo | Esforço 1–3 | Esforço 4–6 | Esforço 7–10 |
| --- | --- | --- | --- |
| Força | 3 | 3,5 | 6 |
| Resistência | 3,5 | 5 | 7,5 |
| Aeróbico | 3,5 | 5 | 7,3 |

**Essa escolha de faixas é uma heurística própria**, inspirada em exercícios de força/circuito/aeróbicos do Compendium, sem equivalência clínica validada entre RPE 1–10 e MET. O valor 7,3 corresponde à referência de aeróbico geral; as faixas não modelam cada modalidade, descanso, condicionamento, idade ou particularidade fisiológica. Categorias legadas sem referência selecionada não recebem cálculo. Sem peso, duração e intensidade válidos não há estimativa. Não há prescrição de treino, dieta, diagnóstico ou promessa de precisão. Aprovação artística não valida o método como medição de saúde.

## Verificação real

Rodadas unitárias dirigidas **PASS**: 134 testes/18 arquivos para persistência/backup, migrações e formulários; 55 testes/10 arquivos para domínio/aplicação/sessões/App/fronteiras/cartas; última rodada após os ajustes de conflito e histórico: **29 testes/8 arquivos PASS**. Há sobreposição entre rodadas; não somar como cobertura distinta. Testes novos cobrem grupos variáveis, isolamento diário, calendário e estados do gráfico, estimativa incompleta/completa, revisão obsoleta, rollback/eventos após commit, perfil removível, v10→v11, reabertura, restauração v6 antiga/nova e preservação de campos de Estudo/carga legada.

E2E: **seis cenários dirigidos distintos aprovados**, em rodadas proporcionais. A rodada de atividade física + Estudo teve **4/4 PASS (31,8s)**; rodada final de atividade física + coleção dos seis tipos + ficha R5 atualizada teve **3 PASS/1 FAIL (1,1min)**; o cenário R5 foi corrigido no posicionamento de viewport e passou isoladamente em **8,2s (9,8s total)**. Os dois cenários novos de atividade física passaram também na última rodada (14,5s e 6,0s), incluindo criação, rádios sem select, ordenação, metas, recarga, checks/desmarcação/todos, alteração diária, base imutável após edição, observação, gráfico, perfil/remoção/estimativa histórica, rascunho/Back por link, conflito real entre duas páginas após resume, limpeza diária, futuro bloqueado, retrato/paisagem sem overflow e contraste destrutivo ≥4,5:1. Os cenários de Estudo preservam pomodoro/cartas/notas. O fluxo de Coleção confirmou os seis tipos.

E2E antigos que criam atividade física agora preenchem nome/período/dias/ficha obrigatórios. A regressão R5 de snapshot foi atualizada para comparar metas-base antigas/novas no novo modelo diário, mantendo verificação de persistência e ausência de distância no núcleo. Carga legada é preservada e verificada na migração/backup. Asserts não foram omitidos; nenhum timeout ou retry novo foi introduzido.

**PASS:** lint, format:check, TypeScript/build, áudio, relatório estático de bundle, android:sync, android:build:debug e `git diff --check`. APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`, **6.356.507 bytes**, SHA-256 `6acd06eb9d426f6e9c4af34650c05ba34b7fb0162597625ceae7342a113eda53`. Capacitor preserva os três plugins existentes. Warnings conhecidos de `flatDir` e chunks >500kB permanecem; entrypoint JS inicial de 642.078 bytes é medida de bundle, não de FPS.

Capturas fictícias inspecionadas: [retrato](evidence/BF-5P2C/treino-retrato.png) e [paisagem](evidence/BF-5P2C/treino-paisagem.png). Captura full-page conserva o dock fixo na coordenada do viewport; não representa sobreposição permanente durante o scroll. Não houve instalação, uso de aparelho, TalkBack ou avaliação de fluidez física nesta entrega. Suítes amplas acumuladas e dívidas #21/#22/#23 permanecem fora de alegação de resolução; CI remota pendente, sem afirmação de verde global.

Arte e prompt registrados em [ARTE](evidence/BF-5P2C/ARTE.md).

Falhas intermediárias já identificadas: teste novo de perfil esperava Promise, mas o serviço fazia parse síncrono; serviço passou a devolver rejeição assíncrona coerente com sua porta. Primeira tentativa E2E usava `/ajustes`, inexistente; corrigidos teste e link de perfil para `/configuracoes`. Erros de lint de conversão de FormData e mocks async resolvidos sem casts, disables ou enfraquecimento de asserts. Na rodada posterior, o cenário R5 não encontrou a nota visível após o clique no disclosure; o teste passou após rolar explicitamente o alvo e exigir sua presença no viewport antes do clique, mantendo as verificações de nota/snapshot/reload. A causa temporal exata não foi demonstrada; não se atribui a falha a desempenho do aparelho. A revisão de capturas corrigiu o esquema de cor dos checks e ampliou a presença editorial do painel corporal.

## Limitações e roteiro Moto G06

Sem validação humana nesta candidata; não declarar seletor/APK, teclado, retrato/paisagem físicos, TalkBack ou desempenho aprovados. O calendário compara volume registrado e não avalia qualidade, carga, segurança, dor ou evolução fisiológica. Alterar calendário reinterpreta quais datas são previstas; execuções já salvas conservam sua referência de exercícios. Uma execução por treino/data civil local, sem múltiplas sessões do mesmo treino no dia. Duração/intensidade não são inferidas e não há alarme/serviço em segundo plano. Registros antigos sem exercício exigem completar a ficha na edição para usar o novo diário.

1. Fazer backup antes de atualizar, sem limpar dados. Abrir livro/estudo e treino antigo; conferir preservação de notas, ficha e sessões.
2. Ajustes → Perfil físico: informar peso, salvar e reabrir. Criar treino Força/Resistência/Aeróbico com período, seg/qua/sex e metas por repetição/tempo. Alternar os três tipos: sem picker branco. Adicionar, subir/descer e remover exercício; testar teclado, rolagem e dock.
3. Marcar um exercício, salvar, fechar/reabrir. Desmarcar; adaptar séries (`4 × 15`, `3 × 15 + 1 × 10`, menos séries/tempo). Marcar todos e salvar com duração e intensidade. Conferir estimativa aproximada e observação recolhida.
4. Abrir outro dia: ficha original, sem checks herdados. Testar execução fora do plano e consulta futura bloqueada para gravação. Tocar os dias do gráfico e navegar meses; verificar realizado/parcial/menos/mais/misto e aderência. Editar ficha-base e conferir que execução anterior permanece intacta.
5. Alternar app/rotação, voltar com rascunho, cancelar descarte e salvar. Repetir em retrato/paisagem, texto ampliado, alto contraste e TalkBack. Conferir alvos, foco, gráfico e último controle acima do dock.
6. Remover perfil: sem cálculo novo; estimativa anterior conserva o peso usado. Em ambiente descartável, exportar/restaurar backup fictício e conferir perfil/ficha/execuções. Abrir exclusão, ler o texto e cancelar; limpar apenas um dia fictício e conferir ficha-base preservada.

BF-5 permanece aberta, com PR draft encadeada e sem merge automático.
