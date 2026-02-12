
export type AspectRatio = '16:9' | '9:16';

export interface GenerationStatus {
  isGenerating: boolean;
  message: string;
  progress?: number;
  error?: string;
}

export interface VideoResult {
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
}
