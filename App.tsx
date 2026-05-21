import React, { useState } from 'react';
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

  const handleLandmarks = (lmks: HandLandmarks | null) => {
    // 1. Save landmarks to draw skeleton in UI (React render cycle)
    setLandmarks(lmks);
    
    // 2. Perform translation each frame
    const text = translate(lmks);
    setTranslation(text);
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
      </View>
      
      {/* Panel inferior UI */}
      <View style={styles.bottomSheet}>
        <View style={styles.translationBox}>
          <Text style={styles.translationText}>
            {translation || '✋ Esperando...'}
          </Text>
        </View>
        
        <View style={styles.trainingControls}>
          <TouchableOpacity 
            style={[styles.modeButton, isTrainingMode && styles.modeButtonActive]}
            onPress={() => setIsTrainingMode(!isTrainingMode)}
          >
            <Text style={styles.modeButtonText}>
              {isTrainingMode ? '🔴 Modo Entrenamiento' : '⚪ Modo Traducción'}
            </Text>
          </TouchableOpacity>
          
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
  modeButton: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeButtonActive: { backgroundColor: '#10b981' },
  modeButtonText: { color: 'white', fontWeight: '600' },
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
  chipText: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold' }
});
