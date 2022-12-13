import fs from 'fs'


export type Word = {
    tr: string,
    or: string,
    points: number,
    known: boolean,
    index: number,
}

export default class Rememo {
    private readonly FILE_PATH = 'data/se.json'
    private readonly FILE_PATH_FLAGS = 'data/flags.logs'

    private allWords: Word[] = [];
    private words: Word[] = [];
    private currentWord: Word | null = null;

    constructor() {
        this.reload();
    }

    private check(text: string): boolean {
        return this.currentWord?.or.toLocaleLowerCase().trim() === text.toLowerCase().trim();
    }

    public reload() {
        this.allWords = JSON.parse(fs.readFileSync(this.FILE_PATH, 'utf8'));
        this.words = this.allWords.filter(w => w.known);
        this.currentWord = null;
    }

    public flag(): boolean {
        if (this.currentWord) {
            fs.appendFileSync(this.FILE_PATH_FLAGS, `${this.currentWord?.tr}\n`);
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
            // else if (this.words[i].points === this.currentWord.points) {
            //     if (Math.random() > .5) {
            //         this.currentWord = this.words[i];
            //     }
            // }
        }
    }

    public nextWord(): string {
        this.pickCurrentWord();
        return `Next word [${this.currentWord!.points}]: <code>${this.currentWord!.tr}</code>`;
    }

    public handleAnswer(text: string): [boolean, string] {

        if (this.currentWord) {
            if (this.check(text)) {
                this.currentWord.points += (1 - this.currentWord.points) / 2;

                if (this.currentWord.points > .66) {
                    this.currentWord.known = true;
                }

                return [true, `🟩 Correct! <code>${this.currentWord?.or}</code>`];
            } else {
                this.currentWord.points /= 2;

                if (text === 'dc') {
                    return [true, `🟨 All correct answers are:\n<code>${this.currentWord?.or}</code>`];
                } else {
                    return [false, '🟥 Wrong!'];
                }
            }
        }
        return [true, 'Good luck!'];
    }

    public updateFile(): void {
        fs.writeFileSync(this.FILE_PATH, JSON.stringify(this.allWords, null, 2));
    }

    public nextToLoad(n: number): { tr: string, index: number }[] {
        const words = this.allWords.filter(w => !w.known);
        return words.slice(0, n).map(w => ({ tr: w.or, index: w.index }));
    }

    public loadWords(indexes: number[]): void {
        indexes.forEach(i => { this.allWords[i].known = true; });
        this.updateFile();
        this.reload();
    }

}
