# Doma Bot as a reminder for tasks

## Deployed with Now
Website: (https://zeit.co/now)[https://zeit.co/now]
As a rule of thumb, telegram bots are deployed over SSL, which now provides. Now is a platform which allows you to host your node applications with ease. You can head over to Zeit.co if you want to know more about Now. Now we'll install one last package in our project.

npm install -g now, this command installs the now CLI package. When the installation is done, we can take our application to the cloud by just typing now in our terminal. When the installation is done, we'll be provided a URL which will be used to create our webhook using cURL like so:

```
curl -F "url=https://URL_FROM_NOW/start_bot" https://api.telegram.org/botYOUR_TELEGRAM_API_TOKEN/setWebhook
```

If successful, you should get this JSON response:
```
{
  "ok":true,
  "result":true,
  "description":"Webhook was set"
}
```
## Req
- [ ] /help
- [ ] /ich
    add scores --> couch/firebase?
- [ ] /done task
    other tasks ,
    add scores --> couch/firebase?
- [ ] /show
    shows summary
