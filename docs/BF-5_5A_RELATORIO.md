# BF-5.5A — Continuidade e persistência dos habitantes (candidata)

**Data:** 05/11/2026. **Estado:** implementação candidata na [PR draft #32](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/32), **não integrada à main e sem gate físico**.

## Base e escopo

A BF-5.5A prepara a continuidade dos quatro habitantes entre inicializações da Biblioteca Viva, sem antecipar BF-5.5B (manipulação física/reservas), ritual de iluminação, magia, pergaminhos ou reatividade das sessões. Autoridade: [plano BF-5.5](BF-5_5_O_DESPERTAR_DA_BIBLIOTECA.md), [ADR-023](decisions/ADR-023-bf-5-5-despertar-da-biblioteca.md).

- Checkpoint `world.inhabitants.continuity.v1` validado por Zod, com quatro IDs únicos, posições/orientações, intenção e destino, histórico recente de tarefas, contador e estado da sequência pseudoaleatória. Sem texto ou conteúdo pessoal no payload.
- Repositório na tabela `settings` existente, que integra os snapshots do backup v6. **Nenhuma migração Dexie, versão de backup, plugin ou dependência nova.**
- A agência restaura primeiro posições estáticas válidas e separadas, com fallback espacial se houver mobília/obstáculo; depois retoma apenas ocupação ou percurso seguro e conhecido. Estado de encontro social interrompido não é ressuscitado pela metade.
- Ausência superior a 15 minutos conserva a posição e retira intenção antiga. Não há simulação em background, teleportes ou avanço fictício de horas.
- `WorldHost` carrega o snapshot persistido antes da criação do runtime Three. O runtime dispara checkpoints aproximadamente a cada 12 s e nos eventos de pausa, ocultação, pagehide e descarte. Gravações são ordenadas pelo repositório; falha do storage não derruba a biblioteca.
- F5 diagnóstico, mundo vazio de snapshot composto e runtimeFactory explícito não recebem persistência por implicação.

## Provas programadas e critérios de aceite

Testes adicionados de contrato estrito, recuperação de agência, conectividade no WorldHost e round-trip de Dexie/backup com dados fictícios. **Os testes só serão declarados PASS quando a execução correspondente for verificada.** Verificar CI estático/unitário/build e triagem E2E sem ocultar falhas históricas (#23).

**Gate físico obrigatório no Moto G06:** permitir que os quatro habitantes caminhem por pelo menos 20 s; registrar posições; fechar e relançar o APK; comparar posições e continuação das rotinas sem reset; repetir com troca de aba, segundo plano, retrato/paisagem e 15+ minutos ausente. Conferir ausência de personagens sobrepostos ou presos, seleção, diálogos, performance e registros. Testar backup/restauração com base fictícia antes de afirmar integridade, sem considerar #21 resolvida.

## Limitações e dívidas

Salvamento sob encerramento abrupto de processo é **best effort**: o último checkpoint periódico pode anteceder a saída. O estado dos habitantes é um *snapshot do mundo*, não um segundo domínio com persistência de cada frame. Backup/restauração de configurações é suporte estrutural pré-existente, **não** comprovação de todos os cenários de importação, conflito, rollback ou atualização; #21 e #22 continuam abertos.

BF-5.5A não adiciona animações, manipulação de objetos, persistência de relações narrativas completas, sistemas de personalidade profunda nem loop de iluminação (escopos posteriores). BF-6/BF-7, beta e publicação não são autorizados. Este relatório não declara conclusão, merge, CI verde ou resultado Android não realizado.
