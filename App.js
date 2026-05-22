import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [statusText, setStatusText] = useState('Pronto para gravar');

  // Função para iniciar a gravação do microfone
  async function startRecording() {
    try {
      setStatusText('Pedindo permissão do microfone...');
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        setStatusText('Gravando sua voz...');
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
      } else {
        Alert.alert('Permissão negada', 'Precisamos do microfone para funcionar.');
      }
    } catch (err) {
      console.error('Falha ao iniciar gravação', err);
    }
  }

  // Função para parar a gravação e salvar o áudio na memória
  async function stopRecording() {
    setStatusText('Processando áudio...');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    setStatusText('Áudio gravado! Escolha um efeito abaixo.');
  }

  // Função que reproduz o áudio aplicando o efeito de Voz (Pitch/Rate)
  async function playVoiceWithEffect(pitchValue, rateValue) {
    if (!audioUri) {
      Alert.alert('Aviso', 'Grave um áudio primeiro!');
      return;
    }

    // Se já tiver um som tocando, para ele
    if (sound) {
      await sound.unloadAsync();
    }

    setStatusText('Reproduzindo com efeito...');
    
    // Cria o reprodutor de áudio com as modificações de tom e velocidade
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { 
        shouldPlay: true,
        pitch: pitchValue,          // Altera o tom da voz
        rate: rateValue,            // Altera a velocidade
        shouldCorrectPitch: false,  // Permite que o tom mude de verdade (efeito esquilo/monstro)
      }
    );

    setSound(newSound);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setStatusText('Áudio finalizado.');
      }
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Modificador de Voz Mobile</Text>
      <Text style={styles.status}>{statusText}</Text>

      {/* Botão de Gravar / Parar */}
      <TouchableOpacity
        style={[styles.buttonRecord, recording ? styles.buttonStop : null]}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>{recording ? '🛑 PARAR' : '🔴 GRAVAR VOZ'}</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Escolha o Efeito:</Text>

      {/* Grade de Efeitos */}
      <View style={styles.effectsContainer}>
        <TouchableOpacity style={styles.buttonEffect} onPress={() => playVoiceWithEffect(1.6, 1.4)}>
          <Text style={styles.buttonText}>🐿️ Esquilo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonEffect} onPress={() => playVoiceWithEffect(0.6, 0.8)}>
          <Text style={styles.buttonText}>👹 Monstro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonEffect} onPress={() => playVoiceWithEffect(1.0, 1.0)}>
          <Text style={styles.buttonText}>👤 Normal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#aaa', marginTop: 30, marginBottom: 10 },
  status: { fontSize: 16, color: '#00ff00', marginBottom: 40 },
  buttonRecord: { backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginBottom: 20 },
  buttonStop: { backgroundColor: '#FF3B30' },
  buttonEffect: { backgroundColor: '#333', padding: 15, borderRadius: 10, margin: 5, width: '45%', alignItems: 'center' },
  effectsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
