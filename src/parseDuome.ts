import { parse } from 'node-html-parser';
import axios from 'axios';
import fs from 'fs';

type Word = { en: string, se: string[], points : number, known: boolean }

async function getHtml() {
    const pastWords = JSON.parse(fs.readFileSync('data/words.json', 'utf8')) as Word[];
    const translations = fs.readFileSync('data/words.txt', 'utf8').toLowerCase().split('\n');
    const points: { [id: string]: number } = {}
    for (const pW of pastWords) {
        points[pW.en] = pW.points;
    }

    const data = (await axios.get('https://duome.eu/vocabulary/en/sv/361457804')).data
    const html = parse(data);
    const words = html
                    .querySelectorAll('#words ul.list li')
                    .filter(li => li.classNames.indexOf('single') === -1)
                    .map((li, i) => ({
                        se: li.querySelector('.wA')?.text ?? '',
                        known: li.querySelectorAll('a').length > 0,
                        category: li.querySelectorAll('.work')[0].getAttribute('title'),
                        en: translations[i],
                        points: 0,
                    }));

    const wDict: { [id: string]: Word } = {};
    for (const w of words) {
        if (wDict[w.en] === undefined) {
            wDict[w.en] = { en: w.en, se: [], points: points[w.en] ?? 0, known: w.known };
        }
        wDict[w.en].se.push(w.se);
        wDict[w.en].known = wDict[w.en].known && w.known;
    }
    const resWords = Object.values(wDict).sort((a, b) => a.en.localeCompare(b.en));
    fs.writeFileSync('data/words.json', JSON.stringify(resWords, null, 2));
}

getHtml()