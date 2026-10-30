import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService, DEFAULT_SETTINGS } from '../storage/StorageService';
import { DIFFICULTY_CONFIGS } from '../chess/DifficultyManager';
import { BOARD_THEMES } from '../theme/colors';
import { AudioService } from '../services/AudioService';
import { HapticsService } from '../services/HapticsService';
import {
  GameSettings,
  PlayerColor,
  DifficultyLevel,
  BoardThemeId,
} from '../types/chess';
import { UI_COLORS } from '../theme/colors';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await StorageService.getSettings();
    setSettings(s);
  };

  const updateSetting = async <K extends keyof GameSettings>(
    key: K,
    val: GameSettings[K]
  ) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    await StorageService.saveSettings(updated);

    if (key === 'soundEnabled') {
      AudioService.setEnabled(val as boolean);
    }
    if (key === 'hapticsEnabled') {
      HapticsService.setEnabled(val as boolean);
    }
  };

  const clockPresets = [
    { label: 'None', enabled: false, initial: 0 },
    { label: 'Bullet 1m', enabled: true, initial: 60 },
    { label: 'Blitz 3m', enabled: true, initial: 180 },
    { label: 'Blitz 5m', enabled: true, initial: 300 },
    { label: 'Rapid 10m', enabled: true, initial: 600 },
    { label: 'Rapid 15m', enabled: true, initial: 900 },
    { label: 'Classical 30m', enabled: true, initial: 1800 },
  ];

  const handleSelectClockPreset = async (preset: typeof clockPresets[0]) => {
    const updated = {
      ...settings,
      clockSettings: {
        enabled: preset.enabled,
        initialSeconds: preset.initial,
        incrementSeconds: 0,
      },
    };
    setSettings(updated);
    await StorageService.saveSettings(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.appBarButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={UI_COLORS.text} />
          </TouchableOpacity>
          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>Game Settings</Text>
            <Text style={styles.screenSubtitle}>Customization & Gameplay Options</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Preferred Color */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Default Player Side</Text>
            <View style={styles.optionsRow}>
              {(['w', 'b', 'random'] as PlayerColor[]).map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.choiceBtn,
                    settings.playerColor === color && styles.activeChoiceBtn,
                  ]}
                  onPress={() => updateSetting('playerColor', color)}
                >
                  <Ionicons
                    name={color === 'w' ? 'ellipse' : color === 'b' ? 'ellipse-outline' : 'shuffle'}
                    size={16}
                    color={settings.playerColor === color ? '#FFF' : UI_COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.choiceBtnText,
                      settings.playerColor === color && styles.activeChoiceBtnText,
                    ]}
                  >
                    {color === 'w' ? 'White' : color === 'b' ? 'Black' : 'Random'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Difficulty Selector */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Default AI Difficulty</Text>
            <Text style={styles.sectionSub}>Select engine strength for offline games</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelsRow}>
              {([1, 2, 3, 4, 5, 6, 7, 8] as DifficultyLevel[]).map(lvl => {
                const isSelected = settings.difficulty === lvl;
                return (
                  <TouchableOpacity
                    key={`lvl-chip-${lvl}`}
                    style={[styles.levelChip, isSelected && styles.activeLevelChip]}
                    onPress={() => updateSetting('difficulty', lvl)}
                  >
                    <Text style={[styles.levelNum, isSelected && styles.activeLevelNum]}>
                      Lvl {lvl}
                    </Text>
                    <Text style={[styles.levelName, isSelected && styles.activeLevelName]}>
                      {DIFFICULTY_CONFIGS[lvl].name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.difficultyDescBox}>
              <Text style={styles.diffDescTitle}>
                {DIFFICULTY_CONFIGS[settings.difficulty].title}
              </Text>
              <Text style={styles.diffDescBody}>
                {DIFFICULTY_CONFIGS[settings.difficulty].description}
              </Text>
            </View>
          </View>

          {/* Board Themes */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Chessboard Theme</Text>
            <View style={styles.themesGrid}>
              {Object.values(BOARD_THEMES).map(theme => {
                const isSelected = settings.boardTheme === theme.id;
                return (
                  <TouchableOpacity
                    key={theme.id}
                    style={[styles.themeCard, isSelected && styles.activeThemeCard]}
                    onPress={() => updateSetting('boardTheme', theme.id as BoardThemeId)}
                  >
                    <View style={styles.themePreviewRow}>
                      <View style={[styles.themeSquare, { backgroundColor: theme.lightSquare }]} />
                      <View style={[styles.themeSquare, { backgroundColor: theme.darkSquare }]} />
                    </View>
                    <Text style={[styles.themeName, isSelected && styles.activeThemeName]}>
                      {theme.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Chess Clocks */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Chess Clock Preset</Text>
            <View style={styles.clockPillRow}>
              {clockPresets.map(preset => {
                const isSelected =
                  (!preset.enabled && !settings.clockSettings.enabled) ||
                  (preset.enabled &&
                    settings.clockSettings.enabled &&
                    settings.clockSettings.initialSeconds === preset.initial);

                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.clockChip, isSelected && styles.activeClockChip]}
                    onPress={() => handleSelectClockPreset(preset)}
                  >
                    <Text style={[styles.clockChipText, isSelected && styles.activeClockChipText]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Audio, Haptics & Feedback */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Audio & Interaction</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelCol}>
                <Text style={styles.switchTitle}>Sound Effects</Text>
                <Text style={styles.switchSub}>Audio cues on moves, captures, checks, and victory</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={v => updateSetting('soundEnabled', v)}
                trackColor={{ false: UI_COLORS.surfaceHighlight, true: UI_COLORS.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelCol}>
                <Text style={styles.switchTitle}>Haptic Feedback</Text>
                <Text style={styles.switchSub}>Tactile vibration pulses on piece interaction</Text>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={v => updateSetting('hapticsEnabled', v)}
                trackColor={{ false: UI_COLORS.surfaceHighlight, true: UI_COLORS.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelCol}>
                <Text style={styles.switchTitle}>Show Legal Move Dots</Text>
                <Text style={styles.switchSub}>Highlight legal destination squares</Text>
              </View>
              <Switch
                value={settings.showLegalMoves}
                onValueChange={v => updateSetting('showLegalMoves', v)}
                trackColor={{ false: UI_COLORS.surfaceHighlight, true: UI_COLORS.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelCol}>
                <Text style={styles.switchTitle}>Allow Undo vs AI</Text>
                <Text style={styles.switchSub}>Permit undoing moves during single player matches</Text>
              </View>
              <Switch
                value={settings.allowUndoInAI}
                onValueChange={v => updateSetting('allowUndoInAI', v)}
                trackColor={{ false: UI_COLORS.surfaceHighlight, true: UI_COLORS.primary }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  appBarButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: UI_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
  },
  titleColumn: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: UI_COLORS.text,
  },
  screenSubtitle: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 40,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  choiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI_COLORS.surfaceHighlight,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  activeChoiceBtn: {
    backgroundColor: UI_COLORS.primary,
    borderColor: UI_COLORS.primary,
  },
  choiceBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: UI_COLORS.textMuted,
  },
  activeChoiceBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  levelsRow: {
    gap: 8,
    paddingVertical: 8,
  },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: UI_COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
    alignItems: 'center',
    minWidth: 70,
  },
  activeLevelChip: {
    backgroundColor: UI_COLORS.primary,
    borderColor: UI_COLORS.primary,
  },
  levelNum: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  activeLevelNum: {
    color: '#FFF',
  },
  levelName: {
    fontSize: 10,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  activeLevelName: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  difficultyDescBox: {
    backgroundColor: UI_COLORS.surfaceHighlight,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  diffDescTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.primary,
    marginBottom: 2,
  },
  diffDescBody: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    lineHeight: 18,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: UI_COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
    minWidth: '47%',
  },
  activeThemeCard: {
    borderColor: UI_COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  themePreviewRow: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  themeSquare: {
    width: 14,
    height: 14,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
    color: UI_COLORS.textMuted,
  },
  activeThemeName: {
    color: UI_COLORS.text,
    fontWeight: '700',
  },
  clockPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  clockChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: UI_COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
  },
  activeClockChip: {
    backgroundColor: UI_COLORS.primary,
    borderColor: UI_COLORS.primary,
  },
  clockChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: UI_COLORS.textMuted,
  },
  activeClockChipText: {
    color: '#FFF',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.surfaceHighlight,
  },
  switchLabelCol: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: UI_COLORS.text,
  },
  switchSub: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
});

