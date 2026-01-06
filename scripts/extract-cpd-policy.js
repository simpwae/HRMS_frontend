import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const pdfPath = path.resolve('New folder', 'Notification CPD Courses Policy (2).pdf');
const outPath = path.resolve('New folder', 'Notification CPD Courses Policy (2).txt');

async function run() {
  if (!existsSync(pdfPath)) {
    console.error('PDF not found at', pdfPath);
    process.exit(1);
  }

  const dataBuffer = readFileSync(pdfPath);
  const result = await pdf(dataBuffer);

  const dir = path.dirname(outPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(outPath, result.text || '', 'utf8');
  console.log('Extracted text to', outPath);
}

run().catch((err) => {
  console.error('Failed to extract CPD policy:', err);
  process.exit(1);
});
