import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGame } from '../contexts/GameContext'
import * as THREE from 'three'
export default function CameraController() {
  const { camera } = useThree()
  const { state, getCurrentLevel } = useGame()
  const targetPosition = useRef(new THREE.Vector3())
  const currentPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3())
  const level = getCurrentLevel()
  const maze = level.maze
  const cameraOffset = { x: 0, y: 12, z: 8 }
  const followSpeed = 0.05
  const lookAtSpeed = 0.1
  useEffect(() => {
    const initialPos = new THREE.Vector3(
      cameraOffset.x,
      cameraOffset.y,
      cameraOffset.z
    )
    camera.position.copy(initialPos)
    currentPosition.current.copy(initialPos)
    targetPosition.current.copy(initialPos)
    const lookAt = new THREE.Vector3(0, 0, 0)
    currentLookAt.current.copy(lookAt)
    targetLookAt.current.copy(lookAt)
    camera.lookAt(lookAt)
  }, [camera, state.currentLevel])
  useFrame(() => {
    if (state.gameStatus !== 'playing') return
    const ballPos = state.ballPosition
    const mazeSize = Math.max(maze.width, maze.height)
    const heightMultiplier = Math.max(1, mazeSize / 10)
    const distanceMultiplier = Math.max(1, mazeSize / 12)
    targetPosition.current.set(
      ballPos.x + cameraOffset.x,
      cameraOffset.y * heightMultiplier,
      ballPos.z + cameraOffset.z * distanceMultiplier
    )
    const ballVelocity = state.isMoving ? 0.5 : 0
    targetLookAt.current.set(
      ballPos.x,
      ballPos.y,
      ballPos.z + ballVelocity
    )
    currentPosition.current.lerp(targetPosition.current, followSpeed)
    currentLookAt.current.lerp(targetLookAt.current, lookAtSpeed)
    if (state.isMoving) {
      const shakeIntensity = 0.02
      const shake = {
        x: (Math.random() - 0.5) * shakeIntensity,
        y: (Math.random() - 0.5) * shakeIntensity,
        z: (Math.random() - 0.5) * shakeIntensity
      }
      currentPosition.current.add(new THREE.Vector3(shake.x, shake.y, shake.z))
    }
    camera.position.copy(currentPosition.current)
    camera.lookAt(currentLookAt.current)
    const rotationInfluence = 0.3
    const rotationOffset = {
      x: state.mazeRotation.x * rotationInfluence,
      z: state.mazeRotation.z * rotationInfluence
    }
    camera.position.x += rotationOffset.z * 2
    camera.position.z += rotationOffset.x * 2
  })
  return null
}
