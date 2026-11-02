# Direção artística

> **BF-4F2 concluída por gate dirigido (2026-11-02):** animações por seleção e controles React aceitas no Moto G06, sem regressão/queda de fluidez percebida. Simplicidade artística não é teto futuro. CI global FAIL e novos casos F2 rastreados em [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15). [Fechamento](BF-4F2_RELATORIO.md).

O futuro mundo deve parecer íntimo, antigo, acolhedor, mágico e habitado. Madeira, pedra, latão/dourado, pergaminho, bordô e verde profundo formam a linguagem material e cromática inicial. Legibilidade mobile continua prioritária.

A direção aprovada é **3D real estilizado com apresentação ortográfica/2.5D**. O mundo deve ter profundidade real sem perder leitura clara, calor e identidade editorial.

Escala, iluminação, materiais, densidade, animação e enquadramento ainda precisam de provas artísticas. Este documento não congela engine, formato de arquivo ou especificação técnica antes dessas provas.

## Ambição artística e criativa acima da otimização preventiva — prioridade vigente

**A Biblioteca Viva deve parecer um mundo vivo, acolhedor e mágico — não um benchmark gráfico.** Identidade dos habitantes, encenação, expressividade, cenários ricos, magia, humor, interações e histórias são objetivos primários. Não substituir a visão por uma estética genérica só porque é mais barata em draw calls ou mais simples de testar.

**Não presumir incapacidade do Moto G06.** F5 não estabeleceu teto do aparelho; F2 foi aceita fisicamente sem perda de fluidez percebida. Nenhuma dessas evidências garante desempenho sustentado ou ilimitado. Criar uma versão artística convincente, observar no mundo integrado e otimizar **somente diante de impacto real demonstrado**, preservando o resultado criativo.

A animação F2 pode ser enriquecida no futuro, apesar do aceite atual. Em F3, os habitantes precisam de iniciativa e relações críveis, não circulação mecânica; em F4, a narrativa e as escolhas precisam ser ricas e coerentes, não mero menu raso. Aceite estético pertence ao usuário, não à suíte E2E. Segurança e acessibilidade continuam obrigatórias. [Testes](TESTING.md), [desempenho](PERFORMANCE.md).

## BF-4 (decisão de escopo; não é aprovação visual)

A transformação visual deve alcançar os **cinco cômodos juntos** desde BF-4B, mantendo coesão geral e diferenças intencionais sem reservar cômodos a categorias. BF-4F prevê personagens reconhecíveis individualmente por silhueta, traje, acessórios e expressividade animada. Materiais, densidade, luzes, oclusão e personagens ainda requerem validação visual integrada no Moto G06. Referência: [BF-4 — Plano e contrato](BF-4_PLANO_CONTRATO.md).

## BF-4F — Identidade artística dos quatro habitantes (concepção aprovada)

O usuário adotou quatro personagens fantásticos detalhados: **Samael** (2,00 m, corpo robusto escuro, aura negra/lilás e gesto pesado), **Aryn** (elfa 1,70 m, cabelos escuros, pele clara, óculos e aura luminosa suave, gestos ágeis), **Ytha** (fada 1,70 m, cabelos rosa/lilás, asas de borboleta e luz feérica, atuação leve) e **Lua** (maga imortal 1,60 m, óculos, cadernos e grimório, gestos expressivos de magia instável). **Não** basta recolorir o mesmo modelo; identidade de cada um depende de silhueta, traje, acessórios, rosto, animação e comportamento. Os quatro devem ser legíveis na câmera ortográfica e dialogar visualmente com os cinco cômodos. Decisões de paleta final, rigging, efeitos, rosto e acabamento dependem de prova artística e aceite humano no Moto G06. [Bíblia BF-4F](BF-4F_CONCEPCAO_HABITANTES.md). Planejamento não equivale a asset produzido.

**Fechamento BF-4F1 (2026-11-02):** quatro habitantes integrados, visual inicial aprovado e seleção pelo canvas e React confirmada no Moto G06. Microgestos de cabeça não representam animação corporal; essa expressividade fica para BF-4F2. Capturas indicaram ~60 FPS pontuais, sem benchmark sustentado. [CI 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206) passou os gates não E2E e 667 Vitest; E2E final FAIL (20 PASS, 6 FAIL, 1 flaky), sem CI global PASS. Issues #4/#11, R-19 e TalkBack permanecem. [Relatório](BF-4F1_RELATORIO.md).
