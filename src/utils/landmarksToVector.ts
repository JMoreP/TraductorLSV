import { HandLandmarks } from '../types';

export const landmarksToVector = (landmarks: HandLandmarks): number[] => {
  if (!landmarks || landmarks.length === 0) return [];
  const wrist = landmarks[0];
  const vector: number[] = [];

  for (const kp of landmarks) {
    vector.push(kp.x - wrist.x);
    vector.push(kp.y - wrist.y);
    vector.push(kp.z - wrist.z);
  }

  return vector;
};
