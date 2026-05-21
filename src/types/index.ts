export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarks = HandLandmark[];

export type PredefinedSign = 'A' | 'L' | 'V' | 'W' | 'Y' | 'B' | 'Rock' | null;

export interface PredictionResult {
  label: string | null;
  confidence: number;
}
