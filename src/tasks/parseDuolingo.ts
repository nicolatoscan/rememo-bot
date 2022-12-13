import fs from 'fs';

const duolingo = fs
    .readFileSync('data/se.txt', 'utf8')
    .split('\n')
    .map(l => l.split(';').map(s => s.trim()))
    .map((data, i) => ({ or: data[0], tr: data[1], points: 0, known: !!data[2], index: i }));
fs.writeFileSync('data/se.json', JSON.stringify(duolingo, null, 2));