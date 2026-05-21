import { HandLandmarks, PredefinedSign } from '../types';

export function detectPredefinedSign(landmarks: HandLandmarks): PredefinedSign {
  if (!landmarks || landmarks.length < 21) return null;

  // Indices:
  // Thumb: 1,2,3,4
  // Index: 5,6,7,8
  // Middle: 9,10,11,12
  // Ring: 13,14,15,16
  // Pinky: 17,18,19,20

  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  
  const thumbExtended = Math.abs(thumbTip.x - indexMcp.x) > 0.12;
  const indexExtended = landmarks[8].y < landmarks[6].y && landmarks[8].y < landmarks[5].y;
  const middleExtended = landmarks[12].y < landmarks[10].y && landmarks[12].y < landmarks[9].y;
  const ringExtended = landmarks[16].y < landmarks[14].y && landmarks[16].y < landmarks[13].y;
  const pinkyExtended = landmarks[20].y < landmarks[18].y && landmarks[20].y < landmarks[17].y;

  // A: Closed fist, thumb sideways
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return 'A';
  // L: Thumb and index up
  if (thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return 'L';
  // V: Index and middle up
  if (!thumbExtended && indexExtended && middleExtended && !ringExtended && !pinkyExtended) return 'V';
  // W: Index, middle, ring up
  if (!thumbExtended && indexExtended && middleExtended && ringExtended && !pinkyExtended) return 'W';
  // Y: Pinky and thumb up
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && pinkyExtended) return 'Y';
  // B: All fingers up
  if (!thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) return 'B';
  // Rock: Index and pinky up
  if (!thumbExtended && indexExtended && !middleExtended && !ringExtended && pinkyExtended) return 'Rock';

  return null;
}
