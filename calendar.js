const cron = require('node-cron')
const ical = require('node-ical')

/*
* second 0-59 | optional
* minute 0-59
* hour 0-23
* dayOfMonth 1-31
* month 1-12
* dayOfWeek 0-7
*/

const checkCalendar = ({ bot, chatId }) => {
  // check calendar at 5PM
  cron.schedule('0 0 17 * * *', () => {
    // read calender
    // TODO fetch calendar from http://www.entsorgungsbetrieb-mol.de/de/tourenplan-20202021.html
    const events = ical.sync.parseFile('Abfuhrtermine.ics')
    const today = new Date()

    // dont watch events from the past
    const filteredEvents =  Object.values(events)
      .filter(event => event.type === 'VEVENT')
      .filter(event => event.start.getMonth() >= today.getMonth() && event.start.getDate() >= today.getDate()) // TODO > today.getDate()?
      .map(event => ({ summary: event.summary, date: event.start }))

    for (const event of filteredEvents) {
      // is there an event tomorrow?
      if (isTomorrow({ today, event: event.date })) {
        bot.sendMessage(chatId, `     +++\n\rMorgen wird ${event.summary} abgeholt\n\r     +++`)

        // closes iterator, execution continues outside of the loop
        break;
      }
    }
  })
}

const isTomorrow = ({ today, event}) => {
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  return tomorrow.getDate() === event.getDate() &&
    tomorrow.getMonth() === event.getMonth() &&
    tomorrow.getFullYear() === event.getFullYear()
}

module.exports = { checkCalendar }