
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx)=>{
 ctx.reply('Launch ZeroStars',{
  reply_markup:{
   inline_keyboard:[[{
    text:'🚀 Open App',
    web_app:{url:'https://your-domain.com'}
   }]]
  }
 });
});

bot.launch();
