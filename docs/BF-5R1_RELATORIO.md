# BF-5R1 — Intervenção direta na candidata visual

- **Estado:** implementação remota de refinamento sobre a branch da PR draft #20; **sem merge e sem aceite humano**
- **Base:** `feat/bf-5-uiux-global-rework` / `15f0f10d7757aa40ad6fb809b1cf27426e284ddf`
- **Motivação:** o proprietário rejeitou explicitamente a primeira candidata BF-5 após capturas reais no Moto G06: predominância de cards, falta de atmosfera sobrenatural, canvas sem protagonismo, HUD improvisada e responsividade/ergonomia insatisfatórias.
- **Autoridade:** `docs/BF-5_DIRECAO_VISUAL_GLOBAL.md` e `docs/BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md`

## O que esta intervenção altera

1. **Biblioteca:** a superfície Three/WorldHost é apresentada em viewport inteiro; introduz cabeçalho diegético de localização, bússola para abrir o hub semântico sob demanda e ambientação de bordas. O comando de exploração abandona a apresentação permanente das três caixas de controle. A alternativa React permanece acionável quando invocada ou quando o renderer falha; os dados e IDs da seleção continuam no fluxo anterior.
2. **HUD:** ferramentas de RPG ganham tratamento de beacons, com melhor hierarquia e distanciamento do dock. Diálogo e diário recebem um plano narrativo inspirado em RPG, com escolhas distintas, altura limitada, rolagem interna e layouts específicos de paisagem.
3. **Navegação global:** dock redesenhado como instrumento de navegação flutuante, com medalhões, estado ativo, foco, feedback e ícones legíveis.
4. **Todas as abas convencionais:** capa editorial com sigilo SVG animado, escala de cabeçalhos reduzida, transição de chegada, superfícies reformuladas para registros, Arquivo, estatísticas e Ajustes. CSS aditivo dedicado à BF-5R1 preserva contratos e facilita reversão.
5. **Qualidade:** estilo de movimento reduzido e alto contraste preservados; E2E e teste de unidade acompanham o novo hub em vez de exigir que a lista anterior fique sempre aberta.

## Limites conscientes

- Esta é **uma implementação concreta**, não um mockup, mas **a qualidade artística final depende de novas capturas e validação humana**. Nenhum resultado visual no Android é presumido.
- A estilização dos componentes convencionais ainda parte dos fluxos de dados existentes. Não foram introduzidos jogos, inventário, XP, dados falsos, capas artificiais, LLM, persistência espacial ou mudanças de domínio.
- O estado da CI/Android será registrado quando houver execução real; a ausência de prova não pode ser relatada como PASS.
- As pendências da BF-4 e as ressalvas prévias da BF-5 continuam separadas. O visual rejeitado não foi integrado à main.

## Roteiro de inspeção física

1. Biblioteca: verificar que a cena ocupa todo o viewport (inclusive atrás do HUD), pan/pinch e toque direto em objeto.
2. Bússola: abrir/fechar hub; acessar seleção sem canvas e registros, com sucesso e sem WebGL.
3. Diálogo: história de Lua, escolhas, diário, Back, rotação, scroll interno e texto legível acima do dock.
4. Abas: inspeção com registros reais e telas vazias; busca, filtros, edição, Arquivo, Resumo, Ajustes e teclado.
5. Movimentos e acessibilidade: alto contraste, redução de movimento, foco, textos grandes, retomada de segundo plano e leitura assistiva futura.

**Não encerrar BF-5 nem integrar à main antes da aprovação artística, ergonômica e funcional do usuário.**
