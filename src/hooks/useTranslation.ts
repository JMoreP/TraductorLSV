import { useState, useEffect } from 'react';
import { HandLandmarks } from '../types';
import { detectPredefinedSign } from '../utils/heuristics';
import { KNNClassifier } from '../utils/knnClassifier';
import { landmarksToVector } from '../utils/landmarksToVector';

const STORAGE_KEY = '@TraductorLSV:knn_data_v2';
const knnClassifier = new KNNClassifier();

export const useTranslation = () => {
  const [isReady, setIsReady] = useState(false);
  const [savedSigns, setSavedSigns] = useState<string[]>([]);
  const [isTrainingMode, setIsTrainingMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      await knnClassifier.loadFromStorage(STORAGE_KEY);
      // Actualizar estado local para UI
      setSavedSigns(Array.from(knnClassifier['knnData'].keys()));
      setIsReady(true);
    };
    init();
  }, []);

  const translate = (landmarks: HandLandmarks | null): string => {
    if (!landmarks) return '';

    // 1. Intentar heurística
    const heuristic = detectPredefinedSign(landmarks);
    if (heuristic) return heuristic;
    
    // 2. Si no hay match, usar KNN entrenado
    if (knnClassifier.getNumClasses() > 0) {
      const vector = landmarksToVector(landmarks);
      const knnResult = knnClassifier.predict(vector, 3);
      if (knnResult) return knnResult;
    }
    
    return '?';
  };

  const saveCurrentAsExample = async (landmarks: HandLandmarks, label: string) => {
    if (!landmarks) return;
    const vector = landmarksToVector(landmarks);
    knnClassifier.addExample(vector, label);
    await knnClassifier.saveToStorage(STORAGE_KEY);
    
    // Refrescar chips en UI
    setSavedSigns(Array.from(knnClassifier['knnData'].keys()));
  };

  return {
    isReady,
    translate,
    saveCurrentAsExample,
    isTrainingMode,
    setIsTrainingMode,
    savedSigns
  };
};
