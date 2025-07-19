import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { defaultLevels } from '../data/levels'
const GameContext = createContext()
const initialState = {
  currentLevel: 0,
  score: 0,
  lives: 3,
  gameStatus: 'playing',
  levels: defaultLevels,
  customLevels: [],
  ballPosition: { x: 0, y: 0.5, z: 0 },
  mazeRotation: { rotation: 0 },
  isMoving: false,
  timeElapsed: 0,
  levelStats: {
    levelStartTime: Date.now(),
    collectedTargets: 0,
    totalTargets: 0
  }
}
function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameStatus: 'playing',
        score: 0,
        lives: 3,
        currentLevel: 0,
        timeElapsed: 0,
        levelStats: {
          levelStartTime: Date.now(),
          collectedTargets: 0,
          totalTargets: action.totalTargets || 0
        }
      }
    case 'NEXT_LEVEL':
      return {
        ...state,
        currentLevel: state.currentLevel + 1,
        ballPosition: { x: 0, y: 0.5, z: 0 },
        mazeRotation: { rotation: 0 },
        gameStatus: 'playing',
        levelStats: {
          levelStartTime: Date.now(),
          collectedTargets: 0,
          totalTargets: action.totalTargets || 0
        }
      }
    case 'RESTART_LEVEL':
      return {
        ...state,
        ballPosition: { x: 0, y: 0.5, z: 0 },
        mazeRotation: { rotation: 0 },
        gameStatus: 'playing',
        levelStats: {
          ...state.levelStats,
          levelStartTime: Date.now(),
          collectedTargets: 0,
          totalTargets: action.totalTargets || state.levelStats.totalTargets
        }
      }
    case 'UPDATE_BALL_POSITION':
      return {
        ...state,
        ballPosition: action.position,
        isMoving: action.isMoving
      }
    case 'UPDATE_MAZE_ROTATION':
      return {
        ...state,
        mazeRotation: action.rotation
      }
    case 'COLLECT_TARGET':
      const newCollectedTargets = state.levelStats.collectedTargets + 1
      const pointsEarned = action.points || 100
      const newScore = state.score + pointsEarned
      return {
        ...state,
        score: newScore,
        levelStats: {
          ...state.levelStats,
          collectedTargets: newCollectedTargets
        }
      }
    case 'LOSE_LIFE':
      const newLives = state.lives - 1
      return {
        ...state,
        lives: newLives,
        gameStatus: newLives <= 0 ? 'lost' : 'playing'
      }
    case 'WIN_LEVEL':
      const timeElapsed = Date.now() - state.levelStats.levelStartTime
      const timeBonus = Math.max(0, Math.floor((30000 - timeElapsed) / 1000))
      const completionBonus = state.levelStats.collectedTargets * 50
      return {
        ...state,
        score: state.score + timeBonus + completionBonus,
        gameStatus: 'won'
      }
    case 'PAUSE_GAME':
      return {
        ...state,
        gameStatus: 'paused'
      }
    case 'RESUME_GAME':
      return {
        ...state,
        gameStatus: 'playing'
      }
    case 'ADD_CUSTOM_LEVEL':
      return {
        ...state,
        customLevels: [...state.customLevels, action.level]
      }
    case 'LOAD_CUSTOM_LEVELS':
      return {
        ...state,
        customLevels: action.levels
      }
    case 'SET_CURRENT_LEVEL':
      return {
        ...state,
        currentLevel: action.levelIndex,
        ballPosition: { x: 0, y: 0.5, z: 0 },
        mazeRotation: { rotation: 0 },
        gameStatus: 'playing',
        levelStats: {
          levelStartTime: Date.now(),
          collectedTargets: 0,
          totalTargets: action.totalTargets || 0
        }
      }
    case 'UPDATE_TIME':
      return {
        ...state,
        timeElapsed: action.time
      }
    default:
      return state
  }
}
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  useEffect(() => {
    const savedCustomLevels = localStorage.getItem('mazeBallCustomLevels')
    if (savedCustomLevels) {
      try {
        const levels = JSON.parse(savedCustomLevels)
        dispatch({ type: 'LOAD_CUSTOM_LEVELS', levels })
      } catch (error) {
        console.error('Error loading custom levels:', error)
      }
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('mazeBallCustomLevels', JSON.stringify(state.customLevels))
  }, [state.customLevels])
  useEffect(() => {
    let interval
    if (state.gameStatus === 'playing') {
      interval = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME', time: Date.now() - state.levelStats.levelStartTime })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [state.gameStatus, state.levelStats.levelStartTime])
  const startGame = useCallback(() => {
    const firstLevel = [...state.levels, ...state.customLevels][0]
    const totalTargets = firstLevel?.maze?.targets?.length || 0
    dispatch({ type: 'START_GAME', totalTargets })
  }, [state.levels, state.customLevels])
  const nextLevel = useCallback(() => {
    const allLevels = [...state.levels, ...state.customLevels]
    const nextLevelData = allLevels[state.currentLevel + 1]
    const totalTargets = nextLevelData?.maze?.targets?.length || 0
    dispatch({ type: 'NEXT_LEVEL', totalTargets })
  }, [state.levels, state.customLevels, state.currentLevel])
  const restartLevel = useCallback(() => {
    const allLevels = [...state.levels, ...state.customLevels]
    const currentLevelData = allLevels[state.currentLevel]
    const totalTargets = currentLevelData?.maze?.targets?.length || 0
    dispatch({ type: 'RESTART_LEVEL', totalTargets })
  }, [state.levels, state.customLevels, state.currentLevel])
  const updateBallPosition = useCallback((position, isMoving) => dispatch({ type: 'UPDATE_BALL_POSITION', position, isMoving }), [])
  const updateMazeRotation = useCallback((rotation) => dispatch({ type: 'UPDATE_MAZE_ROTATION', rotation }), [])
  const collectTarget = useCallback((points) => dispatch({ type: 'COLLECT_TARGET', points }), [])
  const loseLife = useCallback(() => dispatch({ type: 'LOSE_LIFE' }), [])
  const winLevel = useCallback(() => dispatch({ type: 'WIN_LEVEL' }), [])
  const pauseGame = useCallback(() => dispatch({ type: 'PAUSE_GAME' }), [])
  const resumeGame = useCallback(() => dispatch({ type: 'RESUME_GAME' }), [])
  const addCustomLevel = useCallback((level) => dispatch({ type: 'ADD_CUSTOM_LEVEL', level }), [])
  const setCurrentLevel = useCallback((levelIndex, totalTargets) => dispatch({ type: 'SET_CURRENT_LEVEL', levelIndex, totalTargets }), [])
  const getCurrentLevel = useCallback(() => {
    const allLevels = [...state.levels, ...state.customLevels]
    return allLevels[state.currentLevel] || state.levels[0]
  }, [state.levels, state.customLevels, state.currentLevel])
  const getAllLevels = useCallback(() => [...state.levels, ...state.customLevels], [state.levels, state.customLevels])
  const isGameComplete = useCallback(() => state.currentLevel >= state.levels.length, [state.currentLevel, state.levels.length])
  const getFormattedTime = useCallback(() => {
    const seconds = Math.floor(state.timeElapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [state.timeElapsed])
  const value = {
    state,
    dispatch,
    startGame,
    nextLevel,
    restartLevel,
    updateBallPosition,
    updateMazeRotation,
    collectTarget,
    loseLife,
    winLevel,
    pauseGame,
    resumeGame,
    addCustomLevel,
    setCurrentLevel,
    getCurrentLevel,
    getAllLevels,
    isGameComplete,
    getFormattedTime
  }
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
