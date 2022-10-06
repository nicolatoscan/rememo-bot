import { Telegraf } from 'telegraf'
import fs from 'fs'	
import * as dotenv from 'dotenv'
dotenv.config()

const FILE_PATH = 'data/words.json'
const FILE_PATH_FLAGS = 'data/flags.logs'

type Word = { en: string, se: string[], points : number, known: boolean }

let words: Word[] = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'))

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');
bot.start((ctx) => ctx.reply('Ciao'));

bot.command('all', async (ctx) => {
    const ws = words.filter(w => w.known).sort(w => -w.points);

    const chunkSize = 100;
    for (let i = 0; i < ws.length; i += chunkSize) {
        const chunk = ws.slice(i, i + chunkSize);
        await ctx.reply(
            chunk
            .map(w => `${w.en} | ${w.se.join(', ')} | ${w.points}`)
            .join('\n')
            );
    }
})

bot.command('flag', async (ctx) => {
    if (currentWord) {
        fs.appendFileSync(FILE_PATH_FLAGS, `${currentWord?.en}\n`)
        await ctx.reply(`${currentWord?.en} flagged`);
    } else {
        await ctx.reply('No word selected');
    }

})

bot.command('reload', async (ctx) => {
    words = JSON.parse(fs.readFileSync('words.txt', 'utf8'))
    await ctx.reply('Reloaded');
})

let currentWord: Word | null =  null;
bot.on('text', async (ctx) => {
    
    if (currentWord !== null) {
        const text = ctx.message.text.trim().toLowerCase();
        if (currentWord?.se.includes(text)) {
            currentWord.points += (1 - currentWord.points) / 2;
            await ctx.reply(`🟩 Correct!\n${currentWord.points} Points`);
        } else {
            currentWord.points /= 2;
            if (text === 'dc') {
                await ctx.reply(`🟨 All correct answers are:\n<code>${currentWord?.se.join(', ')}</code>`, { parse_mode: 'HTML' });
            } else {
                await ctx.reply(`🟥 Wrong!\n${currentWord.points} Points`);
                return;
            }
        }
    }

    currentWord = words.filter(w => w.known).sort(() => Math.random() - 0.5).sort(w => w.points)[0];
    await ctx.reply(`Next word:\n<code>${currentWord?.en}</code>`, { parse_mode: 'HTML' });

    fs.writeFileSync(FILE_PATH, JSON.stringify(words, null, 2));
})


bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
console.log('Bot started')
