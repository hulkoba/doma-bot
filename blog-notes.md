# Telegram Bot using Node.js and CouchDB/PouchDb

## First steps!
npm init
npm i node-telegram-bot-api, dotenv, pouchdb

for the reminder at 5pm: npm i node-cron, node-ical, 

(node-telegram-bot-api)[https://www.npmjs.com/package/node-telegram-bot-api] is for interaction wth the telegram API

## BotFather
(Create)[https://core.telegram.org/bots#3-how-do-i-create-a-bot] a bot with (BotFather)[https://telegram.me/BotFather]
Get a token from BotFather, use it for API requests

### Add the bot on your phone(Telegram App)

## set up basics
add BOT_TOKEN to .env file and
```
const telegramBot = require('node-telegram-bot-api')
require('dotenv').config()

const token = process.env.BOT_TOKEN
const bot = new telegramBot(token, { polling: true })
```

let the bot reply us
```
bot.onText(/\/start/, (msg, match) => {
  bot.sendMessage(
    msg.chat.id,
    'Hallo Domas!'
  ).then(() => { // do something })
```
if we tyle `/start` the bot is initialised and sends a 'Hallo Domas' 
Test it per running `node index.js` and send your bot the `/start` message

## connect to couch
### install couchDb



# deploy
