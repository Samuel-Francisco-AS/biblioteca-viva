# Pipeline de assets

## Princípio

Assets são entradas visuais ou sonoras versionadas, mas regras lógicas vivem no domínio e na aplicação. Toda inclusão exige procedência e estado em `ASSET_REGISTRY.md`.

## Papéis dos diretórios estruturais

- `art-candidates/`: candidatos auditáveis, fora do runtime.
- `art-source/`: fontes ativas preservadas.
- `public/assets/`: saídas carregadas pela aplicação.
- `art-guides/`: contratos, gabaritos, montagens e relatórios diagnósticos.

Não criar cópias soltas `old`, `backup` ou `final2` dentro do repositório. Histórico e recuperação pertencem ao Git.

## Contrato mínimo

Registrar para cada item:

- ID estável e categoria;
- fonte e exportações;
- autoria, ferramenta, data e licença;
- dimensões, escala, orientação e footprint;
- pivô/origem, regiões de interação e depth;
- estados e fallback;
- transformações determinísticas aplicadas;
- estado de aprovação.

## Estrutura vigente

Os 12 assets de parede compreendem segmentos horizontais/verticais, quatro cantos e porta horizontal aberta/fechada. Porta vertical não existe.

Canvas, alpha bbox e planos longitudinais individuais não comprovam composição. O gate estrutural compara normal, lado ocupado, centerline, espessura e perfil entre peças reais. Nenhuma exceção pode reconhecer cômodo, coordenada ou instância.

## Comandos existentes

```text
npm run wall-assets:process
npm run wall-assets:check
npm run wall-guides:generate
npm run wall-guides:check
```

O processamento parte de `art-source` e produz runtime determinístico. Compare hashes antes/depois e aceite apenas mudanças derivadas esperadas. O check padrão não deve depender de tolerância legada.

## Aprovação

1. Validar contrato e arquivo fora do runtime.
2. Inspecionar visualmente candidato e montagem.
3. Promover fonte aprovada.
4. Gerar runtime pelo pipeline oficial.
5. Verificar equivalência e hashes.
6. Executar composição, fallback, input e regressão visual.
7. Atualizar registro de asset e evidência humana.

O documento anterior de especificação integral está em `history/legacy/ASSET_SPEC_LEGACY.md` e não define trabalho novo.
