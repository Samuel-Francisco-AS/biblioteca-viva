# ADR-002 — Arquitetura híbrida

- **Estado:** aceita
- **Data consolidada:** 2026-09-07

## Decisão

React apresenta aplicação convencional e acessível; Phaser apresenta o mundo visual; Dexie implementa persistência local atrás de portas; Capacitor empacota Android.

## Consequências

Domain não depende dessas tecnologias. React e Phaser não acessam Dexie. Phaser recebe projeções e emite intenções tipadas, mantendo regras e dados pessoais fora da cena sempre que possível.
