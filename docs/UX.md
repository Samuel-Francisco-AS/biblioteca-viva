# Fluxos de experiência

## Navegação

O dock global contém Biblioteca, Coleção, Arquivo, Resumo e Ajustes. “Novo registro” é ação contextual da Coleção. URLs históricas continuam sendo redirecionadas quando necessário.

O destino ativo usa semântica de link e `aria-current`. Conteúdo reserva a safe area e o espaço do dock.

## Biblioteca

```text
abrir Biblioteca
-> carregar projeção React
-> inicializar ou atualizar o host Phaser
-> renderizar world.main
-> enquadrar região inicial
```

A etiqueta contextual usa sala e período reais, completa entrada e saída em 5.000 ms e é removida do DOM. Rerender comum não reinicia o ciclo. Uma alternativa textual permanente continua disponível.

## Exploração e seleção

- Arraste em área livre move a câmera dentro dos bounds.
- Toque curto em objeto ou peça selecionável não inicia pan.
- Seleção mostra ações contextuais em React.
- Fechar a seleção encerra subestado de movimento e limpa preview.

## Construção

```text
Biblioteca -> Construir -> dock global oculto
-> escolher piso ou peça
-> preview válido/inválido
-> confirmar caso de uso
-> atualizar projeção sem reload
-> Sair -> mesmo canvas + dock restaurado
```

Paletas iniciam fechadas. “Peças colocadas” aparece como faixa compacta, fecha ao selecionar e não substitui o mapa como superfície principal. Selecionar, mover, girar, guardar e editar piso são estados exclusivos quando suas ações podem conflitar.

Falha de persistência recarrega estado seguro e informa o usuário. Preview não é persistido.

## Coleção e Arquivo

Coleção inicia com Busca recolhida; Arquivo inicia com Filtros recolhidos e mantém busca textual visível. Abrir e fechar preserva parâmetros e resultados. Escape ou Android Back fecha primeiro o subestado superior antes de sair da rota.

## Resumo

Resumo apresenta métricas derivadas de dados reais, estados vazios e gráfico responsivo. Não exibe valores fictícios. A alternativa textual da Biblioteca é distinta do Resumo estatístico, embora ambos permaneçam acessíveis pela interface React.

## Falha do canvas

Falha visual não bloqueia registros, coleção, arquivo, configurações ou recuperação de dados. React informa o erro e oferece nova tentativa quando segura.

## Acesso

Drag preciso não pode ser a única forma de concluir uma ação essencial. Requisitos completos estão em `ACCESSIBILITY.md`.
