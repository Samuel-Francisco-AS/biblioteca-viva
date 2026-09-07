# Direção artística — Reboot espacial

## Intenção
Um lugar íntimo, antigo, mágico, habitado e construído ao longo do tempo. Abandonar a sensação de cinco cenários temáticos e buscar um único lugar coerente.

## Espaço
Construção contínua; cômodos neutros; corredores/passagens visíveis; câmera sobre planta maior; suporte a crescimento; objetos de naturezas diferentes coexistem.

## Perspectiva
Direção vigente: top-down oblíquo 2.5D ortogonal. Profundidade por sobreposição/ordenação; isométrico só após mockup/protótipo. Sem 3D real.

## Objetos
Assets posicionáveis precisam de footprint, origem, hit area, seleção, rotações, depth, legibilidade mobile e fallback.

## Habitantes
Devem parecer habitantes do lugar, não mascotes presos a uma sala temática.

## Iluminação
Manhã/tarde/noite/madrugada continuam como atmosfera global. Luzes locais podem vir de objetos, sem exigir iluminação dinâmica cara no primeiro slice.

## UI
Header, dock, balões e sheets ocupam o mínimo e não fragmentam o mundo em painéis permanentes.

## Pipeline
Registrar dimensões lógicas, pivô, footprint, rotações, depth policy, estados, licença e fallback.

## Obsoleto como direção futura
- sala fixa por categoria;
- troca de sala como aba;
- câmera fixa;
- composição inteira sempre contida na viewport.
P2 permanece histórico.

## Estado W3-A

W1/W2 mantêm dois espaços neutros, agora delimitados por uma família modular real de paredes. A escala comum é 300 px-fonte para 32 world units; os segmentos medidos de 1/2/4 células compõem os dois eixos sem rotação/espelhamento e continuam as referências de espessura, perspectiva e luz.

Os quatro cantos `production` aprovados foram promovidos às fontes e ao runtime em R2-B2-B. Cada um usa canvas 1248×1248, alpha bbox `1200x1200+24+24`, dois braços de 1200 px e orientação própria; candidatos e fontes são byte a byte iguais, e runtime é pixel-equivalente. A porta horizontal possui estados aberto/fechado no mesmo vão lógico. Porta vertical continua fora por ausência de arte aprovada.

R3-C-B2 demonstrou historicamente que conformidade individual de canvas, bbox e planos longitudinais não garantia uma construção visualmente contínua. A correção geral por normal topológica foi aceita e a repetição passou 9/9 com 31/31 emendas; nenhum PNG precisou ser alterado.

## Direção aprovada para R4

Sam aprovou visualmente `art-guides/w3-a-r4-ux-proposal/` como direção, não como código nem como representação substituta da Biblioteca. A aplicação usa atmosfera verde-escura e dourada, tipografia editorial apenas em títulos, header compacto e dock de cinco áreas. A Biblioteca real continua dominante e contínua sob os overlays.

A etiqueta contextual usa sala/período reais e completa seu ciclo em cinco segundos, conforme a alteração solicitada no aceite. R4 continua em andamento: os conteúdos internos e a máquina completa da Construção ainda não foram migrados. Leitura artística, responsividade percebida, safe areas físicas e escala no Moto G06 continuam humanas e pendentes.
