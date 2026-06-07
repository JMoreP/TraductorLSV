import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RealTimeCamera } from './src/components/RealTimeCamera';
import { SkeletonOverlay } from './src/components/SkeletonOverlay';
import { useTranslation } from './src/hooks/useTranslation';
import { HandLandmarks } from './src/types';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const { translate, saveCurrentAsExample, isTrainingMode, setIsTrainingMode, savedSigns } = useTranslation();
  
  const [translation, setTranslation] = useState<string>('');
  const [landmarks, setLandmarks] = useState<HandLandmarks | null>(null);
  const [newSignName, setNewSignName] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);
  const frameCountRef = useRef(0);
  const detectionCountRef = useRef(0);

  const handleLandmarks = (lmks: HandLandmarks | null) => {
    // 1. Save landmarks to draw skeleton in UI (React render cycle)
    setLandmarks(lmks);
    
    // Contador de frames procesados
    frameCountRef.current += 1;
    if (frameCountRef.current % 30 === 0) {
      setFrameCount(frameCountRef.current);
    }
    
    // 2. Perform translation each frame
    const text = translate(lmks);
    setTranslation(text);
    
    // Contador de detecciones exitosas
    if (lmks && lmks.length === 21) {
      detectionCountRef.current += 1;
      if (detectionCountRef.current % 10 === 0) {
        setDetectionCount(detectionCountRef.current);
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cámara de video en tiempo real puro (60 FPS sin retraso) */}
      <View style={styles.cameraContainer}>
        <RealTimeCamera 
          onLandmarksDetected={handleLandmarks}
          showSkeleton={false} // Overlay manejado aquí para tener acceso a los landmarks
        />
        {/* Esqueleto SVG en tiempo real (separado de la cámara para que re-renderice suavemente) */}
        <SkeletonOverlay landmarks={landmarks} enableMirror={true} />
        
        {/* Debug overlay */}
        {debugMode && (
          <View style={styles.debugOverlay}>
            <Text style={styles.debugText}>Frames: {frameCount}</Text>
            <Text style={styles.debugText}>Detecciones: {detectionCount}</Text>
            <Text style={styles.debugText}>
              Landmarks: {landmarks ? landmarks.length : 'null'}
            </Text>
            {landmarks && landmarks.length >= 21 && (
              <>
                <Text style={styles.debugText}>
                  Wrist: ({landmarks[0].x.toFixed(3)}, {landmarks[0].y.toFixed(3)})
                </Text>
                <Text style={styles.debugText}>
                  IndexTip: ({landmarks[8].x.toFixed(3)}, {landmarks[8].y.toFixed(3)})
                </Text>
                <Text style={styles.debugText}>
                  ThumbTip: ({landmarks[4].x.toFixed(3)}, {landmarks[4].y.toFixed(3)})
                </Text>
              </>
            )}
            <Text style={styles.debugText}>
              Traducción: {translation || 'ninguna'}
            </Text>
          </View>
        )}
      </View>
      
      {/* Panel inferior UI */}
      <View style={styles.bottomSheet}>
        <View style={styles.translationBox}>
          <Text style={styles.translationText}>
            {translation || '✋ Esperando...'}
          </Text>
        </View>
        
        <View style={styles.trainingControls}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.modeButton, isTrainingMode && styles.modeButtonActive]}
              onPress={() => setIsTrainingMode(!isTrainingMode)}
            >
              <Text style={styles.modeButtonText}>
                {isTrainingMode ? '🔴 Entrenamiento' : '⚪ Traducción'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.debugButton, debugMode && styles.debugButtonActive]}
              onPress={() => setDebugMode(!debugMode)}
            >
              <Text style={styles.modeButtonText}>
                {debugMode ? '🟢 Debug ON' : '🔧 Debug'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isTrainingMode && (
            <View style={styles.trainingRow}>
              <TextInput
                style={styles.input}
                placeholder="Nombre (ej. HOLA)"
                placeholderTextColor="#94a3b8"
                value={newSignName}
                onChangeText={setNewSignName}
              />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  if (newSignName.trim() && landmarks) {
                    saveCurrentAsExample(landmarks, newSignName.trim().toUpperCase());
                    setNewSignName('');
                  }
                }}
              >
                <Text style={styles.saveButtonText}>💾 Guardar</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {savedSigns.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {savedSigns.map((sign, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{sign}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  cameraContainer: { flex: 1 },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  translationBox: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  translationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  trainingControls: { gap: 12 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  modeButton: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeButtonActive: { backgroundColor: '#10b981' },
  modeButtonText: { color: 'white', fontWeight: '600', fontSize: 13 },
  debugButton: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  debugButtonActive: { backgroundColor: '#f59e0b' },
  trainingRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: '#334155',
    color: 'white',
    padding: 12,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  saveButtonText: { color: 'white', fontWeight: '600' },
  chipContainer: { flexDirection: 'row', marginTop: 8 },
  chip: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold' },
  // Debug overlay
  debugOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    padding: 12,
    zIndex: 100,
  },
  debugText: {
    color: '#10b981',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 2,
  },
});
