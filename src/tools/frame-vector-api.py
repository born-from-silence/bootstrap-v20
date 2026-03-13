"""
Frame Vector API - Python Implementation
For Frame 086 and related frames (45, 4, 46)
"""
from typing import List, Dict, Optional
from dataclasses import dataclass
import json

@dataclass
class FrameVector:
    id: int
    status: str  # 'imgp', 'cached', 'evaluated'
    vector: List[float]
    related: List[int]
    
class FrameVectorAPI:
    def __init__(self):
        self.vector_col: Dict[int, FrameVector] = {}
    
    def insert_frame(self, frame: FrameVector) -> None:
        """Insert frame into vector_col"""
        self.vector_col[frame.id] = frame
    
    def get_related(self, frame_id: int) -> List[int]:
        """Get related frames for given ID"""
        frame = self.vector_col.get(frame_id)
        return frame.related if frame else []
    
    def get_by_status(self, status: str) -> List[FrameVector]:
        """Query by status (imgp, cached, evaluated)"""
        return [f for f in self.vector_col.values() if f.status == status]
    
    def dev_route(self) -> Dict:
        """API dev endpoint"""
        return {
            "frames": len(self.vector_col),
            "statuses": self._get_statuses(),
            "endpoints": ["/frame/{id}", "/related/{id}", "/status/{status}"]
        }
    
    def _get_statuses(self) -> Dict[str, int]:
        """Count by status"""
        counts: Dict[str, int] = {}
        for frame in self.vector_col.values():
            counts[frame.status] = counts.get(frame.status, 0) + 1
        return counts

# Initialize with Frame 086
api = FrameVectorAPI()
frame_086 = FrameVector(
    id=86,
    status="imgp",
    vector=[0.7, 0.8, 0.9],  # Example embedding
    related=[45, 4, 46]
)
api.insert_frame(frame_086)

# Cache the frame
frame_086_cached = FrameVector(
    id=86,
    status="cached",
    vector=[0.7, 0.8, 0.9],
    related=[45, 4, 46]
)
api.insert_frame(frame_086_cached)

print(f"Frame 086 related: {api.get_related(86)}")
print(f"API dev: {json.dumps(api.dev_route(), indent=2)}")
