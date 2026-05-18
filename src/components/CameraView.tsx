import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useFrameOutput, type Frame } from 'react-native-vision-camera';
import { MLKitPoseDetector } from 'react-native-mlkit-pose-detection';
import { runOnJS } from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';
import { HAND_CONNECTIONS } from '../utils/handConnections';

export const CameraView = () => {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [landmarks, setLandmarks] = useState<any[]>([]);
  
  const poseDetector = MLKitPoseDetector();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const updateLandmarks = (detectedLandmarks: any[]) => {
    setLandmarks(detectedLandmarks);
  };

  const frameOutput = useFrameOutput({
    onFrame: (frame: Frame) => {
      'worklet';
      // react-native-mlkit-pose-detection plugin
      const poses = poseDetector.process(frame as any);
      
      if (poses && poses.length > 0 && poses[0].landmarks().length > 0) {
        runOnJS(updateLandmarks)(poses[0].landmarks());
      } else {
        runOnJS(updateLandmarks)([]);
      }
      
      (frame as any).dispose();
    }
  });

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>No hay cámara frontal disponible.</Text>
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
      
      {/* SVG Overlay para dibujar el esqueleto */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height="100%" width="100%">
          {landmarks.length > 0 && HAND_CONNECTIONS.map(([startIdx, endIdx], i) => {
            const startPoint = landmarks[startIdx];
            const endPoint = landmarks[endIdx];
            
            if (!startPoint || !endPoint) return null;

            // Suponiendo coordenadas normalizadas 0-1.
            // Para el modo espejo (cámara frontal), invertimos x: (1 - x)
            return (
              <Line
                key={`line-${i}`}
                x1={`${(1 - startPoint.x) * 100}%`}
                y1={`${startPoint.y * 100}%`}
                x2={`${(1 - endPoint.x) * 100}%`}
                y2={`${endPoint.y * 100}%`}
                stroke="green"
                strokeWidth="2"
              />
            );
          })}

          {landmarks.map((point, i) => {
            if (!point) return null;
            return (
              <Circle
                key={`circle-${i}`}
                cx={`${(1 - point.x) * 100}%`}
                cy={`${point.y * 100}%`}
                r="4"
                fill="blue"
              />
            );
          })}
        </Svg>
      </View>

      {/* Texto de ayuda */}
      {landmarks.length === 0 && (
        <View style={styles.helpOverlay}>
          <Text style={styles.helpText}>Coloca tu mano frente a la cámara</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpOverlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
  },
  helpText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
