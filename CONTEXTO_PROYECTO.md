# 🧩 CONTEXTO COMPLETO DEL PROYECTO: Traductor LSV (Lengua de Señas Venezolana)

## 📌 Información general

| Campo | Valor |
|-------|-------|
| **Nombre del proyecto** | TraductorLSV |
| **Objetivo** | App móvil gamificada para el aprendizaje de la Lengua de Señas Venezolana (LSV) mediante detección de manos en tiempo real |
| **Público objetivo** | Personas interesadas en aprender LSV de forma interactiva y lúdica |
| **Plataforma** | Android e iOS (React Native + Expo) |

---

## 🎯 Estado actual del proyecto

**Fase actual:** Configuración inicial y elección de arquitectura.

**Decisión tomada:** Usaremos **Opción B (TensorFlow.js + Expo Camera)** para poder desarrollar rápidamente con **Expo Go**, sin necesidad de builds nativas personalizadas. La migración a ML Kit (Opción A) se hará al final del desarrollo, como optimización final.

**Razón:** Priorizamos la velocidad de iteración y la facilidad de prueba durante el desarrollo de las 4 actividades gamificadas.

---

## 🏗️ Stack tecnológico (versión actual)

| Capa | Tecnología | Compatible con Expo Go |
|------|------------|------------------------|
| Framework | React Native + Expo SDK 54 | ✅ Sí |
| Lenguaje | TypeScript | ✅ Sí |
| Cámara | `expo-camera` | ✅ Sí |
| Detección de manos | `@tensorflow-models/hand-pose-detection` (MediaPipe) | ✅ Sí |
| Motor de ML | `@tensorflow/tfjs-react-native` | ✅ Sí |
| Dibujo de esqueleto | `react-native-svg` | ✅ Sí |
| Almacenamiento | `@react-native-async-storage/async-storage` | ✅ Sí |
| Navegación (futuro) | `@react-navigation/native` | ✅ Sí |

---

## 📂 Estructura de carpetas del proyecto
TraductorLSV/
├── app.json # Configuración de Expo
├── babel.config.js # Configuración de Babel
├── package.json # Dependencias
├── tsconfig.json # Configuración de TypeScript
├── CONTEXTO_PROYECTO.md # Este archivo
├── assets/ # Imágenes, sonidos, iconos
├── src/
│ ├── components/ # Componentes reutilizables
│ │ ├── CameraView.tsx # Cámara + detección de manos
│ │ ├── SkeletonOverlay.tsx # Dibujo del esqueleto (SVG)
│ │ ├── ScoreBar.tsx # Puntuación, nivel, racha
│ │ └── FeedbackToast.tsx # Notificaciones de acierto/error
│ ├── screens/ # Pantallas de la app
│ │ ├── HomeScreen.tsx # Menú principal con 4 actividades
│ │ ├── Activity1_Learn.tsx # Aprendizaje pasivo
│ │ ├── Activity2_Guess.tsx # ¿Qué seña es? (traductor inverso)
│ │ ├── Activity3_Sequence.tsx # Memoria y secuencias
│ │ ├── Activity4_Timed.tsx # Competencia contrarreloj
│ │ └── ProfileScreen.tsx # Logros, estadísticas, progreso
│ ├── utils/ # Utilidades y lógica compartida
│ │ ├── knnClassifier.ts # Clasificador KNN manual (sin TF)
│ │ ├── heuristics.ts # detectPredefinedSign, dedos levantados
│ │ ├── landmarksToVector.ts # Convierte 21 puntos a vector plano
│ │ ├── handConnections.ts # HAND_CONNECTIONS y puntos de dedos
│ │ └── storage.ts # Guardar/cargar datos en AsyncStorage
│ ├── hooks/ # Hooks personalizados
│ │ ├── useHandPose.ts # Hook para detección de manos
│ │ ├── useGameState.ts # Puntajes, niveles, racha
│ │ └── useAudioFeedback.ts # Sonidos y vibración
│ ├── types/ # Definiciones de TypeScript
│ │ └── index.ts # Landmark, Activity, UserProgress, etc.
│ └── App.tsx # Punto de entrada


---

## 🎮 Las 4 actividades gamificadas (requisitos)

### Actividad 1: Aprendizaje pasivo – "Mano alzada"

| Atributo | Descripción |
|----------|-------------|
| **Objetivo** | El usuario ve una seña y debe reproducirla con su mano |
| **Mecánica** | La app muestra una letra o palabra → usuario hace la seña → sistema evalúa |
| **Feedback** | ✅ Correcto (+10 pts) / ❌ Incorrecto (vuelve a intentar) |
| **Puntos** | +10 por acierto |
| **Condición de éxito** | 5 aciertos para completar el nivel básico |

### Actividad 2: ¿Qué seña es? (modo traductor inverso)

| Atributo | Descripción |
|----------|-------------|
| **Objetivo** | El usuario hace una seña y la app adivina su significado |
| **Mecánica** | Usuario realiza seña → app muestra texto estimado → usuario confirma si es correcto |
| **Feedback** | ✅ Acierto (+15 pts) ❌ Error (se muestra la respuesta correcta) |
| **Puntos** | +15 por acierto |
| **Valor pedagógico** | Refuerza la producción de señas |

### Actividad 3: Memoria y secuencias – "Repite la frase"

