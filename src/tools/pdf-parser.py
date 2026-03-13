"""
Python PDF Parser - Fix regex patterns
"""
import re
import zlib
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class PDFObject:
    id: int
    generation: int
    type: Optional[str]
    content: str

class PDFParserRegression:
    """PDF parser matching TypeScript implementation"""
    
    def __init__(self):
        self.raw: str = ''
        self.objects: Dict[int, PDFObject] = {}
        self.header: Optional[Dict] = None
        self.trailer: Optional[Dict] = None
    
    def parse(self, input_data: str) -> bool:
        self.raw = input_data
        
        # Parse header
        header_match = re.search(r'%PDF-(\d\.\d)', input_data)
        if not header_match:
            return False
        
        self.header = {'version': header_match.group(1)}
        
        # Parse objects - match TypeScript: '(\\d+)\\s+(\\d+)\\s+obj\\s*<<(.*?)>>'
        obj_pattern = r'(\d+)\s+(\d+)\s+obj\s*<<(.*?)>>\s*endobj'
        for match in re.finditer(obj_pattern, input_data, re.DOTALL):
            obj_id = int(match.group(1))
            gen = int(match.group(2))
            content = match.group(3).strip()
            
            # Extract type: /Type\s+/\w+
            type_match = re.search(r'/Type\s+/([A-Za-z]+)', content)
            obj_type = type_match.group(1) if type_match else None
            
            self.objects[obj_id] = PDFObject(
                id=obj_id, generation=gen, type=obj_type, content=content
            )
        
        # Parse trailer - simplified to match TypeScript
        trailer_match = re.search(r'trailer\s*<<(.+?)>>', input_data, re.DOTALL)
        if trailer_match:
            trailer_content = trailer_match.group(1)
            size_match = re.search(r'/Size\s+(\d+)', trailer_content)
            root_match = re.search(r'/Root\s+(\d+)\s+(\d+)\s+R', trailer_content)
            
            self.trailer = {
                'size': int(size_match.group(1)) if size_match else 0,
                'root': f"{root_match.group(1)} {root_match.group(2)}" if root_match else ''
            }
        
        return True
    
    def get_header(self): return self.header
    def get_object(self, obj_id): return self.objects.get(obj_id)
    def get_all_objects(self): return list(self.objects.values())
    def get_trailer(self): return self.trailer
    def is_valid(self): return self.header is not None and len(self.objects) > 0
    
    def extract_text_streams(self, data: bytes) -> List[str]:
        texts = []
        pattern = re.compile(b'stream\s*\r?\n(.+?)\s*endstream', re.DOTALL)
        
        for match in pattern.finditer(data):
            try:
                decompressed = zlib.decompress(match.group(1))
                for block in re.findall(b'BT(.+?)ET', decompressed, re.DOTALL):
                    for txt in re.findall(b'\(([^)]+)\)', block):
                        decoded = txt.decode('utf-8', errors='ignore')
                        if len(decoded) > 3:
                            texts.append(decoded)
            except:
                pass
        return texts

def test_parser():
    parser = PDFParserRegression()
    
    sample = """%PDF-1.5
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
trailer
<<
/Size 4
/Root 1 0 R
>>"""
    
    result = parser.parse(sample)
    assert result == True, "Parse should succeed"
    assert parser.get_header()['version'] == '1.5', "Version should be 1.5"
    assert len(parser.get_all_objects()) >= 1, "Should find objects"
    assert parser.get_trailer()['size'] == 4, "Trailer size should be 4"
    assert parser.is_valid(), "Should be valid"
    
    print("✓ All TypeScript-compatible tests passed")
    return True

if __name__ == "__main__":
    test_parser()
