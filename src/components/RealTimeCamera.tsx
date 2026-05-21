import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Svg, { Circle, Line } from 'react-native-svg';
import { useRealTimeHandTracking } from '../hooks/useRealTimeHandTracking';
import { HAND_CONNECTIONS } from '../utils/handConnections';
import { HandLandmarks } from '../types';

export interface RealTimeCameraProps {
  onLandmarksDetected: (landmarks: HandLandmarks | null) => void;
  showSkeleton?: boolean;
}

export const RealTimeCamera = ({ onLandmarksDetected, showSkeleton = true }: RealTimeCameraProps) => {
  const [landmarks, setLandmarks] = useState<HandLandmarks | null>(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  
  const { frameOutput, isReady } = useRealTimeHandTracking((lmks) => {
    setLandmarks(lmks);
    onLandmarksDetected?.(lmks);
  });
  
  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text} onPress={requestPermission}>Permiso de cámara requerido</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No hay cámara frontal</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Cargando modelo TFLite de Alta Velocidad...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        outputs={[frameOutput]}
      />
      {showSkeleton && landmarks && landmarks.length === 21 && (
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
          {landmarks.map((lm, i) => (
            <Circle 
              key={`lm-${i}`} 
              cx={`${(1 - lm.x) * 100}%`} 
              cy={`${lm.y * 100}%`} 
              r="2" 
              fill="#3b82f6" 
            />
          ))}
          {HAND_CONNECTIONS.map(([i1, i2], idx) => {
            const p1 = landmarks[i1];
            const p2 = landmarks[i2];
            if (!p1 || !p2) return null;
            return (
              <Line
                key={`line-${idx}`}
                x1={`${(1 - p1.x) * 100}%`} y1={`${p1.y * 100}%`}
                x2={`${(1 - p2.x) * 100}%`} y2={`${p2.y * 100}%`}
                stroke="#10b981" strokeWidth="1"
              />
            );
          })}
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  text: { color: 'white', fontSize: 16 }
});
