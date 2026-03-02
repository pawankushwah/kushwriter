import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanText = (text) => text.replace(/\n+/g, ' ').replace(/"/g, '\\"').replace(/\\/g, '\\\\').trim();

async function getWikiParagraphs(lang, count, targetLength = 10000) {
   let allItems = [];
   
   for (let i = 0; i < count; i++) {
       let currentContent = "";
       let currentTitle = "";
       
       while (currentContent.length < targetLength) {
           const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&prop=extracts&exintro=1&explaintext=1&grnlimit=10`;
           
           try {
               const res = await fetch(url);
               const data = await res.json();
               
               if (!data || !data.query || !data.query.pages) continue;
               
               const pages = Object.values(data.query.pages)
                  .map(p => ({ title: p.title, content: p.extract }))
                  .filter(p => p.content && p.content.length > 50);
               
               for (const p of pages) {
                   if (!currentTitle) currentTitle = p.title;
                   currentContent += " " + p.content;
                   if (currentContent.length >= targetLength) break;
               }
           } catch (e) {
               console.error("API error, retrying...");
           }
       }
       
       allItems.push({ title: currentTitle, content: currentContent.trim() });
       console.log(`Generated item ${i+1}/${count} for ${lang} (${currentContent.length} chars)`);
   }
   
   return allItems;
}

async function main() {
   // Generate very long paragraphs
   console.log('Fetching 50 long English paragraphs...');
   const enParas = await getWikiParagraphs('en', 50);

   console.log('Fetching 50 long Hindi paragraphs...');
   const hiParas = await getWikiParagraphs('hi', 50);

   const engStr = enParas.map((p, i) => `   {
      id: 'eng-${i+1}',
      title: "${cleanText(p.title)}",
      content: "${cleanText(p.content.substring(0, 15000))}",
      isCustom: false
   }`).join(',\n');

   const hinStr = hiParas.map((p, i) => `   {
      id: 'hin-${i+1}',
      title: "${cleanText(p.title)}",
      content: "${cleanText(p.content.substring(0, 15000))}",
      isCustom: false
   }`).join(',\n');

   const fileContent = `import type { Paragraph } from '../components/ParagraphManager';

export const ENGLISH_PARAGRAPHS: Paragraph[] = [
${engStr}
];

export const HINDI_INSCRIPT_PARAGRAPHS: Paragraph[] = [
${hinStr}
];

export const HINDI_REMINGTON_PARAGRAPHS: Paragraph[] = [
${hinStr}
];

export const getParagraphsByLanguage = (language: string): Paragraph[] => {
   switch (language) {
      case 'hindi-inscript':
         return HINDI_INSCRIPT_PARAGRAPHS;
      case 'hindi-remington':
         return HINDI_REMINGTON_PARAGRAPHS;
      case 'english':
      default:
         return ENGLISH_PARAGRAPHS;
   }
};
`;

   fs.writeFileSync(path.join(__dirname, '../src/data/paragraphs.ts'), fileContent, 'utf8');
   console.log('Successfully updated src/data/paragraphs.ts with extremely long paragraphs!');
}

main().catch(console.error);
