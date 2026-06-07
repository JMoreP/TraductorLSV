import { HandLandmarks, PredefinedSign } from '../types';

// === Helpers para análisis de dedos ===

/** Distancia euclidiana 2D entre dos landmarks */
function dist2D(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Verifica si un dedo está extendido (punta más arriba que el nudillo MCP) */
function isFingerExtended(landmarks: HandLandmarks, tipIdx: number, pipIdx: number, mcpIdx: number): boolean {
  // En coordenadas de imagen, Y menor = más arriba
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];
  return tip.y < pip.y && tip.y < mcp.y;
}

/** Verifica si un dedo está completamente cerrado (punta más abajo que MCP) */
function isFingerCurled(landmarks: HandLandmarks, tipIdx: number, pipIdx: number, mcpIdx: number): boolean {
  const tip = landmarks[tipIdx];
  const mcp = landmarks[mcpIdx];
  return tip.y > mcp.y;
}

/** Verifica si el pulgar está extendido lateralmente */
function isThumbExtended(landmarks: HandLandmarks): boolean {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexMcp = landmarks[5];
  // Pulgar extendido = punta alejada lateralmente del índice
  return Math.abs(thumbTip.x - indexMcp.x) > 0.10;
}

/** Verifica si el pulgar está cruzado sobre la palma */
function isThumbAcrossPalm(landmarks: HandLandmarks): boolean {
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  // Pulgar cruzado = punta del pulgar cerca o pasando el MCP del medio
  const midX = (indexMcp.x + middleMcp.x) / 2;
  return Math.abs(thumbTip.x - midX) < 0.06;
}

/** Verifica si dos puntas de dedos están tocándose */
function areTipsTouching(landmarks: HandLandmarks, tip1: number, tip2: number, threshold = 0.06): boolean {
  return dist2D(landmarks[tip1], landmarks[tip2]) < threshold;
}

/** Verifica si la punta del pulgar toca la punta de un dedo */
function thumbTouchesFingerTip(landmarks: HandLandmarks, fingerTip: number, threshold = 0.06): boolean {
  return dist2D(landmarks[4], landmarks[fingerTip]) < threshold;
}

/** Verifica si la punta del pulgar toca el PIP/DIP de un dedo */
function thumbTouchesFingerSide(landmarks: HandLandmarks, fingerPip: number, threshold = 0.06): boolean {
  return dist2D(landmarks[4], landmarks[fingerPip]) < threshold;
}

// === Detección principal ===

