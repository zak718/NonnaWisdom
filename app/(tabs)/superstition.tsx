import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { analyzePhotoAsync, SuperstitionResult } from '@/lib/superstition';

export default function SuperstitionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<SuperstitionResult | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission?.granted) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Camera permission needed</ThemedText>
        <Pressable style={styles.permissionButton} onPress={() => requestPermission()}>
          <ThemedText style={styles.permissionText}>Grant Camera Access</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const onCapture = async () => {
    try {
      const camera = cameraRef.current;
      if (!camera) return;
      // @ts-expect-error -- takePictureAsync is available on ref at runtime
      const photo = await camera.takePictureAsync({ quality: 0.7, skipProcessing: true });
      setPhotoUri(photo?.uri ?? null);
      setResult(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (photo?.uri) {
        const analysis = await analyzePhotoAsync(photo.uri);
        setResult(analysis);
      }
    } catch (e) {
      Alert.alert('Mamma mia!', 'Nonna cannot see the photo. Try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {!photoUri ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          enableTorch={false}
          autofocus="on"
        />
      ) : (
        <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
      )}

      <View style={styles.actions}>
        {!photoUri ? (
          <Pressable style={styles.captureButton} onPress={onCapture}>
            <ThemedText style={styles.captureText}>Capture 🔮</ThemedText>
          </Pressable>
        ) : (
          <>
            <Pressable style={styles.secondaryButton} onPress={() => setPhotoUri(null)}>
              <ThemedText style={styles.secondaryText}>Retake</ThemedText>
            </Pressable>
            <Pressable style={styles.captureButton} onPress={() => setPhotoUri(null)}>
              <ThemedText style={styles.captureText}>New Photo</ThemedText>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.result}>
        {result ? (
          <>
            <ThemedText type="title">Superstition Result</ThemedText>
            <ThemedText style={styles.resultText}>
              {result.icon} {result.title}
            </ThemedText>
            <ThemedText style={styles.resultSub}>{result.description}</ThemedText>
            <ThemedText style={styles.ritualTitle}>Ritual</ThemedText>
            <ThemedText style={styles.ritualText}>{result.ritual}</ThemedText>
          </>
        ) : (
          <ThemedText style={styles.hint}>
            Take a photo and let Nonna divine the superstition. Madonna santissima! 📷
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#009246',
    borderRadius: 12,
  },
  permissionText: { color: '#fff', fontWeight: '700' },
  camera: { height: 360, width: '100%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden' },
  preview: { height: 360, width: '100%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: { backgroundColor: '#CE2B37', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  captureText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#eee', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  secondaryText: { fontWeight: '600' },
  result: { padding: 16, gap: 8 },
  resultText: { fontSize: 18, marginTop: 6, fontWeight: '700' },
  resultSub: { fontSize: 14 },
  ritualTitle: { marginTop: 8, fontWeight: '700' },
  ritualText: { fontSize: 16, lineHeight: 22 },
  hint: { textAlign: 'center', color: '#666', marginTop: 8 },
});
