# 🧩 Contexto completo: Traductor de Señas Venezolanas (LSV) - App móvil gamificada

## 1. Origen del proyecto

Se parte de un **prototipo web funcional** desarrollado en React (Vite) + MediaPipe Hands + TensorFlow.js.  
Dicho prototipo:

- Detecta una mano en tiempo real vía cámara.
- Dibuja el esqueleto de 21 puntos.
- Reconoce señas mediante dos métodos:
  1. **Heurística predefinida** (detección de dedos levantados → letras A, L, V, W, Y, B, Rock).
  2. **Clasificador KNN entrenable** (el usuario puede añadir ejemplos de señas personalizadas).
- Permite alternar entre modo entrenamiento y modo predicción.
- Corre en navegador usando `getUserMedia`, `canvas` y modelos de Google MediaPipe.

El objetivo ahora es **transformar esa idea en una app móvil nativa** (Android/iOS) con **React Native + Expo**, aprovechando la lógica central pero adaptada al hardware móvil, con un enfoque **gamificado** para el aprendizaje de la **Lengua de Señas Venezolana (LSV)**.

---

## 2. Tecnología objetivo (app móvil)

| Capa | Tecnología elegida |
|------|---------------------|
| Framework | React Native (Expo SDK 54 - Arquitectura Legacy) |
| Detección de manos | `react-native-vision-camera` + `@ma-vision-camera/mlkit` (ML Kit Hand Pose) |
| Dibujo del esqueleto | `react-native-svg` (sobre la cámara) |
| Clasificador | KNN implementado en JavaScript puro (sin TensorFlow, para evitar dependencias pesadas) |
| Lógica de heurística | Reutilizada del código web original |
| Persistencia | `AsyncStorage` (guardar señas entrenadas y puntajes) |
| Gamificación | Sistema de niveles, retos, puntos, insignias, y 4 actividades distintas |

---

## 3. ¿Qué se reutiliza del código web original?

| Componente | Uso en la app móvil |
|------------|----------------------|
| `detectPredefinedSign()` | Se adapta a coordenadas normalizadas (x,y 0..1) de ML Kit. Reconoce letras básicas sin entrenar. |
| `HAND_CONNECTIONS` | Mismo array de pares de índices para dibujar los huesos. |
| `landmarksToTensor` → `landmarksToVector` | Convierte 21 puntos (x,y,z) en un vector plano de 63 números para el KNN. |
| Clasificador KNN | Reescribir en JS puro usando distancia euclidiana y votación por mayoría (k=3). |
| Lógica de entrenamiento | Añadir ejemplos a una clase (`addExample`) y predecir (`predictClass`). |
| Alternancia entrenamiento / predicción | Mediante un estado booleano (`isTraining`). |

**No se reutiliza**:
- TensorFlow.js (se reemplaza por KNN manual más ligero).
- MediaPipe Hands CDN (se reemplaza por ML Kit nativo).
- Canvas 2D (se reemplaza por SVG).
- WebRTC (se reemplaza por `VisionCamera`).

---

## 4. Requerimientos funcionales de la app gamificada

La aplicación debe **enseñar LSV** de forma lúdica mediante **4 actividades**. Cada actividad cubre un aspecto diferente del aprendizaje.

### Actividad 1: **Aprendizaje pasivo – "Mano alzada"**
- **Objetivo**: El usuario ve una seña en video/imagen y debe **reproducirla** con su mano.
- **Mecánica**: La app muestra en pantalla una letra o palabra (ej. "A", "Gracias").
- El usuario intenta hacer la seña con su mano.
- El sistema (usando heurística + KNN) evalúa si la seña coincide.
- Feedback inmediato: ✅ correcto / ❌ incorrecto.
- **Puntuación**: +10 pts por acierto.

### Actividad 2: **¿Qué seña es? (modo traductor inverso)**
- **Objetivo**: El usuario hace una seña y la app debe **adivinar** qué significa.
- **Mecánica**: Se activa la cámara. El usuario realiza una seña (aprendida previamente o predefinida).
- La app muestra en texto la traducción estimada.
- Si acierta lo que el usuario quería, este puede presionar "✅ Correcto" y gana puntos.
- **Valor pedagógico**: Refuerza la producción de señas.

### Actividad 3: **Memoria y secuencias – "Repite la frase"**
- **Objetivo**: Seguir una secuencia de 3 a 5 señas (ej: "Hola", "Gracias", "Adiós").
- **Mecánica**: La app muestra una lista de palabras (con imagen o texto). El usuario debe realizar la secuencia completa en orden.
- El sistema detecta cada seña y avanza automáticamente al siguiente ítem.
- Si falla una, se reinicia la secuencia (o se resta una vida).
- **Puntuación**: +30 pts por secuencia completada.

