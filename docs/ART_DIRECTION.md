# Direção artística

> **BF-4F1 fechada no escopo dirigido (2026-11-02):** os quatro modelos iniciais e a seleção canvas/React foram aceitos no Moto G06. F2, F3 e F4 seguem pendentes. [Relatório F1](BF-4F1_RELATORIO.md).

O futuro mundo deve parecer íntimo, antigo, acolhedor, mágico e habitado. Madeira, pedra, latão/dourado, pergaminho, bordô e verde profundo formam a linguagem material e cromática inicial. Legibilidade mobile continua prioritária.

A direção aprovada é **3D real estilizado com apresentação ortográfica/2.5D**. O mundo deve ter profundidade real sem perder leitura clara, calor e identidade editorial.

Escala, iluminação, materiais, densidade, animação e enquadramento ainda precisam de provas artísticas. Este documento não congela engine, formato de arquivo ou especificação técnica antes dessas provas.

## BF-4 (decisão de escopo; não é aprovação visual)

A transformação visual deve alcançar os **cinco cômodos juntos** desde BF-4B, mantendo coesão geral e diferenças intencionais sem reservar cômodos a categorias. BF-4F prevê personagens reconhecíveis individualmente por silhueta, traje, acessórios e expressividade animada. Materiais, densidade, luzes, oclusão e personagens ainda requerem validação visual integrada no Moto G06. Referência: [BF-4 — Plano e contrato](BF-4_PLANO_CONTRATO.md).

## BF-4F — Identidade artística dos quatro habitantes (concepção aprovada)

O usuário adotou quatro personagens fantásticos detalhados: **Samael** (2,00 m, corpo robusto escuro, aura negra/lilás e gesto pesado), **Aryn** (elfa 1,70 m, cabelos escuros, pele clara, óculos e aura luminosa suave, gestos ágeis), **Ytha** (fada 1,70 m, cabelos rosa/lilás, asas de borboleta e luz feérica, atuação leve) e **Lua** (maga imortal 1,60 m, óculos, cadernos e grimório, gestos expressivos de magia instável). **Não** basta recolorir o mesmo modelo; identidade de cada um depende de silhueta, traje, acessórios, rosto, animação e comportamento. Os quatro devem ser legíveis na câmera ortográfica e dialogar visualmente com os cinco cômodos. Decisões de paleta final, rigging, efeitos, rosto e acabamento dependem de prova artística e aceite humano no Moto G06. [Bíblia BF-4F](BF-4F_CONCEPCAO_HABITANTES.md). Planejamento não equivale a asset produzido.

**Fechamento BF-4F1 (2026-11-02):** quatro habitantes integrados, visual inicial aprovado e seleção pelo canvas e React confirmada no Moto G06. Microgestos de cabeça não representam animação corporal; essa expressividade fica para BF-4F2. Capturas indicaram ~60 FPS pontuais, sem benchmark sustentado. [CI 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206) passou os gates não E2E e 667 Vitest; E2E final FAIL (20 PASS, 6 FAIL, 1 flaky), sem CI global PASS. Issues #4/#11, R-19 e TalkBack permanecem. [Relatório](BF-4F1_RELATORIO.md).
