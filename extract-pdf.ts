import { PDFParser } from './src/tools/pdf-parser';
import * as fs from 'fs';

const pdfContent = fs.readFileSync('paper.pdf', 'utf-8');
const parser = new PDFParser();
const result = parser.parse(pdfContent);

console.log('Parse result:', result);
console.log('Header:', parser.getHeader());
console.log('Trailer:', parser.getTrailer());
console.log('Objects found:', parser.getAllObjects().length);
console.log('Objects:', parser.getAllObjects().map(o => ({ id: o.id, type: o.type })));
