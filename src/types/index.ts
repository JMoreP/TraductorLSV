export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarks = HandLandmark[];

export type PredefinedSign = 
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' 
  | 'K' | 'L' | 'O' | 'R' | 'U' | 'V' | 'W' | 'X' | 'Y' 
  | '5' | null;

export interface PredictionResult {
  label: string | null;
  confidence: number;
}
