# Doma Bot
A [Telegram bot](https://core.telegram.org/bots) for managing tasks at doma.
This bot uses [Apache CouchDB](https://couchdb.apache.org/) and [pouchdb](https://pouchdb.com/) to store the data.

## Usage
1. Add @DomatoBot to your telegram group (Hofgezwitscher)
2. Type `/start` to activate the bot
3. Type `@DomatoBot` to mark a task as done. The bot will show you a list of available tasks.
4. Pick one and you will get scores for it
   
Type `/domas` to see a list of domapeeps who have done tasks and their scores 

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
- [x] /list
    shows summary
- [x] /done
    add scores --> couch
- [ ] /done task
    other task
- [ ] Branch: no saving of humans. Only persist, how often a task needs to be done
