const telegramBot = require('node-telegram-bot-api')
require('dotenv').config()

const domasDb = require('nano')(`${process.env.COUCH_URL}/domas`)

const { initTaskJobs, getTaskAnswers } = require('./tasks.js')
const { checkCalendar } = require('./calendar.js')

const bot = new telegramBot(process.env.BOT_TOKEN, { polling: true })

bot.onText(/\/start/, (msg, match) => {
  bot.sendMessage(
    msg.chat.id,
    'Hallo Domas!'
  ).then(() => {
    // uncomment this to activate task-alarms
    // TODO Need to adapt the pointInTime for each task
    // initTaskJobs({ chatId: message.chat.id, bot })

    // This checks the local waste calendar
    checkCalendar({ bot, chatId: msg.chat.id })

    // type @DomatoBot
    bot.on('inline_query', (query) => {
      /*
      show all available tasks
      and show success message on click
      */
      const taskAnswers = getTaskAnswers()
      bot.answerInlineQuery(query.id, taskAnswers)
    })

    /*
    on selected task -> increase score and update doma-human
    */
    bot.on('chosen_inline_result', async query => {
      const [taskName, score] = query.result_id.split('/')
      const id = String(query.from.id)

      let humanDoc
      try {
        // get human from db
        humanDoc = await domasDb.get(id)

        // update tasklist and scores
        const updatedHuman = {
          ...humanDoc,
          scores: Number(humanDoc.scores) + Number(score),
          tasks: getUpdatedTasks(humanDoc.tasks, taskName),
          updatedAt: new Date().toISOString()
        }
        await domasDb.insert(updatedHuman)
      } catch (error) {
        // human does not exist in the database - creates a task for the firt time
        if (error.statusCode === 404) {
          const newHuman = {
            _id: id,
            name: query.from.first_name,
            tasks: [taskName],
            scores: score,
            createdAt: new Date().toISOString()
          }
          await domasDb.insert(newHuman)
        }
        console.log('Could not update human', error)
      }
    })

    /*
    type '/domas' to list all domas with scores
    */
    bot.onText(/\/domas/, async (message, match) => {
      // get all domas
      const allDomas = await domasDb.list({ include_docs: true })
      if (allDomas) {
        const domasAsMarkdownList = getListOfDomasWithScores(allDomas.rows)
        bot.sendMessage(message.chat.id, domasAsMarkdownList)
      }
    })

  }).catch(error => {
    bot.sendMessage(msg.chat.id, `Möp möp! ${error}`)
  })
})

const getUpdatedTasks = (tasks = [], taskName) => {
  const updatedTasks = tasks
  if (!tasks.includes(taskName)) {
    updatedTasks.push(taskName)
  }
  return updatedTasks
}

const getListOfDomasWithScores = (domas) => {
  let markdownDomas = ''
  domas.forEach(human => {
    markdownDomas += `${human.doc.name}: ${human.doc.scores} Punkte\n\r`
  })
  return markdownDomas
}
