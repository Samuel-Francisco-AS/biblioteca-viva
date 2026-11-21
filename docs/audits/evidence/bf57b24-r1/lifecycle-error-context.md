# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: performance-navigation.spec.ts >> performance candidate: world keeps one renderer and loop across dock return
- Location: e2e/performance-navigation.spec.ts:72:1

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Ir para o conteúdo principal" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e5]:
    - region "Biblioteca Viva" [ref=e7]:
      - heading "Biblioteca Viva" [level=2]
      - generic:
        - generic:
          - region "Histórias da Biblioteca":
            - generic "Atalhos das histórias":
              - button "Diário de histórias · 0/5" [ref=e11] [cursor=pointer]:
                - text: ✦
                - generic [ref=e12]: Diário de histórias
                - generic: 0/5
              - button "A Noite da Fenda Lilás" [ref=e13] [cursor=pointer]: ☾
          - region "Objetos vivos"
  - generic: ✦ DESDOBRANDO AS PÁGINAS ✦
  - navigation "Navegação principal" [ref=e15]:
    - generic:
      - generic: ✧
      - generic: O LIVRO DAS PASSAGENS
      - generic: ✧
    - list [ref=e16]:
      - listitem [ref=e17]:
        - link "Biblioteca" [ref=e18] [cursor=pointer]:
          - /url: /
      - listitem [ref=e24]:
        - link "Coleção" [active] [ref=e25] [cursor=pointer]:
          - /url: /colecao
      - listitem [ref=e30]:
        - link "Arquivo" [ref=e31] [cursor=pointer]:
          - /url: /arquivo
      - listitem [ref=e36]:
        - link "Resumo e estatísticas" [ref=e37] [cursor=pointer]:
          - /url: /estatisticas
          - generic [ref=e41]: Resumo
      - listitem [ref=e42]:
        - link "Ajustes" [ref=e43] [cursor=pointer]:
          - /url: /configuracoes
```