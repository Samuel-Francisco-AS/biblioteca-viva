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

## Desbloqueio — futuro W3
Ação real → regra/milestone → unlock persistido → feedback → objeto disponível. Não posicionar automaticamente salvo regra estrutural explícita.

## Habitante — futuro W4
Toque → interação tipada + âncora → React apresenta fala/ação.

## Falha do canvas
React mantém registros e funções essenciais, informa falha recuperável e oferece tentar novamente.

## Editor acessível
Antes de finalizar, definir alternativa ao drag preciso. Nenhuma solução específica está aprovada ainda.
