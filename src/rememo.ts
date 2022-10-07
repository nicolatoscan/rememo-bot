import fs from 'fs'


export type Word = {
    en: string,
    se: string[],
    points : number,
    known: boolean,
    category: string,
}

export default class Rememo {
    private readonly FILE_PATH = 'data/words.json'
    private readonly FILE_PATH_FLAGS = 'data/flags.logs'

    private allWords: Word[] = [];
    private words: Word[] = [];
    private currentWord: Word | null =  null;

    constructor() {
        this.reload();
    }

    private check(text: string): boolean {
        return this.currentWord?.se.includes(text) ?? false;
    }

    public reload() {
        this.allWords = JSON.parse(fs.readFileSync(this.FILE_PATH, 'utf8'));
        this.words = this.allWords.filter(w => w.known);
        this.currentWord = null;
    }

    public setSet(set: string | null): void {
        if (set) {
            this.words = this.allWords.filter(w => w.category === set);
        } else {
            this.words = this.allWords.filter(w => w.known);
        }
    }

    public getSets(): string[] {
        return [...new Set(this.allWords.map(w => w.category))].sort();
    }

    public flag(): boolean {
        if (this.currentWord) {
            fs.appendFileSync(this.FILE_PATH_FLAGS, `${this.currentWord?.en}\n`);
            return true;
        }
        return false;
    }

    public nextWord(): string {
        this.currentWord = this.words
                                .sort(() => Math.random() - .5)
                                .reduce((prev, curr) => prev.points < curr.points ? prev : curr);
        return `Next word [${this.currentWord.points}]:\n<code>${this.currentWord.en}</code>`;
    }

    public handleAnswer(text: string): [boolean, string] {
        const replyText = '';
        if (this.currentWord) {
            if (this.check(text)) {
                this.currentWord.points += (1 - this.currentWord.points) / 2;
                return [ true, `🟩 Correct!\n<code>${this.currentWord?.se.join(', ')}</code>` ];
            } else {
                this.currentWord.points /= 2;

                if (text === 'dc') {
                    return [true, `🟨 All correct answers are:\n<code>${this.currentWord?.se.join(', ')}</code>`];
                } else {
                    return [false, '🟥 Wrong!'];
                }
            }
        }
        return [false, 'No set selected'];
    }

    public updateFile(): void {
        fs.writeFileSync(this.FILE_PATH, JSON.stringify(this.allWords, null, 2));
    }

}

// bot.command('all', async (ctx) => {
//     const ws = words.filter(w => w.known).sort(w => -w.points);

//     const chunkSize = 100;
//     for (let i = 0; i < ws.length; i += chunkSize) {
//         const chunk = ws.slice(i, i + chunkSize);
//         await ctx.reply(
//             chunk
//             .map(w => `${w.en} | ${w.se.join(', ')} | ${w.points}`)
//             .join('\n')
//             );
//     }
// })