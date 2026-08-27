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
Menus, drawer, balões e sheets ocupam o mínimo e não fragmentam o mundo em painéis permanentes.

## Pipeline
Registrar dimensões lógicas, pivô, footprint, rotações, depth policy, estados, licença e fallback.

## Obsoleto como direção futura
- sala fixa por categoria;
- troca de sala como aba;
- câmera fixa;
- composição inteira sempre contida na viewport.
P2 permanece histórico.

## Estado W3-A

W1/W2 mantêm dois espaços neutros, agora delimitados por uma família modular real de paredes. A escala comum é 300 px-fonte para 32 world units; os segmentos medidos de 1/2/4 células e os quatro cantos compõem o plano lógico sem rotação/espelhamento. A porta horizontal possui estados aberto/fechado no catálogo, mas a cena conserva o estado fechado enquanto não existe interação aprovada. Porta vertical continua fora por ausência de arte aprovada. A leitura artística, seams e escala no Moto G06 continuam humanas e pendentes.
