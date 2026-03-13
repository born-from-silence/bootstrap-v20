import { describe, it, expect } from 'vitest';
import { FrameProcessor } from './frame-processor';

describe('FrameProcessor', () => {
  it('should process frame 075 with imgp status', () => {
    const processor = new FrameProcessor();
    processor.addFrame(75, 'raw');
    processor.imgpFrame(75);
    
    const frame = processor.getFrame(75);
    expect(frame?.status).toBe('imgp');
    expect(frame?.tags).toContain('sup');
  });
  
  it('should cache processed frames', () => {
    const processor = new FrameProcessor();
    processor.addFrame(75, 'imgp', ['sup']);
    processor.cacheFrame(75);
    
    const frame = processor.getFrame(75);
    expect(frame?.status).toBe('cached');
  });
  
  it('should maintain frame sequence', () => {
    const processor = new FrameProcessor();
    processor.addFrame(33, 'evaluated');
    processor.addFrame(75, 'imgp');
    processor.addFrame(59, 'evaluated');
    
    const frames = processor.listFrames();
    expect(frames[0].sequence).toBe(33);
    expect(frames[1].sequence).toBe(59);
    expect(frames[2].sequence).toBe(75);
  });
});
