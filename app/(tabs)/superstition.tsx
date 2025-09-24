import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Alert, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { analyzePhotoAsync, SuperstitionResult } from '@/lib/superstition';

export default function SuperstitionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<SuperstitionResult | null>(null);
  const [nonnaResponse, setNonnaResponse] = useState<string>('');

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (Platform.OS === 'web') {
    return (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.container}>
          <View style={[styles.preview, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
            <ThemedText style={{ color: '#666' }}>Camera preview not available on web</ThemedText>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.captureButton}
              onPress={async () => {
                try {
                  setPhotoUri('web');
                  setResult(null);
                  const analysis = await analyzePhotoAsync('web');
                  setResult(analysis);
                  setNonnaResponse(buildNonnaResponse(analysis));
                } catch (e) {
                  Alert.alert('Mamma mia!', 'Nonna cannot analyze the photo. Try again.');
                }
              }}
            >
              <ThemedText style={styles.captureText}>Simulate Capture 🔮</ThemedText>
            </Pressable>
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
                <ThemedText style={styles.nonnaTitle}>Nonna’s Verdict</ThemedText>
                <ThemedText style={styles.nonnaText}>{nonnaResponse}</ThemedText>
              </>
            ) : (
              <ThemedText style={styles.hint}>
                Click “Simulate Capture” and let Nonna divine the superstition. Madonna santissima! 📷
              </ThemedText>
            )}
          </View>
        </ThemedView>
      </ScrollView>
    );
  }

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
        setNonnaResponse(buildNonnaResponse(analysis));
      }
    } catch (e) {
      Alert.alert('Mamma mia!', 'Nonna cannot see the photo. Try again.');
    }
  };

  const buildNonnaResponse = (r: SuperstitionResult): string => {
    const exclamations = [
      'Mamma mia!',
      'Madonna santissima!',
      'Aye bambino!',
      'Per l’amor di Dio!',
      'Uffa!',
    ];
    const ex = exclamations[Math.floor(Math.random() * exclamations.length)];

    switch (r.title) {
      case 'Spilled Salt':
        return `${ex} You’ve angered the kitchen spirits! Quickly, before the pasta overcooks, make the sign of the cross and don’t you dare waste another grain. Nonna is watching.`;
      case 'Broom Touched Your Feet':
        return `${ex} Che disastro! That broom just swept away your chances of marriage. But don’t panic — Nonna knows counter-magic.`;
      case 'Opened Umbrella Indoors':
        return `${ex} Who opens an umbrella inside? What are you, trying to invite seven years of drizzle? Close it now and apologize to the house, capito?`;
      case 'Black Cat Crossed Your Path':
        return `${ex} He’s adorable, sì, but mischievous! Touch iron, give that cat a wink, and walk like you own the street. Nonna approves.`;
      case 'Malocchio (Evil Eye)':
        return `${ex} I can feel the malocchio from here — someone is jealous of your sauce! Put on the cornicello and glare back with confidence.`;
      case 'Spilled Food':
        return `${ex} You dropped the food? Sacrilegio! That’s a sign to cook more and share with the neighbors, then cleanse the air with basil and laughter.`;
      case 'Broken Mirror':
        return `${ex} Seven years? Nonna says nonsense — but you must show respect. Sweep the shards away from you and don’t look back.`;
      default:
        return `${ex} Fate is dramatic, but Nonna is more dramatic. Breathe, eat a biscotto, and follow the ritual exactly.`;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
            <ThemedText style={styles.captureText}>Take Photo 🔮</ThemedText>
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
            <ThemedText style={styles.nonnaTitle}>Nonna’s Verdict</ThemedText>
            <ThemedText style={styles.nonnaText}>{nonnaResponse}</ThemedText>
          </>
        ) : (
          <ThemedText style={styles.hint}>
            Take a photo and let Nonna divine the superstition. Madonna santissima! 📷
          </ThemedText>
        )}
      </View>
    </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 32 },
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#009246',
    borderRadius: 12,
  },
  permissionText: { color: '#fff', fontWeight: '700' },
  camera: { height: 360, width: '100%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden', marginBottom: 12 },
  preview: { height: 360, width: '100%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 12 },
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
  nonnaTitle: { marginTop: 10, fontWeight: '700', color: '#CE2B37' },
  nonnaText: {
    fontSize: 16,
    lineHeight: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    color: '#111',
  },
  hint: { textAlign: 'center', color: '#666', marginTop: 8 },
});
