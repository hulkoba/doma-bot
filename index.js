const PouchDB = require('pouchdb')
const telegramBot = require('node-telegram-bot-api')
const cron = require("node-cron")
const env = require('dotenv').config()


const token = process.env.BOT_TOKEN
const tasks = require('./tasks.json')

const localDb = new PouchDB('domas')
const remoteDB = new PouchDB(process.env.COUCH_URL)

const bot = new telegramBot(token, { polling: true })
// console.log('### bot', bot)

bot.onText(/\/start/,(msg, match) => {
  syncDbs()
  
  bot.sendMessage(
    msg.chat.id,
    'I am alive!'
  ).then(() => {
    initCronJobs(msg)
    
    // EventListener for /check
    // update domas -> add score
    bot.on("inline_query", (query) => {
      const results = tasks.map((task, index) => {
        return {
          type: "article",
          id: `${task.name}/${task.scores}`,
          title: task.name,
          input_message_content: {
            message_text: `${query.from.first_name} hat ${task.name} erledigt und bekommt ${task.scores} Punkte`,
            disable_web_page_preview: true
          }
        }
      })
      bot.answerInlineQuery(query.id, results)
    })
    
    bot.on("chosen_inline_result", (query) => {
      console.log('### query', query)
      // const [taskName, score] = query.result_id.split['/']
      // const humanTasks = tasks
      // if(!tasks.includes(taskName)) humanTasks.push(taskName)
      
      const domaHuman = {
        _id: String(query.from.id),
        name: query.from.first_name
      }
      console.log('### domaHuman', domaHuman)
      localDb.put(domaHuman).then(response => {
        console.log('### response', response)
      }).catch(error => {
        console.log('DB error', error)
      })
    })
    
    // eventListener for /list
    // get all domas with scores
    bot.onText(/\/list/,(message, match) => {
      // get all domas
      localDb.allDocs({
        include_docs: true
      }).then(function(result) {
        const domas = result.rows.map(c => {
          return {
            name: c.doc.name,
            scores: c.doc.scores
          }
        })
        let markdownDomas = ''
        domas.forEach(u => {
          markdownDomas += `${u.name}: ${u.scores} Punkte\n\r`
        })
        
        bot.sendMessage(
          message.chat.id,
          markdownDomas)
      })
    })
  }).catch(error => {
    bot.sendMessage(msg.chat.id, `Möp möp! ${error}`)
  })
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
  tasks.forEach(task => {
    cron.schedule(task.pointInTime, () => {
      bot.sendMessage(
        message.chat.id,
        `+++ Erinnerung +++ \n\r${task.name} muss erledigt werden`)
    })
  })
}

const syncDbs = () => {
  localDb.sync(remoteDB, {
    live: true,
    include_docs: true,
    retry: true
  })
  .on('change', change => console.log(change, 'changed!'))
  .on('paused', info => console.log('replication paused.'))
  .on('active', info => console.log('replication resumed.'))
  .on('denied', info => console.log('+++ DENIED +++', info))
  .on('error', err => console.log('+++ ERROR ERROR ERROR +++.', err))
}
