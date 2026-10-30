import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type SoundEffectType = 'move' | 'capture' | 'check' | 'castle' | 'promote' | 'game_over' | 'victory';

export class AudioService {
  private static enabled = true;
  private static soundsLoaded = false;

  public static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public static async init() {
    if (Platform.OS !== 'web') {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch {
        // silent audio init error
      }
    }
  }

  public static async playSound(type: SoundEffectType) {
    if (!this.enabled) return;

    // Web Audio API synthesizer for instant zero-latency feedback on web/mobile browsers
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        switch (type) {
          case 'move':
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
            break;
          case 'capture':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(480, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
            break;
          case 'check':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
            break;
          case 'castle':
            osc.frequency.setValueAtTime(360, now);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;
          case 'promote':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08);
            osc.frequency.setValueAtTime(783.99, now + 0.16);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
          case 'victory':
          case 'game_over':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
            break;
        }
      } catch {
        // web audio fallback
      }
    }
  }
}

