import { Telegraf } from 'telegraf'
import fs from 'fs'	
import * as dotenv from 'dotenv'
dotenv.config()

type Word = { word: string, translations: string[], points : number }

const words: Word[] = fs.readFileSync('words.txt', 'utf8')
                        .split('\n')
                        .map(l => l.split('|')).map(l => ({
                            word: l[0].toLowerCase(),
                            translations: l[1].toLowerCase().split(','),
                            points: +l[2]
                        }))

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');
bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.command('all', async (ctx) => {
    const ws = words.sort(w => -w.points);

    const chunkSize = 100;
    for (let i = 0; i < ws.length; i += chunkSize) {
        const chunk = ws.slice(i, i + chunkSize);
        await ctx.reply(
            chunk
            .map(w => `${w.word} | ${w.translations.join(', ')} | ${w.points}`)
            .join('\n')
            );
    }
})

bot.command('flag', async (ctx) => {
    if (currentWord) {
        fs.appendFileSync('flag.txt', `${currentWord?.word}\n`)
        await ctx.reply(`${currentWord?.word} flagged`);
    } else {
        await ctx.reply('No word selected');
    }

})

let currentWord: Word | null =  null;
bot.on('text', async (ctx) => {
    
    if (currentWord !== null) {
        const text = ctx.message.text.trim().toLowerCase();
        if (currentWord?.translations.includes(text)) {
            currentWord.points += (1 - currentWord.points) / 2;
            await ctx.reply(`🟩 Correct!\n${currentWord.points} Points`);
        } else {
            currentWord.points /= 2;
            if (text === 'dc') {
                await ctx.reply(`🟨 All correct answers are:\n<code>${currentWord?.translations.join(', ')}</code>`, { parse_mode: 'HTML' });
            } else {
                await ctx.reply(`🟥 Wrong!\n${currentWord.points} Points`);
                return;
            }
        }
    }

    currentWord = words.sort(() => Math.random() - 0.5).sort(w => w.points)[0];
    await ctx.reply(`Next word:\n<code>${currentWord?.word}</code>`, { parse_mode: 'HTML' });

    fs.writeFileSync('words.txt', words.sort(w => w.word).map(w => `${w.word}|${w.translations.join(',')}|${w.points}`).join('\n'));
})



bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot started')
