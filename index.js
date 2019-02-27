const telegramBot = require('node-telegram-bot-api');
const env = require('dotenv').config();

const token = process.env.BOT_TOKEN;

// const bot = new telegramBot (token, {polling:true});
let reminder;
