import { config } from "zod";

// A CSP do aplicativo bloqueia new Function; o parser interpretado do Zod é o
// caminho suportado para ambientes sem avaliação dinâmica.
config({ jitless: true });
