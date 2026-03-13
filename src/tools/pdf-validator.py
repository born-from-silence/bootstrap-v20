"""PDF Validator - Error operations matching TypeScript implementation"""
import re
import zlib
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class ValidationError(Enum):
    HEADER_MISSING = "header_missing"
    HEADER_INVALID = "header_invalid"
    XREF_MISSING = "xref_missing"
    STREAM_CORRUPT = "stream_corrupt"
    OBJECT_MALFORMED = "object_malformed"

@dataclass
class PDFValidationResult:
    valid: bool
    errors: List[str]
    warnings: List[str]
    repaired: bool

class PDFValidator:
    """Peepdf-style validation with Python-native regex"""
    
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.repairs: List[str] = []
    
    def validate_header(self, data: bytes) -> Tuple[bool, Optional[str]]:
        header_match = re.search(rb'%PDF-(\d\.\d)', data[:1024])
        if not header_match:
            self.errors.append(ValidationError.HEADER_MISSING.value)
            return False, None
        version = header_match.group(1).decode()
        if version not in ['1.3', '1.4', '1.5', '1.6', '1.7']:
            self.warnings.append(f"Unusual PDF version: {version}")
        return True, version
    
    def validate_xref(self, data: bytes) -> Tuple[bool, int]:
        if re.search(rb'xref\s*\n', data) or re.search(rb'/Type\s*/XRef', data):
            return True, 0
        self.errors.append(ValidationError.XREF_MISSING.value)
        return False, 0
    
    def rebuild_xref(self, data: bytes) -> Dict[int, int]:
        xref = {}
        for match in re.finditer(rb'(\d+)\s+(\d+)\s+obj\s*<<', data):
            obj_id = int(match.group(1))
            xref[obj_id] = match.start()
        if xref:
            self.repairs.append(f"Rebuilt xref for {len(xref)} objects")
        return xref
    
    def decode_streams(self, data: bytes, max_streams: int = 5):
        decoded = []
        for i, stream in enumerate(re.finditer(rb'stream\s*\r?\n(.+?)\s*endstream', data, re.DOTALL)):
            if i >= max_streams:
                break
            try:
                decompressed = zlib.decompress(stream.group(1))
                decoded.append((stream.start(), decompressed))
            except Exception as e:
                self.errors.append(f"Stream {i}: {e}")
        return decoded
    
    def detect_corruption(self, data: bytes) -> List[str]:
        issues = []
        if not re.search(rb'%%EOF', data):
            issues.append("Missing EOF")
        if len(re.findall(rb'\x00', data[:10000])) > 100:
            issues.append("Excessive null bytes")
        return issues
    
    def full_validate(self, data: bytes) -> PDFValidationResult:
        self.errors, self.warnings, self.repairs = [], [], []
        
        valid, version = self.validate_header(data)
        if not valid:
            return PDFValidationResult(False, self.errors, self.warnings, False)
        
        xref_valid, _ = self.validate_xref(data)
        if not xref_valid:
            xref = self.rebuild_xref(data)
            if not xref:
                self.errors.append("No xref and rebuild failed")
            else:
                self.errors.remove(ValidationError.XREF_MISSING.value)
        
        self.decode_streams(data[:50000])
        self.warnings.extend(self.detect_corruption(data))
        
        return PDFValidationResult(
            valid=len(self.errors) == 0,
            errors=self.errors,
            warnings=self.warnings,
            repaired=len(self.repairs) > 0
        )


def test_validator():
    validator = PDFValidator()
    
    # Test 1-5: As before
    assert validator.validate_header(b"%PDF-1.5")[0]
    assert validator.validate_xref(b"xref\n0 1")[0]
    assert len(validator.rebuild_xref(b"1 0 obj<<>>")) == 1
    assert len(validator.decode_streams(b"stream\nuncompressed\nendstream")) == 0
    assert len(validator.detect_corruption(b"%PDF-1.5")) == 1  # Missing EOF
    
    # Test 6: Full validation with repair
    validator = PDFValidator()
    sample = b"%PDF-1.5\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj"
    result = validator.full_validate(sample)
    assert result.valid, f"Failed: {result.errors}"
    assert result.repaired, "Should repair xref"
    
    print("✅ All 6 Python validation tests passed")
    return True

if __name__ == "__main__":
    test_validator()
