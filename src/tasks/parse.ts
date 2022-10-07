import fs from 'fs'	

type Word = { se: string, en: string }


let words: Word[] = fs.readFileSync('words_or.txt', 'utf8')
                        .split('\n')
                        .map(l => l.split('|'))
                        .map(l => ({ se: l[0].toLowerCase(), en: l[1].toLowerCase() }))
words = words.filter((w, i) => words.findIndex(x => x.se === w.se) === i)

const ingles: { [id: string]: string[] } = {}


for (const word of words) {
    if (ingles[word.en] === undefined) {
        ingles[word.en] = []
    }
    ingles[word.en].push(word.se)
}

const res = Object.entries(ingles).map(([key, value]) => `${key}|${value.join(',')}|0`).join('\n')
fs.writeFileSync('words.txt', res);



