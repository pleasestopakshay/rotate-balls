import { useState, useEffect, useRef } from 'react'
import { useGame } from '../contexts/GameContext'
import { createEmptyLevel, validateLevel } from '../data/levels'
import './LevelEditor.css'
function GameLikePreview({ maze }) {
  const canvasRef = useRef()
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const CELL_SIZE = 40
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(scale, scale)
    const mazePixelWidth = maze.width * CELL_SIZE
    const mazePixelHeight = maze.height * CELL_SIZE
    const offsetX = -mazePixelWidth / 2
    const offsetY = -mazePixelHeight / 2
    ctx.translate(offsetX, offsetY)
    ctx.fillStyle = '#2c3e50'
    ctx.fillRect(0, 0, mazePixelWidth, mazePixelHeight)
    ctx.fillStyle = '#34495e'
    ctx.strokeStyle = '#2c3e50'
    ctx.lineWidth = 2
    maze.walls.forEach(wall => {
      const x = wall.x * CELL_SIZE
      const y = wall.z * CELL_SIZE
      const width = wall.width * CELL_SIZE
      const height = wall.height * CELL_SIZE
      ctx.fillRect(x, y, width, height)
      ctx.strokeRect(x, y, width, height)
    })
    const startX = (maze.startPosition.x + 0.5) * CELL_SIZE
    const startY = (maze.startPosition.z + 0.5) * CELL_SIZE
    ctx.beginPath()
    ctx.arc(startX, startY, 25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'
    ctx.fill()
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])
    maze.targets.forEach(target => {
      const targetX = (target.x + 0.5) * CELL_SIZE
      const targetY = (target.z + 0.5) * CELL_SIZE
      const gradient = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 15)
      gradient.addColorStop(0, target.color)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(targetX, targetY, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = target.color
      ctx.beginPath()
      ctx.arc(targetX, targetY, 8, 0, Math.PI * 2)
      ctx.fill()
    })
    const ballX = (maze.startPosition.x + 0.5) * CELL_SIZE
    const ballY = (maze.startPosition.z + 0.5) * CELL_SIZE
    const ballGradient = ctx.createRadialGradient(ballX - 3, ballY - 3, 0, ballX, ballY, 10)
    ballGradient.addColorStop(0, '#ffffff')
    ballGradient.addColorStop(1, '#3498db')
    ctx.fillStyle = ballGradient
    ctx.beginPath()
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#2980b9'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }, [maze, scale])
  return (
    <div className="game-like-preview">
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
        }}
      />
      <div className="preview-controls">
        <button onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}>🔍-</button>
        <span>Zoom: {(scale * 100).toFixed(0)}%</span>
        <button onClick={() => setScale(prev => Math.min(2, prev + 0.1))}>🔍+</button>
      </div>
    </div>
  )
}
export default function LevelEditor({ setCurrentView }) {
  const { addCustomLevel } = useGame()
  const [level, setLevel] = useState(() => createEmptyLevel())
  const [selectedTool, setSelectedTool] = useState('wall')
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#ff0000')
  const [showPreview, setShowPreview] = useState(false)
  const tools = [
    { id: 'wall', name: 'Wall', icon: '🧱' },
    { id: 'target', name: 'Target', icon: '🎯' },
    { id: 'start', name: 'Start', icon: '🔵' },
    { id: 'erase', name: 'Erase', icon: '🧹' }
  ]
  const targetColors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'
  ]
  useEffect(() => {
    const importedLevels = JSON.parse(localStorage.getItem('importedLevels') || '[]')
    if (importedLevels.length > 0) {
      console.log('Available imported levels:', importedLevels)
    }
  }, [])
  const handleSizeChange = (dimension, value) => {
    const newSize = Math.max(5, Math.min(20, parseInt(value) || 10))
    setLevel(prev => ({
      ...prev,
      maze: {
        ...prev.maze,
        [dimension]: newSize,
        walls: [
          { x: 0, z: 0, width: dimension === 'width' ? newSize : prev.maze.width, height: 1, wallHeight: 1 },
          { x: 0, z: dimension === 'height' ? newSize - 1 : prev.maze.height - 1, width: dimension === 'width' ? newSize : prev.maze.width, height: 1, wallHeight: 1 },
          { x: 0, z: 0, width: 1, height: dimension === 'height' ? newSize : prev.maze.height, wallHeight: 1 },
          { x: dimension === 'width' ? newSize - 1 : prev.maze.width - 1, z: 0, width: 1, height: dimension === 'height' ? newSize : prev.maze.height, wallHeight: 1 }
        ]
      }
    }))
  }
  const handleCellClick = (x, z) => {
    switch (selectedTool) {
      case 'wall':
        addWall(x, z)
        break
      case 'target':
        addTarget(x, z)
        break
      case 'start':
        setStartPosition(x, z)
        break
      case 'erase':
        eraseAt(x, z)
        break
    }
  }
  const testLevel = () => {
    if (!validateLevel(level)) {
      alert('Please fix level errors before testing!')
      return
    }
    if (level.maze.targets.length === 0) {
      alert('Please add at least one target!')
      return
    }
    const testLevelData = {
      ...level,
      id: 'test-level',
      name: level.name || 'Test Level',
      description: level.description || 'Testing level',
      difficulty: 'Test'
    }
    localStorage.setItem('testLevel', JSON.stringify(testLevelData))
    alert('Level ready for testing! Returning to game...')
    setCurrentView('game')
  }
  const addWall = (x, z) => {
    setLevel(prev => ({
      ...prev,
      maze: {
        ...prev.maze,
        walls: [...prev.maze.walls, { x, z, width: 1, height: 1, wallHeight: 1 }]
      }
    }))
  }
  const addTarget = (x, z) => {
    const points = Math.floor(Math.random() * 200) + 100
    setLevel(prev => ({
      ...prev,
      maze: {
        ...prev.maze,
        targets: [...prev.maze.targets, { x, z, points, color: selectedColor }]
      }
    }))
  }
  const setStartPosition = (x, z) => {
    setLevel(prev => ({
      ...prev,
      maze: {
        ...prev.maze,
        startPosition: { x, z }
      }
    }))
  }
  const eraseAt = (x, z) => {
    setLevel(prev => ({
      ...prev,
      maze: {
        ...prev.maze,
        walls: prev.maze.walls.filter(wall => 
          !(wall.x === x && wall.z === z && wall.width === 1 && wall.height === 1)
        ),
        targets: prev.maze.targets.filter(target => 
          !(target.x === x && target.z === z)
        )
      }
    }))
  }
  const getCellContent = (x, z) => {
    const wall = level.maze.walls.find(w => 
      x >= w.x && x < w.x + w.width && z >= w.z && z < w.z + w.height
    )
    const target = level.maze.targets.find(t => t.x === x && t.z === z)
    const isStart = level.maze.startPosition.x === x && level.maze.startPosition.z === z
    return { wall, target, isStart }
  }
  const saveLevel = () => {
    if (!validateLevel(level)) {
      alert('Invalid level! Please check your level configuration.')
      return
    }
    if (level.maze.targets.length === 0) {
      alert('Please add at least one target!')
      return
    }
    const levelToSave = {
      ...level,
      id: Date.now(),
      name: level.name || 'Custom Level',
      description: level.description || 'A custom created level',
      difficulty: 'Custom'
    }
    addCustomLevel(levelToSave)
    alert('Level saved successfully! You can now play it by selecting it from the level selector.')
    if (confirm('Would you like to start creating a new level?')) {
      setLevel(createEmptyLevel())
    }
  }
  const loadLevel = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const levelData = JSON.parse(e.target.result)
          if (validateLevel(levelData)) {
            setLevel(levelData)
            alert('Level loaded successfully!')
          } else {
            alert('Invalid level file format!')
          }
        } catch (error) {
          alert('Error reading level file!')
        }
      }
      reader.readAsText(file)
    }
  }
  const loadImportedLevel = (levelData) => {
    if (validateLevel(levelData)) {
      setLevel(levelData)
      alert('Level loaded successfully!')
    } else {
      alert('Invalid level format!')
    }
  }
  const exportLevel = () => {
    if (!validateLevel(level)) {
      alert('Please fix level errors before exporting!')
      return
    }
    const levelData = JSON.stringify(level, null, 2)
    const blob = new Blob([levelData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${level.name.replace(/\s+/g, '_')}_level.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const clearLevel = () => {
    if (confirm('Are you sure you want to clear the level?')) {
      setLevel(createEmptyLevel())
    }
  }
  const renderGrid = () => {
    const cells = []
    for (let z = 0; z < level.maze.height; z++) {
      for (let x = 0; x < level.maze.width; x++) {
        const { wall, target, isStart } = getCellContent(x, z)
        cells.push(
          <div
            key={`${x}-${z}`}
            className={`grid-cell ${wall ? 'wall' : ''} ${target ? 'target' : ''} ${isStart ? 'start' : ''}`}
            style={{
              backgroundColor: target ? target.color : wall ? '#666' : isStart ? '#00ff00' : '#333'
            }}
            onClick={() => handleCellClick(x, z)}
            onMouseEnter={() => isDrawing && handleCellClick(x, z)}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
          >
            {isStart && '🔵'}
            {target && '🎯'}
            {wall && '🧱'}
          </div>
        )
      }
    }
    return cells
  }
  return (
    <div className="level-editor">
      <div className="editor-header">
        <div className="editor-header-left">
          <h2>🛠️ Level Editor</h2>
          <button 
            className="exit-btn"
            onClick={() => setCurrentView('game')}
            title="Exit Level Editor"
          >
            ← Back to Game
          </button>
        </div>
        <div className="editor-controls">
          <input
            type="text"
            placeholder="Level Name"
            value={level.name}
            onChange={(e) => setLevel(prev => ({ ...prev, name: e.target.value }))}
            className="level-name-input"
          />
          <input
            type="text"
            placeholder="Description"
            value={level.description}
            onChange={(e) => setLevel(prev => ({ ...prev, description: e.target.value }))}
            className="level-description-input"
          />
        </div>
      </div>
      <div className="editor-body">
        <div className="editor-sidebar">
          <div className="tool-section">
            <h3>🔧 Tools</h3>
            <div className="tool-buttons">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  {tool.icon} {tool.name}
                </button>
              ))}
            </div>
          </div>
          {selectedTool === 'target' && (
            <div className="color-section">
              <h3>🎨 Target Color</h3>
              <div className="color-palette">
                {targetColors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="settings-section">
            <h3>⚙️ Settings</h3>
            <div className="setting-item">
              <label>Width:</label>
              <input
                type="number"
                min="5"
                max="20"
                value={level.maze.width}
                onChange={(e) => handleSizeChange('width', e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>Height:</label>
              <input
                type="number"
                min="5"
                max="20"
                value={level.maze.height}
                onChange={(e) => handleSizeChange('height', e.target.value)}
              />
            </div>
          </div>
          <div className="action-section">
            <h3>💾 Actions</h3>
            <button className="action-btn test" onClick={testLevel}>
              🎮 Test Level
            </button>
            <button className="action-btn" onClick={saveLevel}>
              💾 Save Level
            </button>
            <button className="action-btn" onClick={exportLevel}>
              📤 Export JSON
            </button>
            <input
              type="file"
              accept=".json"
              onChange={loadLevel}
              style={{ display: 'none' }}
              id="level-load"
            />
            <label htmlFor="level-load" className="action-btn">
              📥 Load JSON
            </label>
            <button className="action-btn danger" onClick={clearLevel}>
              🗑️ Clear
            </button>
          </div>
          <div className="imported-levels-section">
            <h3>📥 Imported Levels</h3>
            <div className="imported-levels-list">
              {(() => {
                const importedLevels = JSON.parse(localStorage.getItem('importedLevels') || '[]')
                return importedLevels.length > 0 ? importedLevels.map((importedLevel, index) => (
                  <div key={index} className="imported-level-item">
                    <span className="imported-level-name">{importedLevel.name || `Level ${index + 1}`}</span>
                    <button 
                      className="action-btn small"
                      onClick={() => loadImportedLevel(importedLevel)}
                    >
                      📂 Load
                    </button>
                  </div>
                )) : (
                  <p className="no-imported-levels">No imported levels. Use Settings → Import Level to add levels.</p>
                )
              })()}
            </div>
          </div>
          <div className="stats-section">
            <h3>📊 Level Stats</h3>
            <div className="stat-item">
              <span>Walls: {level.maze.walls.length}</span>
            </div>
            <div className="stat-item">
              <span>Targets: {level.maze.targets.length}</span>
            </div>
            <div className="stat-item">
              <span>Total Points: {level.maze.targets.reduce((sum, t) => sum + t.points, 0)}</span>
            </div>
            <div className="stat-item">
              <span>Avg Points: {level.maze.targets.length > 0 ? Math.round(level.maze.targets.reduce((sum, t) => sum + t.points, 0) / level.maze.targets.length) : 0}</span>
            </div>
          </div>
        </div>
        <div className="editor-canvas">
          <div className="canvas-header">
            <h3>🎯 Level Design</h3>
            <div className="canvas-controls">
              <button 
                className="preview-btn"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? '✏️ Edit' : '👁️ Preview'}
              </button>
            </div>
          </div>
          {showPreview ? (
            <div className="preview-container">
              <GameLikePreview maze={level.maze} />
            </div>
          ) : (
            <div 
              className="grid-container"
              style={{
                gridTemplateColumns: `repeat(${level.maze.width}, 1fr)`,
                gridTemplateRows: `repeat(${level.maze.height}, 1fr)`
              }}
            >
              {renderGrid()}
            </div>
          )}
        </div>
      </div>
      <div className="editor-instructions">
        <p>🧱 Click to place walls | 🎯 Click to place targets | 🔵 Click to set start position | 🧹 Click to erase</p>
        <p>Hold and drag to draw multiple cells</p>
      </div>
    </div>
  )
}
