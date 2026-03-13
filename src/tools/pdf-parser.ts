/**
 * PDF Parser Tool
 */

interface PDFHeader {
  version: string;
}

interface PDFObject {
  id: number;
  generation: number;
  type?: string;
  content: string;
}

interface PDFTrailer {
  size: number;
  root: string;
}

export class PDFParser {
  private raw: string = '';
  private objects: Map<number, PDFObject> = new Map();
  private header?: PDFHeader;
  private trailer?: PDFTrailer;

  parse(input: string): boolean {
    this.raw = input;
    
    const headerMatch = input.match(/%PDF-(\d\.\d)/);
    if (!headerMatch) return false;
    
    this.header = { version: headerMatch[1] };
    
    const objRegex = /(\d+)\s+(\d+)\s+obj([^]*?)endobj/g;
    let match;
    while ((match = objRegex.exec(input)) !== null) {
      const id = parseInt(match[1]);
      const gen = parseInt(match[2]);
      const content = match[3].trim();
      
      // Look for /Type /TypeName pattern
      const typeMatch = content.match(/\/Type\s+\/(\w+)/);
      
      this.objects.set(id, {
        id,
        generation: gen,
        type: typeMatch ? typeMatch[1] : undefined,
        content
      });
    }
    
    const trailerMatch = input.match(/trailer\s*<<([^]*?)>>/ms);
    if (trailerMatch) {
      const trailerContent = trailerMatch[1];
      const sizeMatch = trailerContent.match(/\/Size\s+(\d+)/);
      const rootMatch = trailerContent.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
      
      this.trailer = {
        size: sizeMatch ? parseInt(sizeMatch[1]) : 0,
        root: rootMatch ? `${rootMatch[1]} ${rootMatch[2]}` : ''
      };
    }
    
    return true;
  }

  getHeader(): PDFHeader | undefined { return this.header; }
  getObject(id: number): PDFObject | undefined { return this.objects.get(id); }
  getAllObjects(): PDFObject[] { return Array.from(this.objects.values()); }
  getTrailer(): PDFTrailer | undefined { return this.trailer; }
  isValid(): boolean { return !!this.header && this.objects.size > 0; }
}
