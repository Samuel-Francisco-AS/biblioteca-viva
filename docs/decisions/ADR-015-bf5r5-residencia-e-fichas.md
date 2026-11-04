# ADR-015 — BF-5R5: residência do mundo e fichas de prática

- Estado: aceita no escopo expressamente autorizado da BF-5R5; candidata sem aceite físico/artístico
- Data: 2026-11-04
- Complementa ADR-009, ADR-011 e ADR-014. Não aprova persistência espacial nem BF-6.

## Problemas e decisão

O proprietário relatou engasgos nas trocas de aba e inadequação de formulários, especialmente série e força. A inspeção confirmou reconstrução de WorldHost/renderer/cena em todo retorno e contagem diagnóstica por travessia da cena em cada frame. Uma ficha de força não cabe honestamente em distância percorrida ou texto sem estrutura.

1. A Biblioteca monta sob demanda na primeira visita e permanece residente durante a sessão do shell React. Fora da rota fica `hidden` e `inert`; o runtime é pausado, cancela gesto/RAF e não simula habitantes. Retorno redimensiona e retoma a mesma instância. A visibilidade da página continua sob o lifecycle existente. A destruição do shell/aplicação ou substituição do snapshot descarta os recursos pelo caminho existente. Não há cache global de renderer nem singleton WebGL.
2. No retorno, a aplicação consulta os registros novamente. Projeções iguais reutilizam o snapshot por identidade; mudanças de conteúdo representado substituem o runtime, evitando registros/títulos/progresso obsoletos. Essa substituição pode reiniciar a câmera. Câmera/seleção e histórias da visita não são gravadas no banco. Falha terminal oferece tentativa explícita e mantém a alternativa React.
3. Diagnósticos e apresentação semântica dos habitantes recebem assinaturas em componentes próprios. A travessia para contagem acompanha a publicação diagnóstica de 250 ms, sem reduzir animações, modelos ou taxa de desenho.
4. Dexie v9 é aditiva à v8: mesmos índices e tabelas, sem limpar ou transformar registros v8. `PhysicalActivityEntry.exercises?` guarda a ficha; `PhysicalActivitySession.exercises?` guarda uma cópia validada da execução. Cada exercício tem nome, séries/repetições/carga/tempo e observação opcionais. A lista tem validação estrita e limites de entrada; isso é proteção de dados externos, não budget artístico.
5. Sessões manuais e sua edição aceitam duração zero para tempo não informado, sem inventar minutos. Contagem de episódios, páginas, datas, resultados e execuções continuam úteis. Não há XP, streak, nova moeda ou recompensa. Registros antigos e sessões cronometradas continuam válidos.

## Compatibilidade e consequências

O formato de backup continua v6. Os schemas estritos incluem ficha e cópia de execução; backups v6/databaseVersion 8 continuam aceitos sem exigir os campos opcionais. Um aplicativo antigo não entende os novos campos e pode rejeitar backups que os contenham; importar em versão anterior não é suportado. Checksum, limites, confirmação e proteção de restauração permanecem. O teste de upgrade/reabertura preserva os seis tipos, notas, citações, sessões, etiquetas e preferências, além de testar round-trip das fichas no codec.

A residência troca reconstrução por retenção de memória GPU/CPU de uma cena enquanto o shell vive. Não implica permanência do processo Android: término pelo sistema reinicia a visita e recarrega dados convencionais. Essa troca requer teste físico com teclado, rotação, segundo plano e pressão de memória. Não foi demonstrada eliminação de jank físico; o relatório R5 distingue causas corrigidas, provas automatizadas e pendências.
