export default {
  expo: {
    name: "TraductorLSV",
    slug: "traductorlsv",
    version: "1.0.0",
    newArchEnabled: true,
    plugins: [
      [
        "expo-vision-camera-v4-mediapipe/plugin",
        {
          "handLandmarker": true
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 26,
            compileSdkVersion: 36,
            newArchEnabled: true
          }
        }
      ]
    ],
    android: {
      package: "com.traductor.lsv",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    },
    extra: {
      eas: {
        projectId: "b18b2ac5-c1f7-44e8-9b44-0fff1639954d"
      }
    }
  }
};
