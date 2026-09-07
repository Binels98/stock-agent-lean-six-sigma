# Stock Agent Lean Six Sigma

Sistema Multi-Agente per Analisi Azionaria 24/7 con Metodologia Lean Six Sigma

## Descrizione

Team di 19 agenti autonomi per analisi continua delle azioni su mercati Europei e Americani. Il sistema opera 24/7 su GitHub Actions senza necessita di installazione locale.

## Funzionalita

- Report quotidiani automatici (08:00 e 18:00 ora Roma)
- Notifiche Telegram in tempo reale per allarmi e aggiornamenti
- Monitoraggio ogni 5 minuti durante gli orari di mercato (09:00-22:00 ora Roma)
- 6 filosofie di investimento diverse analizzate contemporaneamente
- Sintesi automatica e tabella decisionale per confronto con l utente
- Riassunto del giorno precedente incluso nel report mattutino
- Gestione portafoglio con rebalancing automatico

## Attivazione e Configurazione (Punto 1.2)

### Passo 1: Fork del Repository
1. Andare su: https://github.com/Binels98/stock-agent-lean-six-sigma
2. Cliccare su Fork (in alto a destra)
3. Selezionare il proprio account

### Passo 2: Configurazione Segreti GitHub
1. Andare su: https://github.com/[IL_TUO_USERNAME]/stock-agent-lean-six-sigma/settings/secrets/actions
2. Aggiungere i seguenti segreti:

SEGRETO 1:
- Name: TELEGRAM_BOT_TOKEN
- Value: (Token da @BotFather su Telegram)

SEGRETO 2:
- Name: TELEGRAM_CHAT_ID
- Value: 605183760

### Passo 3: Abilitazione GitHub Actions
1. Andare sulla tab Actions
2. Cliccare su I understand my workflows, go ahead and enable them

### Passo 4: Test
1. Andare su Actions
2. Selezionare un workflow
3. Cliccare Run workflow
4. Selezionare main branch
5. Cliccare Run workflow
6. Aspettare completamento (icona verde)

## Orari (Roma)
- Monitoraggio: 09:00-22:00 ogni 5 minuti
- Report Mattutino: 08:00 con riepilogo giorno precedente
- Report Serale: 18:00

## Struttura
agents/ - 19 agenti specializzati
config/ - Configurazioni
.github/workflows/ - 8 workflow GitHub Actions
scripts/ - Script report
lib/ - Librerie supporto

## Risoluzione Problemi

### Workflow non parte
- Verificare GitHub Actions abilitato
- Controllare branch sia main
- Verificare segreti configurati

### Nessuna notifica Telegram
- Verificare TELEGRAM_BOT_TOKEN corretto
- Verificare TELEGRAM_CHAT_ID = 605183760
- Testare con: curl https://api.telegram.org/bot[TOKEN]/sendMessage?chat_id=605183760&text=Test

### Errore FormData
- Assicurarsi package.json abbia form-data: ^4.0.0
- Assicurarsi telegram.js abbia const FormData = require(form-data)

## Licenza
MIT License

## Autore
Federico Binello