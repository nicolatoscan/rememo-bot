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

bot.command('set', (ctx) => {
    const keyboard = Keyboard.make([
        Key.callback('All', 'All'),
        ...rememo.getSets().map(s => Key.callback(s, s))
    ], {
        columns: 2
    } as any).inline()

    return ctx.reply('Inline Keyboard', keyboard)
})

bot.command('1000', async (ctx) => {
    const r1 = rememo.addFrom1000(5);
    await ctx.reply(r1);

    rememo.setSet('1000');

    const r2 = rememo.nextWord();
    await ctx.reply(r2, { parse_mode: 'HTML' });
})

bot.on('callback_query', async (ctx) => {
    const set = ctx.callbackQuery.data;
    rememo.setSet(!set || set === 'All' ? null : set);
    await ctx.answerCbQuery(set);

    const reply = rememo.nextWord();
    await ctx.reply(reply, { parse_mode: 'HTML' });
})

bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim().toLowerCase();

    const [next, reply] = rememo.handleAnswer(text);
    await ctx.reply(reply, { parse_mode: 'HTML' });

    if (next) {
        const reply = rememo.nextWord();
        await ctx.reply(reply, { parse_mode: 'HTML' });
    }

    rememo.updateFile();
})


bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot started')
