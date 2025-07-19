import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../contexts/GameContext'
import * as THREE from 'three'
export default function Maze() {
  const { getCurrentLevel } = useGame()
  const meshRef = useRef()
  const level = getCurrentLevel()
  const maze = level.maze
  const { wallGeometry, floorGeometry, targetGeometry } = useMemo(() => {
    const wallGeometry = new THREE.BoxGeometry()
    const floorGeometry = new THREE.PlaneGeometry(maze.width, maze.height)
    const targetGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16)
    return { wallGeometry, floorGeometry, targetGeometry }
  }, [maze.width, maze.height])
  const wallMaterial = useMemo(() => new THREE.MeshLambertMaterial({ 
    color: '#666666',
    transparent: true,
    opacity: 0.9
  }), [])
  const floorMaterial = useMemo(() => new THREE.MeshLambertMaterial({ 
    color: '#333333',
    transparent: true,
    opacity: 0.8
  }), [])
  const renderWalls = () => {
    return maze.walls.map((wall, index) => {
      const wallHeight = wall.wallHeight || 1
      return (
        <mesh
          key={`wall-${index}`}
          position={[
            wall.x + wall.width / 2 - maze.width / 2,
            wallHeight / 2,
            wall.z + wall.height / 2 - maze.height / 2
          ]}
          scale={[wall.width, wallHeight, wall.height]}
          castShadow
          receiveShadow
        >
          <boxGeometry />
          <meshLambertMaterial color="#555555" />
        </mesh>
      )
    })
  }
  const renderTargets = () => {
    return maze.targets.map((target, index) => (
      <Target
        key={`target-${index}`}
        position={[
          target.x - maze.width / 2,
          0.05,
          target.z - maze.height / 2
        ]}
        color={target.color}
        points={target.points}
        targetIndex={index}
      />
    ))
  }
  return (
    <group ref={meshRef}>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[maze.width, maze.height]} />
        <meshLambertMaterial color="#2a2a2a" />
      </mesh>
      {/* Walls */}
      {renderWalls()}
      {/* Targets */}
      {renderTargets()}
      {/* Start position indicator */}
      <mesh
        position={[
          maze.startPosition.x - maze.width / 2,
          0.01,
          maze.startPosition.z - maze.height / 2
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.4, 16]} />
        <meshLambertMaterial color="#00ff00" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
function Target({ position, color, points, targetIndex }) {
  const { state, collectTarget } = useGame()
  const meshRef = useRef()
  const isCollected = state.levelStats.collectedTargets > targetIndex
  const handleClick = () => {
    if (!isCollected && state.gameStatus === 'playing') {
      collectTarget(points)
    }
  }
  if (isCollected) {
    return null
  }
  return (
    <group position={position}>
      {/* Target cylinder */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* Glow effect */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.02, 16]} />
        <meshLambertMaterial 
          color={color} 
          transparent 
          opacity={0.3}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Points display */}
      <mesh position={[0, 0.8, 0]}>
        <planeGeometry args={[0.6, 0.2]} />
        <meshLambertMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.9}
        />
      </mesh>
      {/* Floating animation */}
      <AnimatedMesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.12, 16]} />
        <meshLambertMaterial 
          color={color} 
          transparent 
          opacity={0.8}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </AnimatedMesh>
    </group>
  )
}
function AnimatedMesh({ children, position, ...props }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.rotation.y += 0.01
    }
  })
  return (
    <mesh ref={meshRef} position={position} {...props}>
      {children}
    </mesh>
  )
}
