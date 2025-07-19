import { useState } from 'react'
import { useGame } from '../contexts/GameContext'
import LevelSelector from './LevelSelector'
import './UI.css'
export default function UI({ currentView, setCurrentView }) {
  const { 
    state, 
    startGame, 
    nextLevel, 
    restartLevel, 
    pauseGame, 
    resumeGame, 
    getCurrentLevel,
    getAllLevels,
    getFormattedTime,
    isGameComplete,
    setCurrentLevel 
  } = useGame()
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const currentLevel = getCurrentLevel()
  const allLevels = getAllLevels()
  const handleNextLevel = () => {
    if (isGameComplete()) {
      setCurrentView('victory')
    } else {
      nextLevel()
    }
  }
  const handlePauseResume = () => {
    if (state.gameStatus === 'playing') {
      pauseGame()
    } else if (state.gameStatus === 'paused') {
      resumeGame()
    }
  }
  const exportLevel = () => {
    const levelData = JSON.stringify(currentLevel, null, 2)
    const blob = new Blob([levelData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentLevel.name.replace(/\s+/g, '_')}_level.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const importLevel = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const levelData = JSON.parse(e.target.result)
          if (levelData.maze && levelData.maze.walls && levelData.maze.targets) {
            console.log('Imported level:', levelData)
            alert('Level imported successfully! You can now use it in the Level Editor.')
            const existingLevels = JSON.parse(localStorage.getItem('importedLevels') || '[]')
            existingLevels.push(levelData)
            localStorage.setItem('importedLevels', JSON.stringify(existingLevels))
          } else {
            alert('Invalid level file format - missing required maze structure')
          }
        } catch (error) {
          alert('Invalid level file format - not a valid JSON')
        }
      }
      reader.readAsText(file)
    }
  }
  const shareLevel = () => {
    const levelData = JSON.stringify(currentLevel)
    const shareUrl = `${window.location.origin}?level=${encodeURIComponent(levelData)}`
    if (navigator.share) {
      navigator.share({
        title: `Maze Ball - ${currentLevel.name}`,
        text: `Check out this custom maze level: ${currentLevel.name}`,
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Level link copied to clipboard!')
      })
    }
  }
  return (
    <div className="ui-overlay">
      {/* Top HUD */}
      <div className="top-hud">
        <div className="hud-left">
          <div className="stat-item">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{getFormattedTime()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rotation:</span>
            <span className="stat-value">
              {state.mazeRotation.rotation
                ? (((state.mazeRotation.rotation * 180 / Math.PI) % 360 + 360) % 360).toFixed(1) + '°'
                : '0.0°'}
            </span>
          </div>
        </div>
        <div className="hud-center">
          <h2 className="level-title">{currentLevel.name}</h2>
          <div className="level-description">{currentLevel.description}</div>
        </div>
        <div className="hud-right">
          <div className="stat-item">
            <span className="stat-label">Level:</span>
            <span className="stat-value">{state.currentLevel + 1}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Targets:</span>
            <span className="stat-value">{state.levelStats.collectedTargets/2}/{state.levelStats.totalTargets}</span>
          </div>
        </div>
      </div>
      {/* Game Controls */}
      <div className="game-controls">
        <button 
          className="control-btn"
          onClick={handlePauseResume}
          disabled={state.gameStatus === 'lost' || state.gameStatus === 'won'}
        >
          {state.gameStatus === 'playing' ? '⏸️ Pause' : '▶️ Resume'}
        </button>
        <button 
          className="control-btn"
          onClick={restartLevel}
        >
          🔄 Restart
        </button>
        <button 
          className="control-btn"
          onClick={() => setShowLevelSelector(!showLevelSelector)}
        >
          📋 Levels
        </button>
        <button 
          className="control-btn"
          onClick={() => setCurrentView('editor')}
        >
          🛠️ Editor
        </button>
        <button 
          className="control-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️ Settings
        </button>
      </div>
      {/* Level Complete Modal */}
      {state.gameStatus === 'won' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🎉 Level Complete!</h2>
            <div className="level-stats">
              <p>Time: {getFormattedTime()}</p>
              <p>Targets Collected: {state.levelStats.collectedTargets/2}</p>
            </div>
            <div className="modal-buttons">
              <button 
                className="btn btn-primary"
                onClick={handleNextLevel}
                disabled={isGameComplete()}
              >
                {isGameComplete() ? '🏆 Game Complete!' : '➡️ Next Level'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={restartLevel}
              >
                🔄 Replay
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Game Over Modal */}
      {state.gameStatus === 'lost' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>💀 Game Over</h2>
            <div className="level-stats">
              <p>Level Reached: {state.currentLevel + 1}</p>
              <p>Time Played: {getFormattedTime()}</p>
            </div>
            <div className="modal-buttons">
              <button 
                className="btn btn-primary"
                onClick={startGame}
              >
                🎮 New Game
              </button>
              <button 
                className="btn btn-secondary"
                onClick={restartLevel}
              >
                🔄 Retry Level
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pause Modal */}
      {state.gameStatus === 'paused' && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>⏸️ Game Paused</h2>
            <div className="modal-buttons">
              <button 
                className="btn btn-primary"
                onClick={resumeGame}
              >
                ▶️ Resume
              </button>
              <button 
                className="btn btn-secondary"
                onClick={restartLevel}
              >
                🔄 Restart Level
              </button>
              <button 
                className="btn btn-secondary"
                onClick={startGame}
              >
                🎮 New Game
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Level Selector */}
      {showLevelSelector && (
        <LevelSelector 
          onClose={() => setShowLevelSelector(false)}
          onLevelSelect={(levelIndex) => {
            setShowLevelSelector(false)
            const selectedLevel = allLevels[levelIndex]
            if (selectedLevel) {
              setCurrentLevel(levelIndex, selectedLevel?.maze?.targets?.length || 0)
            }
          }}
        />
      )}
      {/* Settings Panel */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>⚙️ Settings</h2>
            <div className="settings-content">
              <div className="settings-section">
                <h3>Level Sharing</h3>
                <button className="btn btn-secondary" onClick={exportLevel}>
                  📤 Export Level
                </button>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={importLevel}
                  style={{ display: 'none' }}
                  id="level-import"
                />
                <label htmlFor="level-import" className="btn btn-secondary">
                  📥 Import Level
                </label>
                <button className="btn btn-secondary" onClick={shareLevel}>
                  🔗 Share Level
                </button>
              </div>
              <div className="settings-section">
                <h3>Game Info</h3>
                <p>Use mouse or WASD keys to tilt the maze</p>
                <p>Collect all targets to complete the level</p>
                <p>Spacebar to level the maze</p>
              </div>
            </div>
            <div className="modal-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => setShowSettings(false)}
              >
                ✅ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
