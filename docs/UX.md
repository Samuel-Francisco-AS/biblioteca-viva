# Fluxos de experiência

O dock global contém Biblioteca, Coleção, Arquivo, Resumo e Ajustes. Novo registro é uma ação contextual da Coleção. O destino ativo usa `aria-current`; safe areas e espaço do dock são preservados.

A Biblioteca apresenta uma cena Three.js técnica e descartável, com acesso claro à Coleção e à criação de registro. O canvas aceita tap/clique para seleção, arrasto para pan, wheel zoom e pinch experimental. Os botões HTML nativos `Anterior`/`Próximo` percorrem com wrap os mesmos onze objetos sem gesto preciso, e o objeto selecionado é anunciado em texto. Eles substituem o `<select>` que apresentou comportamento físico incompatível no Moto G06 e continuam sendo somente controles experimentais da Fundação. Seleção e câmera não persistem entre montagens e ainda não definem a ergonomia final do produto.

Coleção e Arquivo mantêm busca, filtros e parâmetros. Resumo apresenta métricas derivadas de dados reais. Ajustes controla experiência, áudio, diagnósticos e backup. Escape ou Android Back fecha primeiro o subestado superior quando aplicável.
