import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const pdfPath = './docs/AeC RAG.pdf';
const outputPath = './docs/knowledge.txt';

async function extractText() {
    console.log('Iniciando extração de texto do PDF (Versão Classic)...');
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        
        console.log(`Extração concluída! Total de páginas: ${data.numpages}`);
        
        // Basic cleaning
        const cleanText = data.text
            .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
            .replace(/\t/g, ' ')       // Remove tabs
            .trim();

        fs.writeFileSync(outputPath, cleanText);
        console.log(`Texto salvo em: ${outputPath}`);
    } catch (error) {
        console.error('Erro ao extrair texto:', error);
    }
}

extractText();
