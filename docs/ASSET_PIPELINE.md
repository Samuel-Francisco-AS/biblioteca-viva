# Pipeline de assets

Todo asset precisa de origem, autoria, licença, fonte editável, transformações auditáveis, otimização, validação e registro. Arquivos externos são não confiáveis até passarem pelas validações do projeto.

A direção conceitual futura é:

```text
asset 3D adquirido/criado
→ fonte editável
→ normalização
→ runtime 3D
→ otimização
→ validação
```

## Fundação F1

A F1 pode usar **GLTF/GLB apenas como formato de prova**, carregado por `GLTFLoader`, para demonstrar que o runtime Three.js consegue ingerir um asset 3D externo.

O fixture deve ser simples e seguir, em ordem de preferência:

1. asset criado/gerado para o spike;
2. sample permissivo com autoria, origem e licença registradas;
3. outro asset somente com procedência clara.

Essa prova **não formaliza o pipeline 3D**, não congela escala, pivôs, convenções, compressão, materiais ou processo Blender, e não autoriza catálogo real de assets da Biblioteca.

O pipeline 3D formal só deve ser estabelecido depois que a Fundação produzir evidência suficiente. Não existem comandos ativos para ele. Não crie cópias `old`, `backup` ou `final2`; recuperação pertence ao Git.
