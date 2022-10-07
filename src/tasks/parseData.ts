import fs from 'fs';

export type SkillData = {
    title: string;
    learned: boolean;
    words: string[];
};

const data = JSON.parse(fs.readFileSync('data/userdata.json', 'utf8'));
const svData = data['language_data']['sv']['skills'] as { [id: string]: any }[];
const skills: SkillData[] = svData.map((skill) => ({
    title: skill['title'],
    learned: skill['learned'],
    words: skill['words'],
}))
fs.writeFileSync('data/skills.json', JSON.stringify(skills, null, 2));