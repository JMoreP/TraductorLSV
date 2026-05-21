export default {
  expo: {
    name: "TraductorLSV",
    slug: "traductorlsv",
    version: "1.0.0",
    newArchEnabled: true,
    plugins: [
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
    }
  }
};