### Actividad 4: **Competencia contrarreloj – "Adivina rápido"**
- **Objetivo**: Reconocer señas rápidamente antes que el tiempo termine.
- **Mecánica**: La app muestra una seña (video o animación) y el usuario debe elegir entre 3 opciones escritas.
- Tiene 10 segundos por pregunta.
- Respuesta correcta: +20 pts, +2 seg extra. Incorrecta: fin del juego.
- **Valor**: Mejora la velocidad de interpretación.

---

## 5. Elementos de gamificación comunes

| Elemento | Descripción |
|----------|-------------|
| **Puntuación global** | Se acumula en todas las actividades. |
| **Niveles** | Cada 200 puntos se sube de nivel (máx. 20). |
| **Insignias** | Se desbloquean al completar ciertos hitos (ej. "Primera seña", "Maestro de la A", "Racha de 10"). |
| **Racha (combo)** | Aciertos consecutivos multiplican puntos (x2, x3). |
| **Progreso diario** | Recordatorio amigable para practicar cada día. |
| **Ranking local** | (Opcional) Tabla de puntajes en el dispositivo. |

---

## 6. Estructura técnica de la app (carpetas)
src/
├── components/
│ ├── CameraView.tsx # Cámara + detección de manos + dibujo SVG
│ ├── ActivitySelector.tsx # Botones para elegir 4 actividades
│ ├── ScoreBar.tsx # Muestra puntos, nivel, racha
│ ├── Feedback.tsx # Animaciones de correcto/incorrecto
│ └── ...
├── screens/
│ ├── HomeScreen.tsx # Pantalla principal con actividades
│ ├── Activity1_Learn.tsx
│ ├── Activity2_Guess.tsx
│ ├── Activity3_Sequence.tsx
│ ├── Activity4_Timed.tsx
│ └── ProfileScreen.tsx # Logros, estadísticas
├── utils/
│ ├── knnClassifier.js # KNN manual
│ ├── heuristics.js # detectPredefinedSign, fingerUp logic
│ ├── landmarksToVector.js
│ ├── handConnections.js # HAND_CONNECTIONS
│ └── storage.js # AsyncStorage helpers
├── hooks/
│ ├── useHandPose.ts # Wrapper de ML Kit con frame processor
│ └── useGameState.ts # Manejo de puntuación, niveles, racha
├── assets/ # imágenes, sonidos (correcto/incorrecto)
└── App.tsx


---

## 7. Flujo de datos principal

1. **Inicio**: Solicitar permisos de cámara. Cargar clasificador KNN guardado (AsyncStorage) y puntajes.
2. **Cámara activa**: Cada frame (15 fps) -> ML Kit devuelve 21 puntos (x,y,z normalizados 0-1).
3. **Procesamiento**:
   - Si `isTraining` está activo y hay un nombre de seña pendiente, se añade el vector al KNN.
   - Si `isTraining` está desactivado:
     - Primero se evalúa heurística predefinida.
     - Si no hay match, se usa KNN (solo si tiene clases).
4. **Resultado**:
   - Se muestra en pantalla el texto reconocido.
   - Las actividades usan ese resultado para comparar con la seña esperada y otorgar puntos.
5. **Persistencia**: Cada 5 segundos o al cambiar de actividad se guarda el KNN (serializar como JSON) y las puntuaciones.

---

## 8. Desafíos conocidos y soluciones

| Desafío | Solución |
|---------|----------|
| **Espejo de la cámara** | Invertir coordenada `x` (1 - x) en `Svg` para que los movimientos coincidan con la vista del usuario. |
| **Rendimiento** | Limitar framerate del frame processor a 15 fps. Usar `useMemo` y `React.memo` en componentes de dibujo. |
| **Variabilidad de manos** | El KNN manual puede ser sensible. Se recomienda promediar 3 ejemplos por seña para mayor robustez. |
| **Coordenadas Z** | ML Kit proporciona Z (profundidad). Usarla en el vector mejora la precisión para señas que implican acercar/alejar la mano. |
| **Nueva vs. Antigua arquitectura RN** | Se usa Expo SDK 54 (legacy) para evitar incompatibilidades con ML Kit. En el futuro se migrará. |

---

## 9. Próximos pasos (hoja de ruta)

- [ ] Configurar proyecto Expo SDK 54 con TypeScript.
- [ ] Integrar `VisionCamera` + frame processor de ML Kit.
- [ ] Implementar dibujo del esqueleto con SVG.
- [ ] Reutilizar heurística y KNN.
- [ ] Desarrollar las 4 actividades una a una.
- [ ] Agregar sonidos y vibración (feedback).
- [ ] Guardar progreso en AsyncStorage.
- [ ] Probar en dispositivos reales (Android e iOS).
- [ ] Publicar beta.

---

## 10. Notas finales

Este documento debe servir como **única fuente de verdad** para cualquier desarrollador o IA que trabaje en el proyecto.  
Si se generan nuevos archivos o se modifican decisiones técnicas, actualizar este contexto.

**Objetivo final**: Una app móvil educativa, funcional y entretenida que ayude a difundir la Lengua de Señas Venezolana, usando detección de manos en tiempo real y mecánicas de juego.
