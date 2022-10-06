import { Telegraf } from 'telegraf'
import fs from 'fs'	
import * as dotenv from 'dotenv'
dotenv.config()

type Word = { word: string, translation: string }

const words: Word[] = fs.readFileSync('words.txt', 'utf8').split('\n').map(l => l.split('|')).map(l => ({ word: l[1], translation: l[0] }));

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');
bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));


let currentWord: Word | null =  null;
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim().toLowerCase();

    if (currentWord === null) {
        currentWord = words[Math.floor(Math.random() * words.length)];
        await ctx.reply(`Next word:\n${currentWord?.word}`);
        return;
    }

    if (text === currentWord?.translation.toLowerCase() || text === 'dc') {
        await ctx.reply(text === 'dc' ? `🟨 The correct answer was:\n${currentWord?.translation}` : '🟩 Correct!');
        
        currentWord = null;
        currentWord = words[Math.floor(Math.random() * words.length)];
        await ctx.reply(`Next word:\n${currentWord?.word}`);
    } else {
        await ctx.reply('🟥 Wrong!');
    }

})



bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot started')
