import { useRef, useEffect, useState } from 'react'
import { useGame } from '../contexts/GameContext'
export default function GameScene() {
  const { state, updateMazeRotation, updateBallPosition, collectTarget, getCurrentLevel, winLevel } = useGame()
  const canvasRef = useRef()
  const animationRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
  const [currentRotation, setCurrentRotation] = useState(0)
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 })
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [collectedTargets, setCollectedTargets] = useState(new Set())
  const CELL_SIZE = 40
  const BALL_RADIUS = 10
  const GRAVITY = 0.25
  const FRICTION = 0.96
  const BOUNCE_DAMPING = 0.75
  const MIN_SCALE = 0.5
  const MAX_SCALE = 2
  const MAX_VELOCITY = 6
  const level = getCurrentLevel()
  const maze = level.maze
  useEffect(() => {
    if (maze && maze.startPosition) {
      const startPos = {
        x: (maze.startPosition.x + 0.5) * CELL_SIZE,
        y: (maze.startPosition.z + 0.5) * CELL_SIZE
      }
      setBallPosition(startPos)
      setBallVelocity({ x: 0, y: 0 })
      setCurrentRotation(0)
      setCollectedTargets(new Set())
      setScale(1)
    }
  }, [state.currentLevel, maze, state.gameStatus])
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleMouseDown = (e) => {
      e.preventDefault()
      setIsDragging(true)
      setLastMouse({ 
        x: e.clientX || e.touches?.[0]?.clientX || 0, 
        y: e.clientY || e.touches?.[0]?.clientY || 0 
      })
    }
    const handleMouseMove = (e) => {
      if (!isDragging || state.gameStatus !== 'playing') return
      const currentX = e.clientX || e.touches?.[0]?.clientX || 0
      const deltaX = currentX - lastMouse.x
      const sensitivity = 0.008
      const newRotation = currentRotation + deltaX * sensitivity
      setCurrentRotation(newRotation)
      updateMazeRotation({ rotation: newRotation })
      setLastMouse({ x: currentX, y: lastMouse.y })
    }
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('touchstart', handleMouseDown, { passive: false })
    window.addEventListener('touchmove', handleMouseMove, { passive: false })
    window.addEventListener('touchend', handleMouseUp)
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchstart', handleMouseDown)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, lastMouse, currentRotation, state.gameStatus, updateMazeRotation])
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (state.gameStatus !== 'playing') return
      const rotationSpeed = 0.03
      let newRotation = currentRotation
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newRotation = currentRotation - rotationSpeed
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          newRotation = currentRotation + rotationSpeed
          break
        case ' ':
          e.preventDefault()
          newRotation = 0
          break
        default:
          return
      }
      setCurrentRotation(newRotation)
      updateMazeRotation({ rotation: newRotation })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentRotation, state.gameStatus, updateMazeRotation])
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      const zoomSpeed = 0.05
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + e.deltaY * -zoomSpeed * 0.01))
      setScale(newScale)
    }
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvas.removeEventListener('wheel', handleWheel)
    }
  }, [scale])
  useEffect(() => {
    if (state.gameStatus !== 'playing') return
    const animate = () => {
      setBallVelocity(prev => {
        const gravityX = Math.sin(currentRotation) * GRAVITY
        const gravityY = Math.cos(currentRotation) * GRAVITY
        let newVelX = prev.x + gravityX
        let newVelY = prev.y + gravityY
        newVelX *= FRICTION
        newVelY *= FRICTION
        const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY)
        if (speed > MAX_VELOCITY) {
          newVelX = (newVelX / speed) * MAX_VELOCITY
          newVelY = (newVelY / speed) * MAX_VELOCITY
        }
        return { x: newVelX, y: newVelY }
      })
      setBallPosition(prev => {
        let newX = prev.x + ballVelocity.x
        let newY = prev.y + ballVelocity.y
        const mazeWidth = maze.width * CELL_SIZE
        const mazeHeight = maze.height * CELL_SIZE
        if (newX - BALL_RADIUS < 0) {
          newX = BALL_RADIUS
          setBallVelocity(prev => ({ ...prev, x: -prev.x * BOUNCE_DAMPING }))
        } else if (newX + BALL_RADIUS > mazeWidth) {
          newX = mazeWidth - BALL_RADIUS
          setBallVelocity(prev => ({ ...prev, x: -prev.x * BOUNCE_DAMPING }))
        }
        if (newY - BALL_RADIUS < 0) {
          newY = BALL_RADIUS
          setBallVelocity(prev => ({ ...prev, y: -prev.y * BOUNCE_DAMPING }))
        } else if (newY + BALL_RADIUS > mazeHeight) {
          newY = mazeHeight - BALL_RADIUS
          setBallVelocity(prev => ({ ...prev, y: -prev.y * BOUNCE_DAMPING }))
        }
        maze.walls.forEach(wall => {
          const wallLeft = wall.x * CELL_SIZE
          const wallRight = (wall.x + wall.width) * CELL_SIZE
          const wallTop = wall.z * CELL_SIZE
          const wallBottom = (wall.z + wall.height) * CELL_SIZE
          if (newX + BALL_RADIUS > wallLeft && newX - BALL_RADIUS < wallRight &&
              newY + BALL_RADIUS > wallTop && newY - BALL_RADIUS < wallBottom) {
            const overlapLeft = (newX + BALL_RADIUS) - wallLeft
            const overlapRight = wallRight - (newX - BALL_RADIUS)
            const overlapTop = (newY + BALL_RADIUS) - wallTop
            const overlapBottom = wallBottom - (newY - BALL_RADIUS)
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)
            if (minOverlap === overlapLeft) {
              newX = wallLeft - BALL_RADIUS
              setBallVelocity(prev => ({ ...prev, x: -Math.abs(prev.x) * BOUNCE_DAMPING }))
            } else if (minOverlap === overlapRight) {
              newX = wallRight + BALL_RADIUS
              setBallVelocity(prev => ({ ...prev, x: Math.abs(prev.x) * BOUNCE_DAMPING }))
            } else if (minOverlap === overlapTop) {
              newY = wallTop - BALL_RADIUS
              setBallVelocity(prev => ({ ...prev, y: -Math.abs(prev.y) * BOUNCE_DAMPING }))
            } else if (minOverlap === overlapBottom) {
              newY = wallBottom + BALL_RADIUS
              setBallVelocity(prev => ({ ...prev, y: Math.abs(prev.y) * BOUNCE_DAMPING }))
            }
          }
        })
        maze.targets.forEach((target, index) => {
          if (collectedTargets.has(index)) return
          const targetX = (target.x + 0.5) * CELL_SIZE
          const targetY = (target.z + 0.5) * CELL_SIZE
          const distance = Math.sqrt((newX - targetX) ** 2 + (newY - targetY) ** 2)
          if (distance < BALL_RADIUS + 15) {
            setCollectedTargets(prev => {
              if (prev.has(index)) return prev
              const newSet = new Set([...prev, index])
              collectTarget(target.points)
              if (newSet.size >= maze.targets.length) {
                setTimeout(() => winLevel(), 500)
              }
              return newSet
            })
          }
        })
        updateBallPosition({ x: newX, y: newY }, Math.abs(ballVelocity.x) > 0.1 || Math.abs(ballVelocity.y) > 0.1)
        return { x: newX, y: newY }
      })
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state.gameStatus, currentRotation, ballVelocity, maze, collectTarget, updateBallPosition, collectedTargets, winLevel])
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
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(scale, scale)
    ctx.rotate(currentRotation)
    ctx.translate(-maze.width * CELL_SIZE / 2, -maze.height * CELL_SIZE / 2)
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(0, 0, maze.width * CELL_SIZE, maze.height * CELL_SIZE)
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    for (let i = 0; i <= maze.width; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, maze.height * CELL_SIZE)
      ctx.stroke()
    }
    for (let i = 0; i <= maze.height; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(maze.width * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }
    maze.walls.forEach(wall => {
      const x = wall.x * CELL_SIZE
      const y = wall.z * CELL_SIZE
      const width = wall.width * CELL_SIZE
      const height = wall.height * CELL_SIZE
      ctx.fillStyle = '#404040'
      ctx.fillRect(x, y, width, height)
      ctx.fillStyle = '#606060'
      ctx.fillRect(x + 2, y + 2, width - 4, height - 4)
      ctx.strokeStyle = '#707070'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, width, height)
      ctx.strokeStyle = '#202020'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 1, y + 1, width - 2, height - 2)
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
    maze.targets.forEach((target, index) => {
      if (collectedTargets.has(index)) return
      const targetX = (target.x + 0.5) * CELL_SIZE
      const targetY = (target.z + 0.5) * CELL_SIZE
      const gradient = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 30)
      gradient.addColorStop(0, target.color + '80')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(targetX - 30, targetY - 30, 60, 60)
      ctx.beginPath()
      ctx.arc(targetX, targetY, 18, 0, Math.PI * 2)
      ctx.fillStyle = target.color
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(targetX, targetY, 12, 0, Math.PI * 2)
      ctx.fillStyle = target.color + '80'
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(target.points.toString(), targetX, targetY)
    })
    ctx.beginPath()
    ctx.arc(ballPosition.x + 2, ballPosition.y + 2, BALL_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(ballPosition.x, ballPosition.y, BALL_RADIUS, 0, Math.PI * 2)
    const ballGradient = ctx.createRadialGradient(
      ballPosition.x - 3, ballPosition.y - 3, 0,
      ballPosition.x, ballPosition.y, BALL_RADIUS
    )
    ballGradient.addColorStop(0, '#ff9999')
    ballGradient.addColorStop(0.7, '#ff4444')
    ballGradient.addColorStop(1, '#cc2222')
    ctx.fillStyle = ballGradient
    ctx.fill()
    ctx.beginPath()
    ctx.arc(ballPosition.x - 3, ballPosition.y - 3, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(ballPosition.x, ballPosition.y, BALL_RADIUS, 0, Math.PI * 2)
    ctx.strokeStyle = '#aa0000'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }, [ballPosition, currentRotation, maze, scale, collectedTargets, state.score])
  return (
    <div className="game-scene">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />
      {/* Control Instructions */}
      <div className="control-instructions">
        <p>🖱️ Click and drag to rotate the maze</p>
        <p>⌨️ Use A/D or Arrow keys to rotate</p>
        <p>🔍 Scroll wheel to zoom in/out</p>
        <p>␣ Spacebar to level the maze</p>
        <p>🎯 Collect all targets to win!</p>
      </div>
    </div>
  )
}
