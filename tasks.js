const cron = require('node-cron')
const tasks = require('./tasks.json')

/*
* second 0-59 | optional
* minute 0-59
* hour 0-23
* dayOfMonth 1-31
* month 1-12
* dayOfWeek 0-7
*/
const initTaskJobs = ({ chatId, bot }) => {
  tasks.forEach(task => {
    cron.schedule(task.pointInTime, () => {
      bot.sendMessage(
        chatId,
        `+++ Erinnerung +++ \n\r${task.name} muss erledigt werden`)
    })
  })
}

const getTaskAnswers = () => {
  return tasks.map(task => {
    return {
      type: 'article',
      id: `${task.name}/${task.scores}`,
      title: task.name,
      input_message_content: {
        message_text: `hat ${task.name} erledigt und bekommt ${task.scores} Punkte`,
        disable_web_page_preview: true
      }
    }
  })
}

module.exports = { initTaskJobs, getTaskAnswers }