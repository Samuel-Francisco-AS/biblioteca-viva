# ADR-017 — Ficha viva e estimativa metabólica local

- Estado: implementada como candidata BF-5 Parte 2C, sem aceite físico/artístico
- Data: 2026-11-04
- Complementa ADR-015/016; autorização específica do proprietário para esta entrega

Atividade física precisa distinguir um plano reutilizável da execução real em uma data. A ficha v9 e as sessões anteriores não tinham grupos variáveis/checks por movimento. A Parte 2C adiciona calendário e execuções embutidas opcionais ao registro, com snapshot-base por data e grupos reais independentes. Não reinterpreta sessões antigas nem altera seus números. Datas usam calendário civil local; timestamps de auditoria continuam UTC.

Dexie v11 atualiza somente o marcador e mantém tabelas/linhas v10. Backup v6 conserva envelope, checksum e restauração protegida; schemas estritos aceitam campos opcionais novos e a chave de perfil físico. Não há downgrade garantido. Comando transacional exige revisão esperada, preserva a base do dia, impede gravações futuras e publica eventos após commit. React não acessa Dexie.

Perfil opcional compartilhado guarda somente peso em Ajustes, local, removível e incluído no backup. Estimativa usa tipo, duração explícita, esforço percebido e peso; não solicita altura/idade/sexo sem utilidade real. MET por faixas de esforço é uma heurística documentada, inspirada no Compendium 2024 e sem equivalência clínica validada. Energia bruta é arredondada para dezenas, sem precisão implícita. Sem parâmetros suficientes não se calcula. Snapshot de peso/MET/método preserva estimativas antigas ao mudar/remover perfil; edição dos parâmetros temporais/subjetivos pode recalcular o dia.

O gráfico mensal representa presença/ausência/parcial e volume inferior/superior/misto, sem premiação por volume. Aderência considera apenas datas previstas decorridas, incluindo hoje. Quantidades de repetições e segundos não são somadas entre si. Rádios DOM substituem o seletor nativo de categoria afetado pela tela branca; comprovação física permanece pendente. A gravura corporal é ilustração original local gerada por ImageGen; fonte e prompt registrados, sem requisição externa em runtime.

Consequências: uma execução por treino/dia; bases já capturadas são imutáveis durante edição diária; mudar a ficha vale para dias ainda não gravados. Alterar calendário muda a leitura de previsão, sem apagar execuções. Histórico antigo continua separado; estatísticas globais de sessões não duplicam o calendário. Limites de validação, referências, UX, verificações e roteiro físico no [relatório Parte 2C](../BF-5_PARTE2C_ATIVIDADE_FISICA.md). BF-5 não é encerrada.
