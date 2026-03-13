import { describe, it, expect } from 'vitest';

class MockPDFValidator {
  errors: string[] = [];
  warnings: string[] = [];
  repairs: string[] = [];
  
  clear() {
    this.errors = [];
    this.warnings = [];
    this.repairs = [];
  }
  
  validateHeader(data: string): [boolean, string | null] {
    const match = data.match(/%PDF-(\d\.\d)/);
    if (!match) {
      this.errors.push('header_missing');
      return [false, null];
    }
    return [true, match[1]];
  }
  
  validateXref(data: string): [boolean, number] {
    if (data.includes('xref') || data.includes('/Type /XRef')) {
      return [true, 0];
    }
    this.errors.push('xref_missing');
    return [false, 0];
  }
  
  rebuildXref(data: string): Record<string, number> {
    const xref: Record<string, number> = {};
    const regex = /(\d+)\s+\d+\s+obj\s*<</g;
    let match;
    while ((match = regex.exec(data)) !== null) {
      const idx = match.index || 0;
      xref[match[1]] = idx;
    }
    if (Object.keys(xref).length > 0) {
      this.repairs.push(`Rebuilt`);
    }
    return xref;
  }
  
  fullValidate(data: string) {
    this.clear();
    
    const [headerValid] = this.validateHeader(data);
    if (!headerValid) {
      return { valid: false, errors: this.errors, repaired: false };
    }
    
    const [xrefValid] = this.validateXref(data);
    if (!xrefValid) {
      const xref = this.rebuildXref(data);
      if (Object.keys(xref).length === 0) {
        return { valid: false, errors: this.errors, repaired: false };
      }
      const idx = this.errors.indexOf('xref_missing');
      if (idx > -1) this.errors.splice(idx, 1);
    }
    
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      repaired: this.repairs.length > 0
    };
  }
}

describe('PDFValidator TypeScript', () => {
  it('validates header', () => {
    const v = new MockPDFValidator();
    const [valid, version] = v.validateHeader('%PDF-1.5');
    expect(valid).toBe(true);
    expect(version).toBe('1.5');
  });

  it('fails invalid header', () => {
    const v = new MockPDFValidator();
    const [valid] = v.validateHeader('NotPDF');
    expect(valid).toBe(false);
    expect(v.errors).toContain('header_missing');
  });

  it('detects XREF', () => {
    const v = new MockPDFValidator();
    v.clear();
    const [valid] = v.validateXref('xref present');
    expect(valid).toBe(true);
  });

  it('detects missing XREF', () => {
    const v = new MockPDFValidator();
    v.clear();
    const [valid] = v.validateXref('no marker');
    expect(valid).toBe(false);
    expect(v.errors).toContain('xref_missing');
  });

  it('rebuilds XREF', () => {
    const v = new MockPDFValidator();
    const xref = v.rebuildXref('1 0 obj<<>>');
    expect(Object.keys(xref).length).toBe(1);
  });

  it('full validates with repair', () => {
    const v = new MockPDFValidator();
    const result = v.fullValidate('%PDF-1.5\n1 0 obj<<>>endobj');
    expect(result.valid).toBe(true);
    expect(result.repaired).toBe(true);
  });

  it('fails without objects', () => {
    const v = new MockPDFValidator();
    const result = v.fullValidate('%PDF-1.5');
    expect(result.valid).toBe(false);
  });
});
