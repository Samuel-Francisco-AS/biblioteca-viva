# Arquitetura

```text
presentation (React) -> application -> domain
infrastructure -------> application ports
```

- `domain` contém entidades, invariantes, transições, erros e regras puras.
- `application` coordena casos de uso, transações e portas.
- `infrastructure` implementa persistência, plataforma, arquivos e áudio.
- React apresenta shell, navegação e fluxos convencionais.

Domain não importa React, Dexie, Capacitor, DOM ou browser. React não acessa Dexie diretamente. Entradas externas são validadas nas fronteiras e eventos são publicados somente depois do commit.

O composition root monta repositórios Dexie, casos de uso, serviços de backup, preferências, áudio e integrações de plataforma. A Biblioteca atualmente não possui renderer de mundo. Nenhuma engine 3D faz parte da arquitetura ativa.
