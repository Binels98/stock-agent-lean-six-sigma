# Stock Agent Lean Six Sigma

Sistema Multi-Agente per Analisi Azionaria 24/7

## Descrizione

Team di 19 agenti autonomi per analisi continua azioni su mercati Europei e Americani.

Operante 24/7 su GitHub Actions senza installazione locale.

## Funzionalita

- Report quotidiani (08:00 e 18:00 ora Roma)
- Notifiche Telegram in tempo reale
- Monitoraggio ogni 5 minuti (09:00-22:00 ora Roma)
- 6 filosofie investimento diverse
- Sintesi automatica e tabella decisionale
- Riassunto giorno precedente nel report mattutino

## Attivazione (Punto 1.2)

1. Repository: https://github.com/Binels98/stock-agent-lean-six-sigma
2. Andare su Settings > Secrets > Actions
3. Aggiungere TELEGRAM_BOT_TOKEN (da @BotFather)
4. Aggiungere TELEGRAM_CHAT_ID (ID chat con il bot)
5. Abilitare GitHub Actions su Actions tab
6. Testare con Run workflow su un workflow qualsiasi

## Orari (Roma)

- Monitoraggio: 09:00-22:00 ogni 5 min
- Report Mattutino: 08:00 con riassunto giorno precedente
- Report Serale: 18:00

## Struttura

```
agents/          # 19 agenti specializzati
config/          # Configurazioni
.github/workflows/ # 8 workflow GitHub Actions
scripts/         # Script report
lib/             # Librerie supporto
```

## Licenza

MIT License

## Autore

Federico Binello