import { parse } from 'node-html-parser';
import axios from 'axios';
import fs from 'fs';

type Word = { en: string, se: Set<string>, points : number, known: boolean, category: string }

async function getHtml() {
    const translations = fs.readFileSync('data/words.txt', 'utf8').toLowerCase().split('\n');
    
    // Get olds
    const pastWords = JSON.parse(fs.readFileSync('data/words.json', 'utf8')) as Word[];
    const points: { [id: string]: number } = {}
    const known: { [id: string]: boolean } = {}
    for (const pW of pastWords) {
        points[pW.en] = pW.points;
        known[pW.en] = pW.known;
    }


    // Get duome
    const data = (await axios.get('https://duome.eu/vocabulary/en/sv/361457804')).data
    const html = parse(data);
    const words = html
                    .querySelectorAll('#words ul.list li')
                    .filter(li => li.classNames.indexOf('single') === -1)
                    .map((li, i) => ({
                        se: li.querySelector('.wA')?.text ?? '',
                        known: li.querySelectorAll('a').length > 0,
                        category: li.querySelectorAll('.work')[0].getAttribute('title') ?? '',
                        en: translations[i],
                        points: 0,
                    }));

    // Join
    const wDict: { [id: string]: Word } = {};
    for (const w of words) {
        if (wDict[w.en] === undefined) {
            wDict[w.en] = {
                en: w.en,
                se: new Set(),
                points: points[w.en] ?? 0,
                known: known[w.en] || w.known,
                category: w.category
            };
        }
        wDict[w.en].se.add(w.se);
        wDict[w.en].known = wDict[w.en].known && w.known;
    }


    // ADD 1000
    const w1000 = fs.readFileSync('data/1000words.txt', 'utf8').toLowerCase().split('\n').map(l => l.split(',')).map(([se, en]) => ({ en, se }));
    for (const w of w1000) {
        if (wDict[w.en] === undefined) {
            wDict[w.en] = {
                en: w.en,
                se: new Set(),
                points: points[w.en] ?? 0,
                known: known[w.en] ?? false,
                category: '1000'
            };
        }
        wDict[w.en].se.add(w.se);
    }


    const resWords = Object.values(wDict)
                        .sort((a, b) => a.en.localeCompare(b.en))
                        .map(w => ({ ...w, se: [...w.se].sort() }));
    fs.writeFileSync('data/words.json', JSON.stringify(resWords, null, 2));
}

getHtml()