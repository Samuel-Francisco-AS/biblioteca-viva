# BF-4F1 — fontes originais candidatas

Autoria: Codex, sob direção criativa de Samuel Francisco, para Biblioteca Viva, em 2026-11-02. Nenhum modelo, textura, fonte tipográfica ou imagem de terceiros foi incorporado. Não há licença externa a cumprir; este checkpoint não altera o licenciamento do projeto nem concede licença pública nova. Blender 3.3.21 é ferramenta, não asset distribuído.

`build.py` é a receita original reproduzível (executar da raiz: `blender -b -t 2 --python assets/3d/source/inhabitants/build.py`). Os quatro `.blend` preservam peças editáveis, materiais PBR por fatores e um nó Head com microgesto. Coordenadas Blender X/largura, -Y/frente, Z/altura, em metros. A exportação GLB converte para Y-up; root identidade, chão Y=0, alturas 2/1,7/1,7/1,6 m incluindo cabelo/chifres.

Após salvar as fontes, a exportação agrupa meshes de mesmo material e mesmo pai; não une cabeça ao corpo. Essa redução localizada de draw calls responde à lentidão observada no E2E inicial. Não é política global de batching. Fontes continuam desagrupadas para edição. Não há skin, bones, texturas, decoders ou extensões proprietárias. O GLB contém geometria, materiais e clip de rotação; não depende de arquivos externos.

Os PNGs são prévias Blender, não capturas do Moto G06 nem aprovação artística. `render.py` reproduz essas prévias a partir das fontes. Modelos são candidatos F1: não aprovados como arte final. Ver limitações e gates em `docs/BF-4F1_RELATORIO.md`.

A receita também regenera `manifest.json` com SHA-256, bytes, meshes, triângulos e clips. A amostragem de curvas foi reduzida após a primeira rodada WebGL: os quatro GLBs somam 26.280 triângulos, 49 meshes e 774.356 bytes. São métricas de arquivo, não orçamento físico. As fontes ainda permitem aumentar resolução ou redesenhar partes durante revisão.
