# Direção e arquitetura de áudio

## 1. Papel do som

O áudio é parte do núcleo emocional, mas não pode ser requisito funcional. Deve criar presença, marcar interação e reforçar a sensação de biblioteca viva sem cansar durante uso prolongado.

## 2. Categorias

- `music`: música ambiente;
- `ambience`: sala, páginas, madeira, vento discreto;
- `ui`: navegação e confirmação;
- `interaction`: estante, bibliotecária e criatura;
- `milestone`: conclusão e desbloqueio.

Cada som possui ID estável em manifesto. Componentes e cenas emitem intenção por ID; não carregam caminho diretamente.

## 3. AudioPort

O contrato deve permitir:

- inicialização após gesto;
- tocar, pausar e retomar música;
- crossfade simples quando necessário;
- tocar efeitos;
- volume geral, música e efeitos;
- mute;
- ciclo de vida do app;
- liberação de recursos;
- consulta de disponibilidade;
- fallback silencioso.

## 4. Regras de comportamento

- sem autoplay forçado;
- preferências persistidas;
- pausar ou reduzir ao ir para segundo plano;
- não empilhar efeitos após retorno;
- um mesmo evento não dispara som duplicado por React e Phaser;
- falha de áudio não bloqueia ação;
- conclusão possui equivalente visual e textual;
- modo de efeitos reduzidos limita sons repetitivos.

## 5. Paisagem inicial

Mínimo do protótipo:

- uma faixa ou loop ambiente;
- um efeito de página/interface;
- um efeito da estante;
- um efeito da criatura ou bibliotecária;
- um efeito de conclusão;
- um efeito de desbloqueio curto.

A lista final e as referências precisam ser aprovadas no Gate G0/G7.

## 6. Produção

- loops sem clique perceptível;
- volume normalizado de forma consistente;
- formatos testados na WebView Android;
- arquivos comprimidos sem degradação evidente;
- duração e tamanho registrados no manifesto;
- origem, autoria e licença documentadas;
- não usar música comercial sem licença.

## 7. Acessibilidade e conforto

- controles separados;
- mute visível;
- nenhum som abrupto muito acima da paisagem;
- sem frequência ou repetição agressiva;
- opção de reduzir efeitos;
- áudio não é feedback exclusivo;
- respeitar sessão longa de leitura ou escrita.

## 8. Testes Android

- primeira interação libera áudio;
- fone e alto-falante;
- mute e volumes persistem;
- chamada/interrupção e retorno;
- segundo plano;
- troca de rota repetida;
- ausência de vazamento ou reprodução duplicada;
- tela bloqueada, quando aplicável.
