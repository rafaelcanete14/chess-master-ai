import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export class HapticsService {
  private static enabled = true;

  public static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public static light() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // fallback safe
    }
  }

  public static medium() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // fallback safe
    }
  }

  public static heavy() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // fallback safe
    }
  }

  public static success() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // fallback safe
    }
  }

  public static warning() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // fallback safe
    }
  }

  public static error() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // fallback safe
    }
  }
}
