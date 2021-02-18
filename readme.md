# Doma Bot
A [Telegram bot](https://core.telegram.org/bots) for managing tasks at doma.
Bots are third-party applications that run inside Telegram. Users can interact with bots by sending them messages, commands and inline requests. You control your bots using HTTPS requests to the [Telegram Bot API](https://core.telegram.org/bots/api).

It checks every day at 5 am whether a garbage can is picked up the next day.
It also offers the opportunity to track work and get points for it.

This bot uses [Apache CouchDB](https://couchdb.apache.org/) and [pouchdb](https://pouchdb.com/) to store the data.

## Usage
1. Add @DomatoBot to your telegram group (Hofgezwitscher)
2. Type `/start` to activate the bot
3. Type `@DomatoBot` and he bot will show you a list of available tasks.
4. Pick one and you will get scores for it
   
Type `/domas` to see a list of domapeeps who have done tasks and their scores 

## Development
1. BOT_TOKEN -> .env
2. COUCH_URL -> .env

## Doma-peeps Model
```
{
  "type": "human",
  "name": "Jacoba",
  "scores": 5,          // earned scores
  "tasks": ["heizen"]   // list of tasks, the person has done
}
```

## TODO
- [ ] **deployment**
- [ ] /help
- [x] /domas
    shows summary
- [x] automatically show reminder for garbage collection

