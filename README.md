# Gatekeeper - Gestione Gate di Progetto

Web app per gestire i gate di progetto (0→3) con checklist, stati e override della Direzione. I dati sono salvati in `localStorage` e possono essere esportati/importati come JSON.

## Requisiti

- Node.js 18+

## Avvio rapido

```bash
npm install
npm run dev
```

Apri `http://localhost:5173`.

## Funzionalità principali

- Stati gate: **INCOMPLETO**, **PASS**, **FAIL**.
- Blocca l’avanzamento: il gate N è modificabile solo se il gate N-1 è in PASS.
- Export/import JSON del progetto.
- Log override Direzione (solo Filippo, con traccia scritta obbligatoria).

## Comandi utili

```bash
npm run lint
npm run test
npm run build
```

## Note sui dati

I dati vengono salvati automaticamente in `localStorage` con chiave `gatekeeper-project`.
