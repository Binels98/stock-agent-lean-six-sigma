# Guida Rapida all Attivazione

Seguire questi 6 passi per attivare il sistema in 10 minuti.

## Passo 1: Repository
Repository: https://github.com/Binels98/stock-agent-lean-six-sigma
Tutti i file sono gia caricati.

## Passo 2: Creare Bot Telegram
1. Aprire Telegram e cercare @BotFather
2. Inviare /newbot
3. Seguire istruzioni e ottenere il TOKEN

## Passo 3: Ottenere Chat ID
1. Avviare chat con il bot
2. Inviare un messaggio qualsiasi
3. Andare su: https://api.telegram.org/bot<TOKEN>/getUpdates
4. Cercare chat.id nel JSON e copiare il numero

## Passo 4: Configurare Segreti GitHub
1. Andare su: https://github.com/Binels98/stock-agent-lean-six-sigma/settings/secrets/actions
2. Cliccare New repository secret
3. Aggiungere:
   - TELEGRAM_BOT_TOKEN = (token dal passo 2)
   - TELEGRAM_CHAT_ID = (ID dal passo 3)

## Passo 5: Abilitare GitHub Actions
1. Andare su: https://github.com/Binels98/stock-agent-lean-six-sigma/actions
2. Cliccare I understand my workflows, go ahead and enable them

## Passo 6: Testare
1. Andare su Actions
2. Selezionare un workflow (es: Calendar)
3. Cliccare Run workflow > main > Run workflow
4. Aspettare completamento (icona verde)
5. Riceverete notifica Telegram al primo report

## Orari (Roma)
- Monitoraggio: 09:00-22:00 ogni 5 minuti
- Report Mattutino: 08:00 con riassunto giorno precedente
- Report Serale: 18:00

## Supporto
Consultare README.md per dettagli completi.