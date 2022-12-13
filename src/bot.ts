import { Telegraf } from 'telegraf'
import { Keyboard, Key  } from 'telegram-keyboard'
import Rememo from './rememo'
import * as dotenv from 'dotenv'
dotenv.config()


const rememo = new Rememo();

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');
bot.start((ctx) => ctx.reply('Ciao'));

bot.command('flag', async (ctx) => {
    await ctx.reply(rememo.flag() ? 'Flagged' : 'No word selected');
})

bot.command('reload', async (ctx) => {
    rememo.reload();
    await ctx.reply('Reloaded');
})

bot.command('load', (ctx) => {
    const nextWords = rememo.nextToLoad(10);
    const keyboard = Keyboard.make([
        ...nextWords.map(s => Key.callback(s.tr, s.index.toString())),
        Key.callback('Load all', nextWords.map(w => w.index.toString()).join(','))
    ], {
        columns: 2
    } as any).inline()

    return ctx.reply('Inline Keyboard', keyboard)
})

bot.on('callback_query', async (ctx) => {
    const set = ctx.callbackQuery.data;
    const indexes = set?.split(',').map(s => parseInt(s)) ?? [];
    await ctx.answerCbQuery(set);

    rememo.loadWords(indexes);
    await ctx.reply(`Loaded ${indexes.length} words`);
})

bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim().toLowerCase();

    let [next, reply] = rememo.handleAnswer(text);
    
    if (next) {
        reply += `\n\n${rememo.nextWord()}`;
    }
    
    await ctx.reply(reply, { parse_mode: 'HTML' });
    rememo.updateFile();
})


bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot started')
