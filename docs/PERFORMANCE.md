# Desempenho e estabilidade

## Objetivo

Manter o aplicativo utilizável em aparelho Android modesto sem sacrificar integridade de dados ou acessibilidade.

## Contratos

- Phaser é carregado sob demanda.
- Existe uma instância, uma cena e um canvas por host.
- Listeners, observers, tweens, timers, Graphics e players são limpos no lifecycle correto.
- Preview de drag conserva apenas trabalho útil por frame.
- Coleções relacionadas são carregadas em lote; evitar N+1 por card.
- Duração de sessão deriva de timestamp, não de intervalos acumulados.
- Assets ausentes degradam sem ciclo infinito de tentativa.

## Baseline técnica mais recente

No gate pré-R6, a carga inicial foi instrumentada entre shell React, Dexie, projeção, módulo Phaser, texturas e primeiro frame. No build local de produção:

- primeiro frame a frio observado: 1.642 ms antes e 1.453 ms depois;
- reload com cache: 1.426 ms antes e 1.233 ms depois;
- texturas bloqueantes: 28 antes e 17 depois;
- leituras duplicadas em DEV por StrictMode foram reduzidas;
- uma instância Phaser e um `renderWorld` no boot foram preservados.

Esses números são evidência do ambiente medido, não promessa universal.

## Problemas conhecidos

- A abertura inicial da Biblioteca ainda parece lenta no Moto G06.
- O card de Resumo ainda pode apresentar engasgo.
- R6 aceitou os dois pontos como não bloqueadores, mas não aprovou desempenho físico como resolvido.
- O build registrou aviso de chunks Vite acima de 500 kB.

## Próxima investigação

1. Reproduzir em build e aparelho identificados.
2. Medir tempo de interação, primeiro frame, long tasks, memória e repetição de lifecycle.
3. Separar custo React, consulta, projeção, import, textura e render.
4. Otimizar somente o gargalo comprovado.
5. Comparar antes/depois no mesmo cenário e registrar efeito colateral.

Não dividir bundles, reduzir acessibilidade, remover validação ou alterar persistência apenas para melhorar uma métrica sintética.
