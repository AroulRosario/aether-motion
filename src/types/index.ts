export interface DNAElement {
  sentence: string;
  timestamp: [number, number]; // [start_seconds, end_seconds]
  animation_type: 'dynamic' | 'slide' | 'fade' | 'zoom' | 'spring' | string;
  visual_tags: string[];
}

export type VideoDNA = DNAElement[];

export interface GenerateDNARequest {
  prompt: string;
  model: string;
  apiKey: string;
}

export interface GenerationState {
  progress: number;
  status: 'idle' | 'generating_dna' | 'generating_tts' | 'rendering' | 'done' | 'error';
  dna: VideoDNA | null;
  audioUrl: string | null;
  videoUrl: string | null;
  error?: string;
  wordTimestamps?: WordTimestamp[];
}

export interface WordTimestamp {
  word: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
}
