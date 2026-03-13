import { describe, it, expect } from 'vitest';
import { PDFParser } from './pdf-parser';

describe('PDFParser', () => {
  const samplePDF = `%PDF-1.7
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/MediaBox [0 0 612 792]
>>
endobj
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
0
%%EOF`;

  it('should parse PDF header', () => {
    const parser = new PDFParser();
    const result = parser.parse(samplePDF);
    
    expect(result).toBe(true);
    expect(parser.getHeader()?.version).toBe('1.7');
  });

  it('should extract objects', () => {
    const parser = new PDFParser();
    parser.parse(samplePDF);
    
    const objects = parser.getAllObjects();
    expect(objects.length).toBeGreaterThan(0);
    
    const catalog = parser.getObject(1);
    expect(catalog).toBeDefined();
    expect(catalog?.type).toBe('Catalog');
  });

  it('should parse trailer', () => {
    const parser = new PDFParser();
    parser.parse(samplePDF);
    
    const trailer = parser.getTrailer();
    expect(trailer).toBeDefined();
    expect(trailer?.size).toBe(4);
    expect(trailer?.root).toBe('1 0');
  });

  it('should validate PDF', () => {
    const parser = new PDFParser();
    parser.parse(samplePDF);
    
    expect(parser.isValid()).toBe(true);
  });

  it('should handle empty input', () => {
    const parser = new PDFParser();
    const result = parser.parse('');
    
    expect(result).toBe(false);
    expect(parser.isValid()).toBe(false);
  });
});
