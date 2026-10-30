# Chess Master AI ♟️
### Complete Offline Chess Application for Apple iPhone 16 Pro Max

[![React Native](https://img.shields.io/badge/React%20Native-0.76.7-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo%20SDK-52.0-000020.svg?style=flat&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Target-iPhone%2016%20Pro%20Max%20%7C%20iOS%2018%2B-blue.svg?logo=apple)](https://apple.com)

---

## 📖 Executive Summary

**Chess Master AI** is a complete, production-ready, offline-first chess application engineered specifically for the **Apple iPhone 16 Pro Max** (and all modern iOS devices running iOS 18+).

Unlike shallow UI mockups or basic random-move demonstrators, **Chess Master AI** combines:
1. **Full FIDE Chess Rules Verification** via `chess.js` (Castling, En Passant, Pawn Promotion, Check, Checkmate, Stalemate, Threefold Repetition, 50-move rule, Insufficient Material).
2. **True Multi-Tiered Offline AI Opponents** (8 distinct skill levels from Beginner to Grandmaster) using Minimax with Alpha-Beta pruning, MVV-LVA move ordering, positional Piece-Square Tables (PST), blunder injection for lower levels, and quiescence search for masters.
3. **Optimized iPhone 16 Pro Max Layout** respecting safe areas, the Dynamic Island, and responsive touch targets with SVG pieces.
4. **Offline Tactical Puzzles & Interactive Chess Academy** for continuous training without requiring any internet connection.
5. **Local Persistent Storage** preserving games, match histories, PGN notations, and difficulty statistics.

---

## 🌟 Key Features

### 1. 🤖 8 Genuine AI Difficulty Levels
| Level | Title | Search Depth | Blunder Rate | Noise | Target Style |
|:---:|:---|:---:|:---:|:---:|:---|
| **1** | Beginner Bot | Depth 1 | 55% | 250 cp | Frequent inaccuracies; ideal for children & newcomers. |
| **2** | Apprentice Bot | Depth 2 | 35% | 160 cp | Simple captures; casual friendly. |
| **3** | Club Player | Depth 3 | 18% | 90 cp | Recognizes basic threats & undefended pieces. |
| **4** | Tactician Bot | Depth 4 | 5% | 40 cp | Piece development, king safety, basic tactics. |
| **5** | Strategist Bot | Depth 4 | 0% | 15 cp | Strong positional awareness, king protection. |
| **6** | Candidate Master | Depth 5 | 0% | 0 cp | Deep tactical foresight with quiescence search on captures. |
| **7** | International Master | Depth 5 | 0% | 0 cp | Move ordering + deep evaluation; requires sharp play. |
| **8** | Grandmaster AI | Depth 6 | 0% | 0 cp | Peak calculation strength & maximal tactical depth. |

### 2. 👥 Local Two-Player Mode (Pass & Play)
- Play with a friend on the same device.
- Optional automatic board flipping between turns.
- Independent player timers and turn indicators.

### 3. 🧩 Tactical Puzzles
- Categorized tactical challenges: **Mate-in-1, Mate-in-2, Forks, Pins, Skewers, and Endgames**.
- Interactive hint system and immediate move feedback.
- Solved badges saved to local persistent storage.

### 4. 🎓 Interactive Chess Academy (Training Mode)
- 13 structured offline lessons covering:
  - Piece Movements (Pawn, Knight, Bishop, Rook, Queen, King)
  - Special Rules (Castling, En Passant, Promotion)
  - Opening Principles (The 3 Golden Rules)
  - Core Tactics (Royal Fork, Absolute Pin)
  - Fundamental Endgames (The Ladder Mate)
- Interactive boards demonstrating each lesson concept.

### 5. ⏱️ Precision Chess Clocks
- Independent wall-clock calculation (`Date.now()` delta) immune to animation delays or app backgrounding.
- Presets: **Bullet 1m/2m, Blitz 3m/5m, Rapid 10m/15m, Classical 30m, and Custom**.
- Automatic timeout detection.

### 6. 🎨 Visual Customization & Themes
- **Board Themes:** Emerald Modern, Classic Walnut, Midnight Slate, Coral Sunset, Glacier Ice.
- **Audio & Haptics:** Realistic sound effects for moves, captures, checks, and mates, paired with iOS tactile haptic feedback.

---

## 🏗️ Architecture & Directory Structure

```
Chess/
├── app.json                   # Expo & iOS configuration (bundle identifier, orientation, icons)
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript strict configuration
├── jest.config.js             # Automated test configuration
├── App.tsx                    # Root application entry with stateful navigation
├── assets/                    # Application icons, launch splash, and graphics
├── __tests__/                 # Automated test suite
│   ├── chess_rules.test.ts    # Special moves, check, checkmate, stalemate, draws
│   ├── difficulty.test.ts     # Engine difficulty configs & tactical move verification
│   └── persistence.test.ts    # Save/resume, statistics & PGN verification
└── src/
    ├── chess/
    │   ├── ChessGameService.ts# chess.js wrapper: legal moves, FEN, PGN, undo/redo
    │   ├── ChessEngine.ts     # Minimax Alpha-Beta search, quiescence, MVV-LVA
    │   ├── DifficultyManager.ts# Levels 1 to 8 configuration parameters
    │   └── Evaluation.ts      # Centipawn material balance & Piece-Square Tables (PST)
    ├── components/
    │   ├── ChessBoard.tsx     # Responsive 8x8 Board with Dynamic Scaling
    │   ├── ChessSquare.tsx    # Square highlights, move dots, capture rings, check
    │   ├── ChessPiece.tsx     # Crisp vector SVG pieces for Retina display
    │   ├── ChessClock.tsx     # Precision game clocks with timeout triggers
    │   ├── MoveHistory.tsx    # Scrollable algebraic notation history
    │   ├── ThinkingIndicator.tsx# AI thinking status, search depth, and eval score
    │   └── PromotionModal.tsx # Pawn promotion dialog (Queen, Rook, Bishop, Knight)
    ├── data/
    │   ├── puzzles.ts         # Curated offline tactical puzzles
    │   └── lessons.ts         # Structured training academy lessons
    ├── screens/
    │   ├── MainMenuScreen.tsx # Dashboard, stats summary, quick start
    │   ├── GameScreen.tsx     # Active game interface (PvAI & Pass & Play)
    │   ├── PuzzlesScreen.tsx  # Interactive tactical puzzles
    │   ├── TrainingScreen.tsx # Chess academy lessons
    │   ├── HistoryScreen.tsx  # Match archive with move-by-move replay
    │   ├── StatisticsScreen.tsx# Analytics and win rates by difficulty
    │   └── SettingsScreen.tsx # Customization for board, audio, haptics, clock
    ├── services/
    │   ├── AudioService.ts    # Move, capture, check, and game-over sounds
    │   └── HapticsService.ts  # iOS tactile haptic feedback
    ├── storage/
    │   └── StorageService.ts  # AsyncStorage wrapper for games, stats, and settings
    ├── theme/
    │   └── colors.ts          # Color schemes and board themes
    └── types/
        └── chess.ts           # Type definitions
```

---

## 💻 Windows 11 Development Setup

All commands below are fully compatible with **PowerShell on Windows 11**:

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x LTS` installed ([nodejs.org](https://nodejs.org))
- **Git for Windows**: ([git-scm.com](https://git-scm.com))

### 2. Install Dependencies
```powershell
npm install
```

### 3. Run Automated Tests
```powershell
npm test
```
*Executes all 16 automated tests verifying chess rules, castling, en passant, promotion, draws, AI difficulty configs, and game persistence.*

### 4. Start Development Server
```powershell
npx expo start
```
- Press `w` in PowerShell to run in your web browser.
- Scan the QR code with the **Expo Go** app on your physical iPhone 16 Pro Max to test immediately on device!

---

## 📱 Cloud-Based iOS Build Instructions (EAS Build)

Because development is on **Windows 11**, you can build native iOS binaries directly in the cloud using **EAS (Expo Application Services)** without needing a local Mac or Xcode.

### Step 1: Install EAS CLI
```powershell
npm install -g eas-cli
```

### Step 2: Log In to Your Expo Account
```powershell
eas login
```
*(If you do not have an account, create a free one at [expo.dev](https://expo.dev)).*

### Step 3: Configure Project for Cloud Builds
```powershell
eas build:configure
```

### Step 4: Run Cloud iOS Build
To build an iOS IPA for internal testing on your iPhone 16 Pro Max:
```powershell
eas build --platform ios --profile preview
```
To build an App Store release build:
```powershell
eas build --platform ios --profile production
```

EAS manages certificates, provisioning profiles, and compiles the IPA in the cloud. Once finished, you will receive a QR code and download link for installation.

---

## 🚀 Connecting to GitHub Repository

To push the project to your GitHub account (`https://github.com/rafaelcanete14`):

```powershell
# 1. Stage all project files
git add .

# 2. Create the initial commit
git commit -m "Initial commit: Complete Chess Master AI with offline engine, puzzles, and academy"

# 3. Add remote pointing to your GitHub repository
git remote add origin https://github.com/rafaelcanete14/chess-master-ai.git

# 4. Push to main branch
git push -u origin main
```

*(Note: Create an empty repository named `chess-master-ai` on GitHub first before running `git push`.)*

---

## 🍎 App Store Preparation Checklist

- [x] **Bundle Identifier:** Configured as `com.rafaelcanete14.chessmasterai` in `app.json`.
- [x] **Privacy Disclosures:** Zero tracking, zero ads, no third-party data transmission. 100% offline gameplay.
- [x] **Safe Area Handling:** Fully compatible with Dynamic Island and home indicator on iPhone 16 Pro Max.
- [x] **Non-Exempt Encryption:** Set `ITSAppUsesNonExemptEncryption: false` in `app.json`.
- [x] **Retina Assets:** Responsive SVG pieces rendered dynamically for ultra-sharp high-DPI clarity.

---

## 📄 License
This project is open-source under the MIT License.

#   c h e s s - m a s t e r - a i  
 