const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);
const replaceDisallowedWords = require('disallowed-word-filter')
const myFilter = new replaceDisallowedWords({
  additionalWords: 'хуй, похуй, сука, с-у-к-а, п-и-д-о-р, зебо, zebo, Зебо',
})

bot.start((ctx) => ctx.reply('Токсик сразу говорю!'));
bot.help((ctx) => ctx.reply('/start - перезапуск бота'));
bot.launch();


bot.on("message", async (ctx) => {
    try {
        let filter = await myFilter.check(ctx.message.text, true)
        if(filter == true){
            await ctx.tg.deleteMessage(ctx.chat.id, ctx.message.message_id);
            await ctx.replyWithVideo({source: './memeblog-fresco.gif'}, {caption: `🤬 @${ctx.message.from.username}, не матерись! Я тоже могу но я бот...`});
        }else {
            return
        }
    }catch(e) {
        console.error(e);
    } 
})  

bot.on("edited_message", async (ctx) => {
    try {
        let filter = await myFilter.check(ctx.editedMessage.text, true)
        if(filter == true) {
            await ctx.tg.deleteMessage(ctx.editedMessage.chat.id, ctx.editedMessage.message_id);
            await ctx.replyWithVideo({source: './memeblog-fresco.gif'}, {caption: `🤬 @${ctx.editedMessage.from.username}, не матерись! Я тоже могу но я бот...`});
        }else {
            return
        }
    }catch(e) {
        console.error(e);
    }
})




process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));