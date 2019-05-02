const PouchDB = require('pouchdb')
const telegramBot = require('node-telegram-bot-api')
const cron = require("node-cron")
const env = require('dotenv').config()


const token = process.env.BOT_TOKEN
const tasks = require('./tasks.json')

const localDb = new PouchDB('domas')
const remoteDB = new PouchDB(process.env.COUCH_URL)

const bot = new telegramBot(token, { polling: true })

bot.onText(/\/start/,(msg, match) => {
  syncDbs()
  
  bot.sendMessage(
    msg.chat.id,
    'Hello Doma peeps!'
  ).then(() => {
    initCronJobs(msg)
    
    // update domas -> add score
    bot.on("inline_query", (query) => {
      const results = tasks.map(task => {
        return {
          type: "article",
          id: `${task.name}/${task.scores}`,
          title: task.name,
          input_message_content: {
            message_text: `hat ${task.name} erledigt und bekommt ${task.scores} Punkte`,
            disable_web_page_preview: true
          }
        }
      })
      bot.answerInlineQuery(query.id, results)
    })
    
    bot.on("chosen_inline_result", (query) => {
      let [taskName, score] = query.result_id.split('/')
      score = Number(score)
      const id = String(query.from.id)
      
      localDb.get(id).then(doc => {
        const updatedHuman = {
          ...doc,
          scores: doc.scores + score,
          tasks: updatedTasks(doc.tasks, taskName)
        }
        return localDb.put(updatedHuman).then().catch(error => console.log('DB error', error))
      }).catch(error => {
        console.log('### error', error)
        if(error.status === 404) {
          return localDb.put({
            _id: id,
            name: query.from.first_name,
            tasks: [taskName],
            scores: score
          }).then().catch(error => console.log('DB error', error))
          
        }
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

const updatedTasks = (docTasks = [], taskName) => {
  if(!docTasks.includes(taskName)) {
    docTasks.push(taskName)
  }
  return docTasks
}
