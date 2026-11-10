# Evidências BV-UXC R5

Dados técnicos/fictícios, sem exportações pessoais ou logs com conteúdo do usuário.

- `navigation-before.json` / `navigation-after.json`: contexto Playwright isolado, bundle de produção, viewport 412×915, banco vazio fictício, seis trocas entre salas e uma frase digitada. Contagens de requests/gravações são comparáveis; tempos **não** são comparação controlada por concorrência local diferente. Caudas piores posteriores foram mantidas.
- `bundle-before.json` / `bundle-after.json`: entry e imports JS/CSS estáticos transitivos, sem bytes duplicados. Não mede parsing, memória, rede, GPU ou FPS. Build diagnostics não é essa comparação de payload normal.
- `validation.json`: comandos, resultados, falhas iniciais/finais e gates pendentes. Rodadas suplementares se sobrepõem; não somar suas contagens.
- `apk.json`: hashes, assinatura, conferência integral do payload web e fingerprint das fontes de runtime. Builds locais, não instalação ou certificação física. Binários ficam fora do Git.

O E2E novo tem uma falha 3D de timeout ainda aberta. Não classificá-la como PASS por haver checks unitários ou gate humano histórico de outra versão. Não houve solicitação de CI/merge. [Relatório](../../BV_UXC_R5_DESEMPENHO_GLOBAL_2026-11-09.md).
