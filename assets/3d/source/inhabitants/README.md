# Habitantes R5 — fonte autoral editável

Autoria original Codex sob direção criativa de Samuel Francisco, Biblioteca Viva, 07/11/2026. Nenhum modelo, textura, imagem, fonte ou referência externa incorporada; não há atribuição/licença de terceiros para esses assets. O licenciamento geral do repositório permanece vigente.

Executar da raiz: `blender -b -t 2 --python assets/3d/source/inhabitants/build.py`. Blender 3.3.21. A receita salva quatro `.blend` com superfícies individuais, materiais e ações editáveis, depois agrupa por material preservando pesos e exporta os quatro GLBs produtivos. X largura, -Y frente, Z altura; metros, root identidade, piso zero. GLTFLoader converte para Y-up. Alturas 2 / 1,70 / 1,70 / 1,60 m incluem cabelo/chifres. Os PNGs antigos neste diretório são história F1, não evidência R5.

A autoria combina perfis anatômicos com pesos suaves na cintura/cotovelos/joelhos, mechas e chifres afilados, painéis de roupas, filigranas, cristais e membranas. Não usa texturas nem decoders. Materiais PBR explícitos, metal/tecido diferenciados; transparência só na membrana feérica. Cada GLB tem uma skin real, 15 bones (17 Ytha), oito clips NLA e três sockets: `socket_carry` filho de HandL, `socket_hand_right` de HandR, `socket_seat` de Pelvis. As mãos deformam sua geometria; o socket de assento é uma referência anatômica, não implementação de sentar.

Inventário: `node scripts/inspect-inhabitants.mjs src/features/library/three/assets /tmp/inhabitants.json`. Evidências e pipeline detalhado: `docs/audits/BV_RECUPERACAO_R5.md`. As fontes são reproduzíveis semanticamente; o exportador não promete identidade binária entre versões de Blender. Aprovação artística independente de cada personagem e gate físico Moto G06 pendentes.
