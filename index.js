const telegramBot = require('node-telegram-bot-api')
const cron = require("node-cron")
const env = require('dotenv').config()

const tasks = require('./tasks.json')
const token = process.env.BOT_TOKEN

const bot = new telegramBot(token)
// const bot = new telegramBot(token, { polling:true })

bot.onText(/\/init/,(msg, match)=>{
  bot.sendMessage(
    msg.chat.id,
    `Hey! ${msg.chat.first_name} :wave:`
  )
  initCronJobs(msg)
})

/*
* second 0-59 | optional
* minute 0-59
* hour 0-23
* dayOfMonth 1-31
* month 1-12
* dayOfWeek 0-7
*/
const initCronJobs = (message) => {
  for (const task in tasks) {
    const pointInTime = tasks[task]

    cron.schedule(pointInTime, () => {
      bot.sendMessage(
        message.chat.id,
        `+++ Erinnerung +++ %0A%0A${task} muss erledigt werden`)
    })
  }
}