export function detectPredefinedSign(landmarks: HandLandmarks): PredefinedSign {
  if (!landmarks || landmarks.length < 21) return null;

  // Estado de cada dedo
  const thumbExt = isThumbExtended(landmarks);
  const indexExt = isFingerExtended(landmarks, 8, 6, 5);
  const middleExt = isFingerExtended(landmarks, 12, 10, 9);
  const ringExt = isFingerExtended(landmarks, 16, 14, 13);
  const pinkyExt = isFingerExtended(landmarks, 20, 18, 17);

  const indexCurled = isFingerCurled(landmarks, 8, 6, 5);
  const middleCurled = isFingerCurled(landmarks, 12, 10, 9);
  const ringCurled = isFingerCurled(landmarks, 16, 14, 13);
  const pinkyCurled = isFingerCurled(landmarks, 20, 18, 17);

  const allFingersClosed = !indexExt && !middleExt && !ringExt && !pinkyExt;
  const allFingersOpen = indexExt && middleExt && ringExt && pinkyExt;

  // ===== ABECEDARIO LSV/ASL =====

  // A: Puño cerrado, pulgar al lado (no cruzado sobre los dedos)
  if (allFingersClosed && thumbExt && !isThumbAcrossPalm(landmarks)) {
    return 'A';
  }

  // B: Todos los dedos extendidos juntos, pulgar cruzado sobre la palma
  if (allFingersOpen && !thumbExt) {
    return 'B';
  }

  // C: Dedos curvados en forma de C (semi-abiertos, no completamente extendidos ni cerrados)
  if (!allFingersOpen && !allFingersClosed) {
    const indexSemi = landmarks[8].y < landmarks[5].y && landmarks[8].y > landmarks[6].y - 0.03;
    const middleSemi = landmarks[12].y < landmarks[9].y && landmarks[12].y > landmarks[10].y - 0.03;
    const thumbOut = Math.abs(landmarks[4].x - landmarks[5].x) > 0.05;
    if (indexSemi && middleSemi && thumbOut && !ringExt && !pinkyExt) {
      return 'C';
    }
  }

  // D: Índice extendido, otros dedos tocan el pulgar formando un círculo
  if (indexExt && !middleExt && !ringExt && !pinkyExt) {
    if (thumbTouchesFingerTip(landmarks, 12, 0.08) || thumbTouchesFingerSide(landmarks, 11, 0.08)) {
      return 'D';
    }
  }

  // E: Todos los dedos cerrados, puntas tocan el pulgar
  if (allFingersClosed && !thumbExt) {
    return 'E';
  }

  // F: Pulgar e índice formando círculo, otros 3 dedos extendidos
  if (thumbTouchesFingerTip(landmarks, 8, 0.07) && middleExt && ringExt && pinkyExt) {
    return 'F';
  }

  // G: Índice extendido horizontalmente, pulgar extendido
  if (indexExt && !middleExt && !ringExt && !pinkyExt && thumbExt) {
    const indexHorizontal = Math.abs(landmarks[8].y - landmarks[5].y) < 0.08;
    if (indexHorizontal) {
      return 'G';
    }
  }

  // H: Índice y medio extendidos horizontalmente
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    const indexHorizontal = Math.abs(landmarks[8].y - landmarks[5].y) < 0.08;
    const middleHorizontal = Math.abs(landmarks[12].y - landmarks[9].y) < 0.08;
    if (indexHorizontal && middleHorizontal) {
      return 'H';
    }
  }

  // I: Solo meñique extendido, puño cerrado
  if (!indexExt && !middleExt && !ringExt && pinkyExt && !thumbExt) {
    return 'I';
  }

  // K: Índice y medio en V, pulgar entre ellos
  if (indexExt && middleExt && !ringExt && !pinkyExt && thumbExt) {
    const thumbBetween = landmarks[4].y > landmarks[8].y && landmarks[4].y < landmarks[12].y;
    if (thumbBetween) {
      return 'K';
    }
  }

  // L: Índice extendido + pulgar extendido formando L
  if (indexExt && !middleExt && !ringExt && !pinkyExt && thumbExt) {
    return 'L';
  }

  // O: Todos los dedos curvados formando O, pulgar toca índice
  if (thumbTouchesFingerTip(landmarks, 8, 0.07) && !middleExt && !ringExt && !pinkyExt) {
    return 'O';
  }

  // R: Índice y medio cruzados
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    // Detectar cruce: punta del medio está del lado del índice
    const crossed = Math.abs(landmarks[8].x - landmarks[12].x) < 0.03;
    if (crossed) {
      return 'R';
    }
  }

  // U: Índice y medio extendidos juntos (vertical)
  if (indexExt && middleExt && !ringExt && !pinkyExt && !thumbExt) {
    return 'U';
  }

  // V: Índice y medio en V separados
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    const spread = dist2D(landmarks[8], landmarks[12]) > 0.06;
    if (spread) {
      return 'V';
    }
  }

  // W: Índice, medio y anular extendidos
  if (indexExt && middleExt && ringExt && !pinkyExt && !thumbExt) {
    return 'W';
  }

  // X: Índice semi-doblado (gancho)
  if (!indexExt && !middleExt && !ringExt && !pinkyExt) {
    const indexHooked = landmarks[8].y > landmarks[7].y && landmarks[7].y < landmarks[6].y;
    if (indexHooked && !thumbExt) {
      return 'X';
    }
  }

  // Y: Pulgar y meñique extendidos (teléfono/shaka)
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return 'Y';
  }

  // 5 / Mano abierta: Todos los dedos + pulgar extendidos
  if (allFingersOpen && thumbExt) {
    return '5';
  }

  return null;
}
