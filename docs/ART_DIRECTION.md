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

## Estado W1

W1 usa apenas dois espaços neutros e paredes/poucas âncoras procedurais para validar continuidade, escala e câmera. Isso não substitui o Kit Zero nem inicia produção artística. Os PNGs de parede atuais não possuem proporção compatível com módulos de 32 world units e serão revistos em W5.
