import fs from 'fs'


export type Word = {
    en: string,
    se: string[],
    points: number,
    known: boolean,
    category: string,
}

export default class Rememo {
    private readonly FILE_PATH = 'data/words.json'
    private readonly FILE_PATH_FLAGS = 'data/flags.logs'

    private allWords: Word[] = [];
    private words: Word[] = [];
    private currentWord: Word | null = null;

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
            this.words = this.allWords.filter(w =>
                (w.category === set) && (set !== '1000' || w.known)
            );
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

    private pickCurrentWord(): void {
        this.currentWord = this.words[0];
        for (let i = 1; i < this.words.length; i++) {
            if (this.words[i].points < this.currentWord.points) {
                this.currentWord = this.words[i];
            }
            else if (this.words[i].points === this.currentWord.points) {
                if (Math.random() > .5) {
                    this.currentWord = this.words[i];
                }
            }
        }
    }

    public nextWord(): string {
        this.pickCurrentWord();
        return `Next word [${this.currentWord!.points}]:\n<code>${this.currentWord!.en}</code>`;
    }

    public addFrom1000(n: number): string {
        const words = fs.readFileSync('data/1000words.txt', 'utf8')
            .toLowerCase()
            .split('\n')
            .map(l => l.split(','))
            .map(([se, en]) => ({ en, se }));;

        let taken: string[] = [];
        for (const w of words) {
            const found = this.allWords.find(w2 => w2.en === w.en);
            if (found && !found.known && found.category === '1000') {
                found.known = true;
                taken.push(`${w.en} -> ${w.se}`);
            }

            if (taken.length >= n) {
                break;
            }
        }

        this.updateFile();
        this.reload();

        return `Added words:\n${taken.join('\n')}`;
    }

    public handleAnswer(text: string): [boolean, string] {
        const replyText = '';
        if (this.currentWord) {
            if (this.check(text)) {
                this.currentWord.points += (1 - this.currentWord.points) / 2;

                if (this.currentWord.points > .66) {
                    this.currentWord.known = true;
                }

                return [true, `🟩 Correct!\n<code>${this.currentWord?.se.join(', ')}</code>`];
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