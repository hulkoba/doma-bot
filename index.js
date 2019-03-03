const telegramBot = require('node-telegram-bot-api')
const cron = require("node-cron")
const env = require('now-env')

const tasks = require('./tasks.json')
const token = process.env.BOT_TOKEN

const options = {
  webHook: {
    // Just use 443 directly
    port: 443
  }
};
const bot = new telegramBot(token, options)
bot.setWebHook(`https://doma-bot-jxxc0abhi.now.sh/bot${token}`)

bot.onText(/\/init/,(msg, match)=>{
  bot.sendMessage(
    msg.chat.id,
    'I am alive!'
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
console.log('hello', bot)
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