| Atributo | Descripción |
|----------|-------------|
| **Objetivo** | Seguir una secuencia de 3 a 5 señas en orden |
| **Mecánica** | App muestra lista de palabras → usuario realiza la secuencia completa |
| **Feedback** | Avance automático al siguiente ítem si es correcto |
| **Puntos** | +30 por secuencia completada |
| **Penalización** | Fallo reinicia la secuencia actual |

### Actividad 4: Competencia contrarreloj – "Adivina rápido"

| Atributo | Descripción |
|----------|-------------|
| **Objetivo** | Reconocer señas rápidamente antes que el tiempo termine |
| **Mecánica** | App muestra una seña (imagen/video) → usuario elige entre 3 opciones escritas |
| **Tiempo** | 10 segundos por pregunta |
| **Puntos** | +20 por acierto, +2 segundos extra |
| **Penalización** | Fallo o tiempo agotado → fin del juego |

---

## 🧪 Elementos de gamificación comunes

| Elemento | Comportamiento |
|----------|----------------|
| **Puntuación global** | Se acumula en todas las actividades (máximo ilimitado) |
| **Niveles** | Cada 200 puntos se sube de nivel (máx. 20) |
| **Insignias** | "Primera seña", "Maestro de la A", "Racha de 10", "Velocista" |
| **Racha (combo)** | Aciertos consecutivos: x2 (3 aciertos), x3 (5 aciertos), x4 (10 aciertos) |
| **Progreso diario** | Recordatorio de práctica diaria |
| **Feedback sonoro** | ✅ Sonido de acierto, ❌ sonido de error, 🎉 nivel subido |

---

## 🧠 Lógica de detección de señas (reutilizada del web)

### Heurística predefinida (sin entrenamiento)

Reconocimiento de letras básicas mediante reglas de dedos levantados:

| Letra | Regla |
|-------|-------|
| **A** | Puño cerrado, pulgar al lado (todos los dedos abajo) |
| **L** | Solo índice arriba, pulgar extendido |
| **V** | Índice y medio arriba en forma de V |
| **W** | Índice, medio y anular arriba |
| **Y** | Meñique arriba, pulgar extendido |
| **B** | Todos los dedos arriba, pulgar doblado |
| **Rock** | Índice y meñique arriba |

### Clasificador KNN entrenable

- **Entrada**: Vector de 63 números (21 puntos × coordenadas x,y,z)
- **Almacenamiento**: Mapa de `string → array<number[]>`
- **Predicción**: Distancia euclidiana + votación por mayoría (k=3)
- **Persistencia**: Guardado en AsyncStorage como JSON

---

## 📱 Flujo de datos principal

---

## ⚠️ Decisiones técnicas importantes

| Decisión | Justificación |
|----------|----------------|
| **Usar Expo Go durante desarrollo** | Iteración rápida, sin esperar builds nativas |
| **TensorFlow.js en lugar de ML Kit** | Compatibilidad garantizada con Expo Go |
| **KNN manual sin TensorFlow.js** | Reducir peso de la app y evitar dependencias complejas |
| **TypeScript estricto** | Mejor mantenibilidad y detección temprana de errores |
| **AsyncStorage para persistencia** | Simple y suficiente para guardar señas y puntajes |
| **10-15 FPS limitados** | Balance entre rendimiento y precisión |

---

## 🚫 Lo que NO se usa en esta fase

| Tecnología | Motivo |
|------------|--------|
| `react-native-vision-camera` | Requiere development build, no compatible con Expo Go |
| Frame processors | Requieren worklets nativos, no disponibles en Expo Go |
| ML Kit (nativo) | Se usará en versión final, no ahora |
| `react-native-mlkit-pose-detection` | No es necesario por ahora |
| Redux / Zustand | Estado local con useState/useContext es suficiente |

---

## 📋 Próximos pasos (hoja de ruta)

### Fase 1: Base funcional ✅ (en progreso)
- [x] Proyecto creado con Expo SDK 54
- [x] Dependencias instaladas
- [ ] `CameraView.tsx` con detección de manos (TensorFlow.js)
- [ ] Dibujo del esqueleto con SVG
- [ ] Heurística de dedos implementada
- [ ] KNN clasificador funcionando

### Fase 2: Actividades 1 y 2
- [ ] Pantalla de inicio con selector de actividades
- [ ] Actividad 1: Aprendizaje pasivo
- [ ] Actividad 2: ¿Qué seña es?

### Fase 3: Actividades 3 y 4
- [ ] Actividad 3: Memoria y secuencias
- [ ] Actividad 4: Competencia contrarreloj
- [ ] Sistema de niveles e insignias

### Fase 4: Pulido y optimización
- [ ] Sonidos y vibración
- [ ] Animaciones
- [ ] Persistencia completa
- [ ] Pruebas en dispositivos reales

### Fase 5: Migración a ML Kit (opcional)
- [ ] Cambiar a development build
- [ ] Reemplazar TensorFlow.js por ML Kit nativo
- [ ] Mejorar rendimiento y reducir consumo de batería

---

## 🔧 Comandos útiles para el desarrollador

```bash
# Iniciar el proyecto con Expo
npx expo start

# Limpiar caché
npx expo start --clear

# Instalar nueva dependencia
npx expo install [paquete]

# Ejecutar en Android específico
npx expo start --android

# Ejecutar en iOS específico
npx expo start --ios

# Prebuild (solo cuando se migre a ML Kit)
npx expo prebuild --clean