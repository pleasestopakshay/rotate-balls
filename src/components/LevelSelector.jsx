import { useState } from 'react'
import { useGame } from '../contexts/GameContext'
import './LevelSelector.css'
export default function LevelSelector({ onClose, onLevelSelect }) {
  const { state, getAllLevels } = useGame()
  const [selectedTab, setSelectedTab] = useState('default')
  const allLevels = getAllLevels()
  const defaultLevels = state.levels
  const customLevels = state.customLevels
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4CAF50'
      case 'medium': return '#FF9800'
      case 'hard': return '#F44336'
      default: return '#2196F3'
    }
  }
  const renderLevelCard = (level, index, isCustom = false) => {
    const actualIndex = isCustom ? defaultLevels.length + index : index
    const isCurrentLevel = actualIndex === state.currentLevel
    const isUnlocked = actualIndex <= state.currentLevel || (actualIndex === state.currentLevel + 1 && !isCustom) || isCustom
    // const isUnlocked = true
        return (
      <div 
        key={`${isCustom ? 'custom' : 'default'}-${level.id}`}
        className={`level-card ${isCurrentLevel ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`}
        onClick={() => {
          if (isUnlocked) {
            onLevelSelect(actualIndex)
          } else {
            alert('🔒 This level is locked! Complete the previous levels first.')
          }
        }}
      >
        <div className="level-header">
          <div className="level-number">{actualIndex + 1}</div>
          <div 
            className="level-difficulty"
            style={{ backgroundColor: getDifficultyColor(level.difficulty) }}
          >
            {level.difficulty}
          </div>
        </div>
        <div className="level-content">
          <h3 className="level-name">{level.name}</h3>
          <p className="level-description">{level.description}</p>
          <div className="level-info">
            <div className="info-item">
              <span className="info-label">Size:</span>
              <span className="info-value">{level.maze.width}×{level.maze.height}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Targets:</span>
              <span className="info-value">{level.maze.targets.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Walls:</span>
              <span className="info-value">{level.maze.walls.length}</span>
            </div>
          </div>
          {isCustom && (
            <div className="custom-level-badge">
              🛠️ Custom
            </div>
          )}
          {!isUnlocked && (
            <div className="locked-overlay">
              🔒 Locked
            </div>
          )}
          {isCurrentLevel && (
            <div className="current-level-badge">
              ▶️ Current
            </div>
          )}
        </div>
        <div className="level-preview">
          <LevelPreview maze={level.maze} />
        </div>
      </div>
    )
  }
  return (
    <div className="modal-overlay">
      <div className="modal level-selector-modal">
        <div className="modal-header">
          <h2>📋 Level Selection</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="level-tabs">
          <button 
            className={`tab ${selectedTab === 'default' ? 'active' : ''}`}
            onClick={() => setSelectedTab('default')}
          >
            🎯 Default Levels ({defaultLevels.length})
          </button>
          <button 
            className={`tab ${selectedTab === 'custom' ? 'active' : ''}`}
            onClick={() => setSelectedTab('custom')}
          >
            🛠️ Custom Levels ({customLevels.length})
          </button>
        </div>
        <div className="level-selector-content">
          {selectedTab === 'default' && (
            <div className="level-grid">
              {defaultLevels.map((level, index) => renderLevelCard(level, index, false))}
            </div>
          )}
          {selectedTab === 'custom' && (
            <div className="level-grid">
              {customLevels.length > 0 ? (
                customLevels.map((level, index) => renderLevelCard(level, index, true))
              ) : (
                <div className="no-custom-levels">
                  <p>No custom levels yet!</p>
                  <p>Use the Level Editor to create your own levels.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <div className="level-info-summary">
            <span>Progress: {state.currentLevel + 1}/{allLevels.length}</span>
            <span>Score: {state.score.toLocaleString()}</span>
            <span>Lives: {state.lives}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
function LevelPreview({ maze }) {
  const cellSize = 4
  const previewSize = Math.max(maze.width, maze.height) * cellSize
  return (
    <div 
      className="level-preview-container"
      style={{
        width: `${previewSize}px`,
        height: `${previewSize}px`,
        maxWidth: '100px',
        maxHeight: '100px'
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${maze.width * cellSize} ${maze.height * cellSize}`}
      >
        {/* Floor */}
        <rect 
          x="0" 
          y="0" 
          width={maze.width * cellSize} 
          height={maze.height * cellSize} 
          fill="#333" 
        />
        {/* Walls */}
        {maze.walls.map((wall, index) => (
          <rect
            key={index}
            x={wall.x * cellSize}
            y={wall.z * cellSize}
            width={wall.width * cellSize}
            height={wall.height * cellSize}
            fill="#666"
            stroke="#555"
            strokeWidth="0.5"
          />
        ))}
        {/* Start position */}
        <circle
          cx={maze.startPosition.x * cellSize + cellSize / 2}
          cy={maze.startPosition.z * cellSize + cellSize / 2}
          r={cellSize / 4}
          fill="#00ff00"
        />
        {/* Targets */}
        {maze.targets.map((target, index) => (
          <circle
            key={index}
            cx={target.x * cellSize + cellSize / 2}
            cy={target.z * cellSize + cellSize / 2}
            r={cellSize / 6}
            fill={target.color}
          />
        ))}
      </svg>
    </div>
  )
}
