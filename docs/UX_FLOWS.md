# Fluxos de UX — Reboot espacial

## Entrar
```text
abrir Biblioteca
→ carregar projeção convencional
→ montar configuração espacial W1 efêmera
→ atualizar mesma instância Phaser
→ câmera mostra região inicial
```

## Explorar
```text
pan em área livre → câmera acompanha → respeitar bounds → soltar
```
No W1 não há objetos selecionáveis. Toque curto não inicia pan; drag de objeto só existirá em modo de edição futuro.

## Interagir — W2
```text
toque curto → selecionar → feedback visual → React mostra ações contextuais
```

## Mover — W2 concluída
```text
selecionar → Mover → modo posicionamento → drag
→ Phaser conserva somente o ponto mais recente por frame
→ preview válido/inválido → confirmar → persistir
```
Falha restaura estado seguro e informa o usuário.

O cartão contextual possui fechamento acessível: fechar encerra Mover, limpa a seleção e aplica apenas uma transição visual curta.

## Girar — W2 concluída
Selecionar → Girar → próxima orientação permitida → preview imediato → persistir o último estado desejado. Falha do último commit restaura o estado seguro.

Confirmações usam um único toast textual temporário; nova confirmação atualiza o texto e reinicia sua leitura, sem mover foco.

## Desbloqueio estrutural — implementado em P3-C
Ação real → regra/milestone → unlock persistido → feedback → objeto disponível. A concessão é idempotente, e o objeto não é posicionado automaticamente.

## Habitante — futuro W4
Toque → interação tipada + âncora → React apresenta fala/ação.

## Falha do canvas
React mantém registros e funções essenciais, informa falha recuperável e oferece tentar novamente.

## Editor acessível
Antes de finalizar, definir alternativa ao drag preciso. Nenhuma solução específica está aprovada ainda.

## R4 — shell e navegação em andamento

```text
Biblioteca | Coleção | Arquivo | Resumo | Ajustes
→ um único dock global
→ rota ativa por aria-current
→ conteúdo reserva dock + safe area
```

“Resumo” abre a rota existente de Estatísticas; “Novo registro” permanece acessível diretamente e passa a ser ação contextual da Coleção. URLs históricas e retornos após salvar/cancelar continuam válidos. O drawer anterior não concorre mais com o dock.

Ao entrar na Biblioteca, a etiqueta mostra sala e período reais e completa entrada, permanência e saída em 5.000 ms. Mudar sala ou período cancela e reinicia o ciclo com o contexto mais recente; rerender comum não reinicia. Ao final ela sai do DOM. Movimento reduzido remove fade/deslocamento, mas conserva informação e duração; a alternativa textual permanente não depende da etiqueta.

```text
Biblioteca normal → Construir → dock global ausente
→ controles atuais da tarefa continuam ativos
→ Sair → mesmo host/canvas + dock restaurado
```

Esta primeira entrega não redesenha palette, seleção, movimento, piso, confirmação nem o painel “Peças colocadas”. A máquina completa, barra exclusiva, Android Back e redução adicional de oclusão continuam pendentes dentro de R4.
