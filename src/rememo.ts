import fs from 'fs'

export type Word = {
    tr: string,
    or: string,
    points: number,
    known: boolean,
    index: number,
    lastCorrect?: number,
}

export default class Rememo {
    private readonly FILE_PATH = 'data/se.json'
    private readonly FILE_PATH_FLAGS = 'data/flags.logs'

    private allWords: Word[] = [];
    private words: Word[] = [];
    private currentWord: Word | null = null;
    private currentNDone = 0;

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
        this.currentWord = this.words
            .filter(w => !w.lastCorrect || w.lastCorrect <= this.currentNDone - 10)
            .reduce((a, b) => a.points <= b.points ? a : b, { points: 1.1 } as Word);
    }

    public nextWord(): string {
        this.pickCurrentWord();
        return `Next word [${this.currentWord!.points.toPrecision(2)}]: <code>${this.currentWord!.tr}</code>`;
    }

    public handleAnswer(text: string): [boolean, string] {

        if (this.currentWord) {
            if (this.check(text)) {
                const pp = (1 - this.currentWord.points) / 2;
                this.currentWord.points += pp > 0.25 ? 0.25 : pp;

                this.currentWord.lastCorrect = this.currentNDone;
                this.currentNDone++;

                // if (this.currentWord.points > .66) {
                //     this.currentWord.known = true;
                // }

                return [true, `🟩 Correct! [${this.currentWord!.points.toPrecision(2)}]<code>${this.currentWord?.or}</code>`];
            } else {
                this.currentWord.points /= 3;

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
