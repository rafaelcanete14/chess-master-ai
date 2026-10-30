import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { PuzzlesScreen } from './src/screens/PuzzlesScreen';
import { TrainingScreen } from './src/screens/TrainingScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { StatisticsScreen } from './src/screens/StatisticsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { GameMode, DifficultyLevel } from './src/types/chess';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('menu');
  const [gameParams, setGameParams] = useState<{ mode: GameMode; difficulty?: DifficultyLevel }>({
    mode: 'ai',
    difficulty: 4,
  });

  const handleNavigate = (screen: string, params?: { mode?: GameMode; difficulty?: DifficultyLevel }) => {
    if (params) {
      setGameParams({
        mode: params.mode || 'ai',
        difficulty: params.difficulty || 4,
      });
    }
    setCurrentScreen(screen);
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {currentScreen === 'menu' && <MainMenuScreen onNavigate={handleNavigate} />}
      {currentScreen === 'game' && (
        <GameScreen
          mode={gameParams.mode}
          difficulty={gameParams.difficulty}
          onBack={handleBackToMenu}
        />
      )}
      {currentScreen === 'puzzles' && <PuzzlesScreen onBack={handleBackToMenu} />}
      {currentScreen === 'training' && <TrainingScreen onBack={handleBackToMenu} />}
      {currentScreen === 'history' && <HistoryScreen onBack={handleBackToMenu} />}
      {currentScreen === 'statistics' && <StatisticsScreen onBack={handleBackToMenu} />}
      {currentScreen === 'settings' && <SettingsScreen onBack={handleBackToMenu} />}
    </SafeAreaProvider>
  );
}
