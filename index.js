const {Telegraf, fmt} = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);
const replaceDisallowedWords = require('disallowed-word-filter')
const myFilter = new replaceDisallowedWords({
  additionalWords: 'сука',
})
const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://Muhammad007:Muhammad007@database.3dodl7a.mongodb.net';
const client = new MongoClient(url);
client.connect();
const db = client.db('bot');
const collection = db.collection('users');
bot.start((ctx) => ctx.reply('Токсик сразу говорю!'));
bot.help((ctx) => ctx.reply('/start - перезапуск бота'));
bot.launch({dropPendingUpdates: true});


bot.command('balance', async ctx => {
    try {
        let res = await collection.findOne({user_name: ctx.message.text.split(' ')[1]});
        if(ctx.message.text.split(' ')[1] == undefined) {
            await ctx.replyWithHTML('Вы не ввели юзернейм участника...\n<i>/balance @username</i>')
        }else if(res == null) {
            await ctx.replyWithHTML(`Мне не удалось найти пользователя под юзернеймом <i>${ctx.message.text.split(' ')[1]}</i> в нашей базе данных...`)
        }else {
            await ctx.reply(`Баланс пользователя ${ctx.message.text.split(' ')[1]} = ${res.balance} тыс сум`)
        }
    }catch(e) {
        console.error(e);
    }
    
})

bot.on("message", async (ctx) => {
    try {
        let filter = await myFilter.check(ctx.message.text, true)
        if(filter == true){
            let res = await collection.findOne({user_id: ctx.message.from.id});
            let sum = res.balance + 5
            await collection.updateOne({user_id: ctx.message.from.id}, {$set: {balance: sum}})
            await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);
            let tomsg = await ctx.reply(`🤬 @${ctx.message.from.username}, не матерись по братский...\n------------------------------\nНалоги за маты: +5тыс сум\nНа вашем балансе теперь: ${sum}тыс сум\nВ общем должны были отдать надзирателю: ${sum}тыс сум\n------------------------------\nТам был следующий текст:`);
            await ctx.reply(`||${ctx.message.text}||`, { parse_mode: 'MarkdownV2', reply_to_message_id: tomsg.message_id})
        }else {
            let result = await collection.findOne({user_id: ctx.message.from.id});
            if(result == null) {
                await collection.insertOne({
                    first_name: ctx.message.from.first_name || 'anonim',
                    last_name: ctx.message.from.last_name || 'anonim',
                    user_name: `@${ctx.message.from.username}` || 'anonim',
                    user_id: ctx.message.from.id,
                    balance: 0
                })
            }else {
                return
            }
        }
    }catch(e) {
        console.error(e);
    } 
})  

bot.on("edited_message", async (ctx) => {
    try {
        let filter = await myFilter.check(ctx.editedMessage.text, true)
        if(filter == true) {
            let res = await collection.findOne({user_id: ctx.message.from.id});
            let sum = await res.balance + 5
            await collection.updateOne({user_id: ctx.message.from.id}, {$set: {balance: sum}})
            await ctx.tg.deleteMessage(ctx.editedMessage.chat.id, ctx.editedMessage.message_id);
            let tomsg = await ctx.reply(`🤬 @${ctx.editedMessage.from.username}, не матерись по братский...\n------------------------------\nНалоги за маты: +5тыс сум\nНа вашем балансе теперь: ${sum}тыс сум\nВ общем должны были отдать надзирателю: ${sum}тыс сум\n------------------------------\nТам был следующий текст:`);
            await ctx.reply(`||${ctx.editedMessage.text}||`, { parse_mode: 'MarkdownV2', reply_to_message_id: tomsg.message_id})
        }else {
            return
        }
    }catch(e) {
        console.error(e);
    }
})






process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));