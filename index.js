const PouchDB = require('pouchdb')
const telegramBot = require('node-telegram-bot-api')
require('dotenv').config()

const { initTaskJobs, getTaskAnswers } = require('./tasks.js')
const { checkCalendar } = require('./calendar.js')

const localDb = new PouchDB('domas')
const remoteDB = new PouchDB(`${process.env.COUCH_URL}/domas`)
// The remote database will not be created until you do an API call, e.g.: db.info().
// The reason behind that is that the PouchDB constructor is completely synchronous, for ease of error handling.
remoteDB.info()

const token = process.env.BOT_TOKEN
const bot = new telegramBot(token, { polling: true })

bot.onText(/\/start/, (msg, match) => {

  syncDbs()

  bot.sendMessage(
    msg.chat.id,
    'Hallo Domas!'
  ).then(() => {
    // uncomment this to activate task-alarms
    // TODO Need to adapt the pointInTime for each task
    // initTaskJobs({ chatId: message.chat.id, bot })

    checkCalendar({ bot, chatId: msg.chat.id })

    // type @DomatoBot
    bot.on('inline_query', (query) => {
      /*
      show all available tasks
      and show success message on click
      */
      const results = getTaskAnswers()
      bot.answerInlineQuery(query.id, results)
    })

    /*
    on selected task -> increase score and update doma-human
    */
    bot.on('chosen_inline_result', (query) => {
      const [taskName, score] = query.result_id.split('/')
      const id = String(query.from.id)

      // update domaDoc
      localDb.get(id).then(doc => {
        const updatedHuman = {
          ...doc,
          scores: doc.scores + Number(score),
          tasks: updatedTasks(doc.tasks, taskName),
          updatedAt: new Date().toISOString()
        }
        return localDb.put(updatedHuman).then().catch(error => console.log('Could not update human', error))
      }).catch(error => {
        // Human does a task for the first time -> create domaDoc
        if (error.status === 404) {
          return localDb.put({
            _id: id,
            name: query.from.first_name,
            tasks: [taskName],
            scores: score,
            createdAt: new Date().toISOString()
          }).then().catch(error => console.log('Could not create human', error))
        } else {
          console.log('Could not get human', error)
        }
      })
    })

    /*
    type '/domas' to list all domas with scores
    */
    bot.onText(/\/domas/,(message, match) => {
      // get all domas
      localDb.allDocs({
        include_docs: true
      }).then(function(result) {
        const domasList = getListOfDomasWithScores(result)

        bot.sendMessage(message.chat.id, domasList)
      })
    })
  }).catch(error => {
    bot.sendMessage(msg.chat.id, `Möp möp! ${error}`)
  })
})

const syncDbs = () => {
  localDb.sync(remoteDB, {
    live: true,
    include_docs: true,
    retry: true
  })
  // .on('change', change => console.log(change, 'changed!'))
  // .on('paused', info => console.log('replication paused.'))
  // .on('active', info => console.log('replication resumed.', info))
  // .on('denied', info => console.log('+++ DENIED +++', info))
  .on('error', err => console.log('+++ ERROR ERROR ERROR +++.', err))
}

const updatedTasks = (docTasks = [], taskName) => {
  const updatedTasks = []
  if(!docTasks.includes(taskName)) {
    updatedTasks.push(taskName)
  }
  return updatedTasks
}

const getListOfDomasWithScores = (result) => {
  let markdownDomas = ''
  result.rows.forEach(human => {
    markdownDomas += `${human.doc.name}: ${human.doc.scores} Punkte\n\r`
  })
  return markdownDomas
}
