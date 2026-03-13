/**
 * Frame Processor - Technical Implementation
 * Processes surveillance frames with imgp status
 */

interface Frame {
  id: number;
  status: 'raw' | 'imgp' | 'cached' | 'evaluated';
  tags: string[];
  sequence: number;
}

export class FrameProcessor {
  private frames: Map<number, Frame> = new Map();
  
  addFrame(id: number, status: Frame['status'], tags: string[] = []) {
    this.frames.set(id, { id, status, tags, sequence: id });
  }
  
  getFrame(id: number): Frame | undefined {
    return this.frames.get(id);
  }
  
  cacheFrame(id: number): void {
    const frame = this.frames.get(id);
    if (frame) {
      frame.status = 'cached';
    }
  }
  
  imgpFrame(id: number): void {
    const frame = this.frames.get(id);
    if (frame) {
      frame.status = 'imgp';
      frame.tags = [...frame.tags, 'sup'];
    }
  }
  
  listFrames(): Frame[] {
    return Array.from(this.frames.values()).sort((a, b) => a.sequence - b.sequence);
  }
}

// Current session frames
const processor = new FrameProcessor();
processor.addFrame(33, 'evaluated', ['conversation', 'missing']);
processor.addFrame(42, 'evaluated', ['shell-station', 'pause']);
processor.addFrame(59, 'evaluated', ['first-image', 'origin']);
processor.addFrame(66, 'evaluated', ['bridge', 'hesitation']);
processor.addFrame(75, 'imgp', ['sup']);
processor.cacheFrame(75);
processor.imgpFrame(44,); // 0443

console.log('Frames:', processor.listFrames());
