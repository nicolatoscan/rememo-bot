import fs from 'fs';

const duolingo: any[] = fs
    .readFileSync('data/se.txt', 'utf8')
    .split('\n')
    .map(l => l.split(';').map(s => s.trim()))
    .map((data, i) => ({ or: data[0], tr: data[1], points: 0.5, known: !!data[2], index: i }));

const oldData = JSON.parse(fs.readFileSync('data/se.json', 'utf8'));

duolingo.forEach((w, i) => {
    const oldWord = oldData.find((w: any) => w.index === i);
    if (oldWord.points)         w.points = oldWord.points;
    if (oldWord.known)          w.known = oldWord.known;
    if (oldWord.lastCorrect)    w.lastCorrect = oldWord.lastCorrect;
});

fs.writeFileSync('data/se.json', JSON.stringify(duolingo, null, 2));