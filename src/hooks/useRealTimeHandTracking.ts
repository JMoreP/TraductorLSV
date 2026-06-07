import { useState } from 'react';
import { runOnJS } from 'react-native-reanimated';
import { useFrameOutput, Frame } from 'react-native-vision-camera';
import { detectHandLandmarks } from 'expo-vision-camera-v4-mediapipe';
import { HandLandmarks } from '../types';

export const useRealTimeHandTracking = (onLandmarksDetected: (landmarks: HandLandmarks | null) => void) => {
  // Con el plugin nativo, el modelo ya está cargado en C++
  const [isLoaded, setIsLoaded] = useState(true);

  const onHandsDetectedJS = (result: any) => {
    if (result && result.hands && result.hands.length > 0) {
      // Obtenemos los 21 puntos de la primera mano detectada
      const detectedHand = result.hands[0]; 
      
      // Mapeamos al formato exacto que espera nuestra app (0.0 a 1.0)
      const parsedLandmarks = detectedHand.map((point: any) => ({
        x: point.x,
        y: point.y,
        z: point.z,
      }));
      
      onLandmarksDetected(parsedLandmarks);
    } else {
      onLandmarksDetected(null);
    }
  };

  // 1. Crear el Frame Output para Vision Camera v5
  const frameOutput = useFrameOutput({
    pixelFormat: 'rgb', // MediaPipe suele trabajar bien con rgb
    onFrame: (frame: Frame) => {
      'worklet';
      try {
        // 2. Pasar el frame a MediaPipe (internamente ejecuta detección de palma + landmarks)
        const result = detectHandLandmarks(frame);
        
        runOnJS(onHandsDetectedJS)(result);
      } catch (e: any) {
        console.warn("[HandTracking] Frame Processor Error:", e?.message || e);
      }
    }
  });

  return { frameOutput, isReady: isLoaded };
};

