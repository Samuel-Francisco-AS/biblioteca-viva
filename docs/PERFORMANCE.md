# Desempenho e estabilidade

O objetivo atual é manter o aplicativo convencional responsivo e estável em navegador e Android. Consultas relacionadas devem ser carregadas em lote, duração de sessão deriva de timestamps e listeners/players precisam respeitar lifecycle.

`npm run performance:report` relata arquivos e tamanho total dos entrypoints do build. Não existe budget específico de mundo no baseline atual.

O futuro mundo 3D estabelecerá um novo baseline. Desempenho em hardware Android modesto é risco aberto e só poderá ser avaliado com implementação e teste físico identificados.
