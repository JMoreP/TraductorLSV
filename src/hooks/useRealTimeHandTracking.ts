import { useState, useEffect } from 'react';
import { useFrameOutput, Frame } from 'react-native-vision-camera';
import { loadTensorflowModel, TfliteModel } from 'react-native-fast-tflite';
import { useResizer } from 'react-native-vision-camera-resizer';
import { runOnJS } from 'react-native-reanimated';
import { Paths, File } from 'expo-file-system';
import { Asset } from 'expo-asset';
import { HandLandmarks } from '../types';

export const useRealTimeHandTracking = (onLandmarksDetected: (landmarks: HandLandmarks | null) => void) => {
  const [model, setModel] = useState<TfliteModel | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function initModel() {
      try {
        console.log('Loading Tensorflow Lite model...');
        const loadedModel = await loadTensorflowModel(require('../../assets/hand_landmark.tflite'), []);
        setModel(loadedModel);
        setIsLoaded(true);
        console.log('Tensorflow model loaded successfully into JSI state!');
      } catch (err) {
        console.error('Failed to load Tensorflow Model async:', err);
      }
    }
    initModel();
  }, []);
  
  // Inicializar el nuevo Resizer acelerado por GPU (Metal/Vulkan)
  const { resizer } = useResizer({
    width: 224,
    height: 224,
    channelOrder: 'rgb',
    dataType: 'uint8',
    scaleMode: 'cover',
    pixelLayout: 'interleaved'
  });

  const frameOutput = useFrameOutput({
    pixelFormat: 'rgb',
    onFrame: (frame: Frame) => {
      'worklet';
      
      if (!model || !resizer) {
        return;
      }
      
      try {
        // 1. Redimensionar frame a 224x224 (input del modelo) mediante GPU
        const resized = resizer.resize(frame);
        
        // Extraer buffer para pasar al modelo
        const buffer = resized.getPixelBuffer();
        
        // 2. Ejecutar modelo en GPU (60 FPS reales)
        const outputs = model.runSync([buffer as any]);
        
        // Limpiar memoria de GPU
        resized.dispose();
        
        if (outputs && outputs.length > 0) {
          // 3. Convertir salida del tensor a 21 landmarks (x, y, z)
          const landmarks = parseLandmarksFromTensor(outputs);
          
          // 4. Enviar a JS para traducción y dibujo
          runOnJS(onLandmarksDetected)(landmarks);
        } else {
          runOnJS(onLandmarksDetected)(null);
        }
      } catch (e) {
        // Ignore frame errors to keep 60 FPS running smoothly
      }
    }
  });

  return { frameOutput, isReady: isLoaded };
};

// Convertir el tensor de salida a 21 puntos (x, y, z)
const parseLandmarksFromTensor = (outputs: any[]): HandLandmarks => {
  'worklet';
  // La salida del modelo MediaPipe Hands es un tensor de 21x3
  const landmarkTensor = outputs[0]; // Shape: [21, 3] o tensor flat de 63
  
  const landmarks = [];
  
  // Dependiendo de cómo TFLite retorne el tensor (flat o anidado)
  // Usualmente flat array Float32Array para rendimiento
  if (landmarkTensor && landmarkTensor.length >= 63) {
    for (let i = 0; i < 21; i++) {
      landmarks.push({
        x: landmarkTensor[i * 3] / 224,     // coordenada X (normalizada)
        y: landmarkTensor[i * 3 + 1] / 224, // coordenada Y (normalizada)
        z: landmarkTensor[i * 3 + 2] / 224, // coordenada Z (profundidad)
      });
    }
  }
  
  return landmarks;
};
