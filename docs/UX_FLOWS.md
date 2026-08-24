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

## Interagir — futuro W2+
```text
toque curto → selecionar → feedback visual → React mostra ações contextuais
```

## Mover — futuro W2
```text
selecionar → Mover → modo posicionamento → drag
→ preview válido/inválido → confirmar
→ Application valida → persistir → projeção atualiza
```
Falha restaura estado seguro e informa o usuário.

## Girar — futuro W2
Selecionar → Girar → próxima orientação permitida → preview → validar → persistir no commit.

## Desbloqueio — futuro W3
Ação real → regra/milestone → unlock persistido → feedback → objeto disponível. Não posicionar automaticamente salvo regra estrutural explícita.

## Habitante — futuro W4
Toque → interação tipada + âncora → React apresenta fala/ação.

## Falha do canvas
React mantém registros e funções essenciais, informa falha recuperável e oferece tentar novamente.

## Editor acessível
Antes de finalizar, definir alternativa ao drag preciso. Nenhuma solução específica está aprovada ainda.
