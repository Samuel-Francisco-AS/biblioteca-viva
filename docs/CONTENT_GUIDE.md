# Guia de conteúdo, diálogos e localização

## 1. Voz do produto

A Biblioteca Viva fala de modo acolhedor, curioso e discreto. O texto reconhece experiências sem fiscalizar desempenho.

Evitar:

- culpa por ausência;
- “sequência perdida”;
- urgência artificial;
- infantilização;
- elogios exagerados;
- frases corporativas de produtividade;
- repetição excessiva de magia e destino.

## 2. Bibliotecária

A bibliotecária:

- observa sem julgar;
- comenta ações reais;
- pode ser espirituosa, mas não sarcástica com o usuário;
- acolhe retorno após pausa;
- não transforma cada livro em conquista épica;
- evita interpretar conteúdo pessoal além do que os dados sustentam.

Exemplo de tom:

> “Este encontrou um lugar na estante. Podemos voltar a ele quando você quiser.”

## 3. Estados de retorno

- retorno rápido: comentário neutro ou nenhum;
- retorno após pausa: acolhimento sem mencionar falha;
- livro abandonado: linguagem de escolha, não derrota;
- conclusão: celebração proporcional;
- biblioteca vazia: convite, não cobrança.

## 4. Conteúdo orientado a dados

Diálogos, marcos, salas e decorações devem ter:

- ID estável;
- versão;
- chave de localização;
- condições declarativas;
- prioridade;
- cooldown ou regra de repetição quando necessário;
- fallback;
- testes de integridade.

Texto não deve ficar espalhado em componentes ou cenas.

## 5. Localização

Idioma inicial: `pt-BR`.

Desde o início:

- chaves estáveis;
- nenhuma frase montada por concatenação frágil;
- datas, números e plurais formatados pela localidade;
- espaço para textos maiores;
- conteúdo e lógica separados.

Não é necessário implementar múltiplos idiomas no protótipo, apenas evitar bloqueá-los.

## 6. IDs sugeridos

```text
dialogue.librarian.first-book
dialogue.librarian.return-after-pause
dialogue.creature.first-touch
milestone.first-completed-book
reward.decoration.reading-lamp
room.main.default
```

IDs não mudam por revisão de texto.

## 7. Conteúdo pessoal e IA futura

Nenhuma IA participa do protótipo. Antes de usar IA em notas ou diálogos:

- definir propósito real;
- consentimento explícito;
- explicar envio de dados;
- evitar conteúdo pessoal por padrão;
- oferecer modo local/sem IA;
- revisar custo, privacidade e falhas;
- registrar decisão e política.

## 8. Revisão

Todo conteúdo novo deve passar por:

- coerência de tom;
- ausência de culpa;
- clareza mobile;
- localização;
- integridade de IDs;
- repetição aceitável;
- acessibilidade;
- licença quando derivado de obra externa.
