import { useState } from 'react'
import GameScene from './components/GameScene'
import UI from './components/UI'
import LevelEditor from './components/LevelEditor'
import { GameProvider } from './contexts/GameContext'
import './App.css'
function App() {
  const [currentView, setCurrentView] = useState('game') 
  return (
    <GameProvider>
      <div className="app">
        <div className="game-container">
          <GameScene />
          <UI currentView={currentView} setCurrentView={setCurrentView} />
          {currentView === 'editor' && <LevelEditor setCurrentView={setCurrentView} />}
        </div>
      </div>
    </GameProvider>
  )
}
export default App
