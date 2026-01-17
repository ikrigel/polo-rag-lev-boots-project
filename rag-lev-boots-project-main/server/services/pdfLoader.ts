import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PDFData {
  filename: string;
  text: string;
}

/**
 * Extract text from PDF using pdfjs-dist
 */
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<{ text: string; pageCount: number }> {
  // Convert Buffer to Uint8Array (required by pdfjs-dist)
  const uint8Array = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  let text = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => (item.str ? item.str : '')).join('');
    text += pageText + ' ';
  }

  return {
    text: text.trim(),
    pageCount: pdf.numPages,
  };
}

export const loadPDFs = async (): Promise<PDFData[]> => {
  const pdfDirectory = path.join(__dirname, '..', 'knowledge_pdfs');

  if (!fs.existsSync(pdfDirectory)) {
    throw new Error(`PDF directory not found: ${pdfDirectory}`);
  }

  const pdfFiles = fs.readdirSync(pdfDirectory).filter(file => file.endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    throw new Error('No PDF files found in knowledge_pdfs directory');
  }

  const results: PDFData[] = [];

  for (const file of pdfFiles) {
    try {
      const filePath = path.join(pdfDirectory, file);
      const pdfBuffer = fs.readFileSync(filePath);

      // Extract text from PDF
      const { text, pageCount } = await extractTextFromPDF(pdfBuffer);

      results.push({
        filename: file,
        text,
      });

      console.log(`✓ Loaded PDF: ${file} (${pageCount} pages, ${text.length} characters)`);
    } catch (error) {
      console.error(`✗ Error loading PDF ${file}:`, error);
      throw error;
    }
  }

  return results;
};
