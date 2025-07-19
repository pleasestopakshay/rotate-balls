import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../contexts/GameContext'
import * as THREE from 'three'
export default function Ball() {
  const { state, getCurrentLevel, updateBallPosition, collectTarget, loseLife, winLevel } = useGame()
  const meshRef = useRef()
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 })
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 })
  const [isOnGround, setIsOnGround] = useState(true)
  const level = getCurrentLevel()
  const maze = level.maze
  const ballRadius = 0.1
  const gravity = -0.001
  const friction = 0.95
  const bounceReduction = 0.7
  const tiltForce = 0.0008
  useEffect(() => {
    const startPos = {
      x: maze.startPosition.x - maze.width / 2,
      y: 0.5,
      z: maze.startPosition.z - maze.height / 2
    }
    if (meshRef.current) {
      meshRef.current.position.copy(startPos)
    }
    updateBallPosition(startPos, false)
    lastPositionRef.current = { x: startPos.x, y: startPos.y, z: startPos.z }
    setVelocity({ x: 0, y: 0, z: 0 })
    setIsOnGround(true)
  }, [state.currentLevel, maze.startPosition, maze.width, maze.height])
  useFrame(() => {
    if (!meshRef.current || state.gameStatus !== 'playing') return
    const ball = meshRef.current
    const currentPos = ball.position
    let newVelocity = { ...velocity }
    newVelocity.y += gravity
    const tiltX = state.mazeRotation.z * tiltForce
    const tiltZ = -state.mazeRotation.x * tiltForce
    newVelocity.x += tiltX
    newVelocity.z += tiltZ
    if (isOnGround) {
      newVelocity.x *= friction
      newVelocity.z *= friction
    }
    const newPos = {
      x: currentPos.x + newVelocity.x,
      y: currentPos.y + newVelocity.y,
      z: currentPos.z + newVelocity.z
    }
    const halfWidth = maze.width / 2
    const halfHeight = maze.height / 2
    if (newPos.x - ballRadius < -halfWidth) {
      newPos.x = -halfWidth + ballRadius
      newVelocity.x = -newVelocity.x * bounceReduction
    } else if (newPos.x + ballRadius > halfWidth) {
      newPos.x = halfWidth - ballRadius
      newVelocity.x = -newVelocity.x * bounceReduction
    }
    if (newPos.z - ballRadius < -halfHeight) {
      newPos.z = -halfHeight + ballRadius
      newVelocity.z = -newVelocity.z * bounceReduction
    } else if (newPos.z + ballRadius > halfHeight) {
      newPos.z = halfHeight - ballRadius
      newVelocity.z = -newVelocity.z * bounceReduction
    }
    let collided = false
    for (const wall of maze.walls) {
      const wallLeft = wall.x - maze.width / 2
      const wallRight = wall.x + wall.width - maze.width / 2
      const wallTop = wall.z - maze.height / 2
      const wallBottom = wall.z + wall.height - maze.height / 2
      const wallHeight = wall.wallHeight || 1
      if (newPos.x + ballRadius > wallLeft && newPos.x - ballRadius < wallRight &&
          newPos.z + ballRadius > wallTop && newPos.z - ballRadius < wallBottom &&
          newPos.y - ballRadius < wallHeight) {
        const overlapLeft = (newPos.x + ballRadius) - wallLeft
        const overlapRight = wallRight - (newPos.x - ballRadius)
        const overlapTop = (newPos.z + ballRadius) - wallTop
        const overlapBottom = wallBottom - (newPos.z - ballRadius)
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)
        if (minOverlap === overlapLeft) {
          newPos.x = wallLeft - ballRadius
          newVelocity.x = -Math.abs(newVelocity.x) * bounceReduction
        } else if (minOverlap === overlapRight) {
          newPos.x = wallRight + ballRadius
          newVelocity.x = Math.abs(newVelocity.x) * bounceReduction
        } else if (minOverlap === overlapTop) {
          newPos.z = wallTop - ballRadius
          newVelocity.z = -Math.abs(newVelocity.z) * bounceReduction
        } else if (minOverlap === overlapBottom) {
          newPos.z = wallBottom + ballRadius
          newVelocity.z = Math.abs(newVelocity.z) * bounceReduction
        }
        collided = true
        break
      }
    }
    if (newPos.y - ballRadius <= 0) {
      newPos.y = ballRadius
      if (newVelocity.y < 0) {
        newVelocity.y = -newVelocity.y * bounceReduction
      }
      setIsOnGround(true)
    } else {
      setIsOnGround(false)
    }
    if (newPos.y < -2) {
      loseLife()
      return
    }
    for (let i = 0; i < maze.targets.length; i++) {
      const target = maze.targets[i]
      if (i >= state.levelStats.collectedTargets) {
        const targetPos = {
          x: target.x - maze.width / 2,
          z: target.z - maze.height / 2
        }
        const distance = Math.sqrt(
          Math.pow(newPos.x - targetPos.x, 2) + 
          Math.pow(newPos.z - targetPos.z, 2)
        )
        if (distance < ballRadius + 0.3) {
          collectTarget(target.points)
          if (state.levelStats.collectedTargets + 1 >= maze.targets.length) {
            winLevel()
          }
          break
        }
      }
    }
    ball.position.copy(newPos)
    setVelocity(newVelocity)
    const positionChanged = Math.abs(newPos.x - lastPositionRef.current.x) > 0.01 ||
                           Math.abs(newPos.y - lastPositionRef.current.y) > 0.01 ||
                           Math.abs(newPos.z - lastPositionRef.current.z) > 0.01
    if (positionChanged) {
      lastPositionRef.current = { x: newPos.x, y: newPos.y, z: newPos.z }
      const isMoving = Math.abs(newVelocity.x) > 0.001 || Math.abs(newVelocity.z) > 0.001
      updateBallPosition(newPos, isMoving)
    }
  })
  return (
    <group>
      {/* Ball */}
      <mesh 
        ref={meshRef} 
        position={[
          maze.startPosition.x - maze.width / 2,
          0.5,
          maze.startPosition.z - maze.height / 2
        ]}
        castShadow 
        receiveShadow
      >
        <sphereGeometry args={[ballRadius, 32, 32]} />
        <meshLambertMaterial color="#ff4444" />
      </mesh>
      {/* Ball shadow */}
      <mesh
        position={[
          meshRef.current?.position.x || 0,
          0.01,
          meshRef.current?.position.z || 0
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[ballRadius, 16]} />
        <meshLambertMaterial 
          color="#000000" 
          transparent 
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
function BallTrail({ ballRef }) {
  const trailRef = useRef()
  const [trailPoints, setTrailPoints] = useState([])
  const maxTrailLength = 20
  useFrame(() => {
    if (!ballRef.current) return
    const currentPos = ballRef.current.position.clone()
    setTrailPoints(prev => {
      const newPoints = [currentPos, ...prev]
      return newPoints.slice(0, maxTrailLength)
    })
  })
  return (
    <group ref={trailRef}>
      {trailPoints.map((point, index) => (
        <mesh
          key={index}
          position={point}
          scale={[1 - index / maxTrailLength, 1 - index / maxTrailLength, 1 - index / maxTrailLength]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshLambertMaterial 
            color="#ff6666" 
            transparent 
            opacity={0.8 - (index / maxTrailLength) * 0.8}
          />
        </mesh>
      ))}
    </group>
  )
}
