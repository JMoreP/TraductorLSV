import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { HandLandmarks } from '../types';
import { HAND_CONNECTIONS } from '../utils/handConnections';

interface SkeletonOverlayProps {
  landmarks: HandLandmarks | null;
  enableMirror?: boolean;
}

export const SkeletonOverlay: React.FC<SkeletonOverlayProps> = ({ landmarks, enableMirror = true }) => {
  if (!landmarks || landmarks.length === 0) return null;

  const mirrorX = (x: number) => enableMirror ? 1 - x : x;

  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Conexiones */}
      {HAND_CONNECTIONS.map(([i1, i2], idx) => {
        const p1 = landmarks[i1];
        const p2 = landmarks[i2];
        if (!p1 || !p2) return null;
        return (
          <Line
            key={`conn-${idx}`}
            x1={`${mirrorX(p1.x) * 100}%`}
            y1={`${p1.y * 100}%`}
            x2={`${mirrorX(p2.x) * 100}%`}
            y2={`${p2.y * 100}%`}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      
      {/* Puntos */}
      {landmarks.map((lm, idx) => (
        <Circle
          key={`lm-${idx}`}
          cx={`${mirrorX(lm.x) * 100}%`}
          cy={`${lm.y * 100}%`}
          r="2.5"
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth="0.5"
        />
      ))}
    </Svg>
  );
};
