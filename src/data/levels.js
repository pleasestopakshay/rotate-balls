export const defaultLevels = [
  {
    id: 1,
    name: "Tutorial",
    description: "Learn the basics of maze ball",
    difficulty: "Easy",
    maze: {
      width: 8,
      height: 8,
      walls: [
        { x: 0, z: 0, width: 8, height: 1, wallHeight: 1 },
        { x: 0, z: 7, width: 8, height: 1, wallHeight: 1 },
        { x: 0, z: 0, width: 1, height: 8, wallHeight: 1 },
        { x: 7, z: 0, width: 1, height: 8, wallHeight: 1 },
        { x: 2, z: 2, width: 1, height: 3, wallHeight: 1 },
        { x: 5, z: 1, width: 1, height: 2, wallHeight: 1 },
        { x: 4, z: 4, width: 2, height: 1, wallHeight: 1 },
        { x: 1, z: 5, width: 3, height: 1, wallHeight: 1 }
      ],
      startPosition: { x: 1, z: 1 },
      targets: [
        { x: 6, z: 6, points: 100, color: '#00ff00' },
        { x: 3, z: 6, points: 150, color: '#ffff00' },
        { x: 6, z: 2, points: 200, color: '#ff0000' }
      ]
    }
  },
  {
    id: 2,
    name: "Simple Path",
    description: "Navigate through a simple maze",
    difficulty: "Easy",
    maze: {
      width: 10,
      height: 10,
      walls: [
        { x: 0, z: 0, width: 10, height: 1, wallHeight: 1 },
        { x: 0, z: 9, width: 10, height: 1, wallHeight: 1 },
        { x: 0, z: 0, width: 1, height: 10, wallHeight: 1 },
        { x: 9, z: 0, width: 1, height: 10, wallHeight: 1 },
        { x: 2, z: 1, width: 1, height: 4, wallHeight: 1 },
        { x: 4, z: 2, width: 1, height: 3, wallHeight: 1 },
        { x: 6, z: 1, width: 1, height: 4, wallHeight: 1 },
        { x: 1, z: 6, width: 4, height: 1, wallHeight: 1 },
        { x: 6, z: 6, width: 2, height: 1, wallHeight: 1 },
        { x: 3, z: 8, width: 3, height: 1, wallHeight: 1 }
      ],
      startPosition: { x: 1, z: 1 },
      targets: [
        { x: 8, z: 8, points: 100, color: '#00ff00' },
        { x: 5, z: 5, points: 150, color: '#ffff00' },
        { x: 8, z: 2, points: 200, color: '#ff0000' },
        { x: 2, z: 8, points: 250, color: '#ff00ff' }
      ]
    }
  },
  {
    id: 3,
    name: "Spiral Challenge",
    description: "Navigate through a spiral maze",
    difficulty: "Medium",
    maze: {
      width: 12,
      height: 12,
      walls: [
        { x: 0, z: 0, width: 12, height: 1, wallHeight: 1 },
        { x: 0, z: 11, width: 12, height: 1, wallHeight: 1 },
        { x: 0, z: 0, width: 1, height: 12, wallHeight: 1 },
        { x: 11, z: 0, width: 1, height: 12, wallHeight: 1 },
        { x: 2, z: 2, width: 8, height: 1, wallHeight: 1 },
        { x: 9, z: 2, width: 1, height: 7, wallHeight: 1 },
        { x: 3, z: 9, width: 7, height: 1, wallHeight: 1 },
        { x: 3, z: 4, width: 1, height: 5, wallHeight: 1 },
        { x: 4, z: 4, width: 4, height: 1, wallHeight: 1 },
        { x: 7, z: 4, width: 1, height: 3, wallHeight: 1 },
        { x: 5, z: 7, width: 3, height: 1, wallHeight: 1 },
        { x: 5, z: 6, width: 1, height: 1, wallHeight: 1 }
      ],
      startPosition: { x: 1, z: 1 },
      targets: [
        { x: 6, z: 6, points: 300, color: '#00ff00' },
        { x: 10, z: 10, points: 200, color: '#ffff00' },
        { x: 1, z: 10, points: 250, color: '#ff0000' },
        { x: 10, z: 1, points: 150, color: '#ff00ff' },
        { x: 5, z: 1, points: 400, color: '#00ffff' }
      ]
    }
  },
  {
    id: 4,
    name: "Cross Roads",
    description: "Multiple paths to choose from",
    difficulty: "Medium",
    maze: {
      width: 14,
      height: 14,
      walls: [
        { x: 0, z: 0, width: 14, height: 1, wallHeight: 1 },
        { x: 0, z: 13, width: 14, height: 1, wallHeight: 1 },
        { x: 0, z: 0, width: 1, height: 14, wallHeight: 1 },
        { x: 13, z: 0, width: 1, height: 14, wallHeight: 1 },
        { x: 1, z: 6, width: 5, height: 1, wallHeight: 1 },
        { x: 8, z: 6, width: 5, height: 1, wallHeight: 1 },
        { x: 6, z: 1, width: 1, height: 4, wallHeight: 1 },
        { x: 6, z: 8, width: 1, height: 4, wallHeight: 1 },
        { x: 3, z: 3, width: 1, height: 2, wallHeight: 1 },
        { x: 9, z: 3, width: 1, height: 2, wallHeight: 1 },
        { x: 3, z: 9, width: 1, height: 2, wallHeight: 1 },
        { x: 9, z: 9, width: 1, height: 2, wallHeight: 1 },
        { x: 2, z: 8, width: 2, height: 1, wallHeight: 1 },
        { x: 10, z: 8, width: 2, height: 1, wallHeight: 1 },
        { x: 2, z: 4, width: 2, height: 1, wallHeight: 1 },
        { x: 10, z: 4, width: 2, height: 1, wallHeight: 1 }
      ],
      startPosition: { x: 1, z: 1 },
      targets: [
        { x: 7, z: 7, points: 500, color: '#00ff00' },
        { x: 12, z: 12, points: 200, color: '#ffff00' },
        { x: 1, z: 12, points: 250, color: '#ff0000' },
        { x: 12, z: 1, points: 300, color: '#ff00ff' },
        { x: 7, z: 1, points: 150, color: '#00ffff' },
        { x: 1, z: 7, points: 350, color: '#ffa500' }
      ]
    }
  },
  {
    id: 5,
    name: "The Labyrinth",
    description: "Complex maze with multiple challenges",
    difficulty: "Hard",
    maze: {
      width: 16,
      height: 16,
      walls: [
        { x: 0, z: 0, width: 16, height: 1, wallHeight: 1 },
        { x: 0, z: 15, width: 16, height: 1, wallHeight: 1 },
        { x: 0, z: 0, width: 1, height: 16, wallHeight: 1 },
        { x: 15, z: 0, width: 1, height: 16, wallHeight: 1 },
        { x: 2, z: 1, width: 1, height: 2, wallHeight: 1 },
        { x: 4, z: 2, width: 1, height: 4, wallHeight: 1 },
        { x: 6, z: 1, width: 1, height: 3, wallHeight: 1 },
        { x: 8, z: 2, width: 1, height: 5, wallHeight: 1 },
        { x: 10, z: 1, width: 1, height: 4, wallHeight: 1 },
        { x: 12, z: 2, width: 1, height: 6, wallHeight: 1 },
        { x: 14, z: 2, width: 1, height: 5, wallHeight: 1 },
        { x: 1, z: 8, width: 4, height: 1, wallHeight: 1 },
        { x: 6, z: 8, width: 3, height: 1, wallHeight: 1 },
        { x: 10, z: 8, width: 4, height: 1, wallHeight: 1 },
        { x: 3, z: 10, width: 1, height: 3, wallHeight: 1 },
        { x: 5, z: 11, width: 1, height: 2, wallHeight: 1 },
        { x: 7, z: 12, width: 1, height: 4, wallHeight: 1 },
        { x: 9, z: 11, width: 1, height: 2, wallHeight: 1 },
        { x: 11, z: 10, width: 1, height: 3, wallHeight: 1 },
        { x: 13, z: 11, width: 1, height: 2, wallHeight: 1 },
        { x: 1, z: 4, width: 2, height: 1, wallHeight: 1 },
        { x: 5, z: 5, width: 2, height: 1, wallHeight: 1 },
        { x: 9, z: 4, width: 2, height: 1, wallHeight: 1 },
        { x: 13, z: 5, width: 2, height: 1, wallHeight: 1 },
        { x: 2, z: 12, width: 2, height: 1, wallHeight: 1 },
        { x: 6, z: 13, width: 2, height: 1, wallHeight: 1 },
        { x: 10, z: 12, width: 2, height: 1, wallHeight: 1 },
        { x: 14, z: 13, width: 1, height: 1, wallHeight: 1 }
      ],
      startPosition: { x: 1, z: 1 },
      targets: [
        { x: 14, z: 14, points: 1000, color: '#00ff00' },
        { x: 1, z: 14, points: 300, color: '#ffff00' },
        { x: 14, z: 1, points: 400, color: '#ff0000' },
        { x: 7, z: 7, points: 500, color: '#ff00ff' },
        { x: 3, z: 7, points: 200, color: '#00ffff' },
        { x: 11, z: 7, points: 250, color: '#ffa500' },
        { x: 7, z: 3, points: 350, color: '#ff69b4' },
        { x: 7, z: 11, points: 450, color: '#32cd32' }
      ]
    }
  }
]
export function validateLevel(level) {
  if (!level || typeof level !== 'object') {
    return false
  }
  const required = ['id', 'name', 'maze']
  for (const field of required) {
    if (!level[field]) {
      return false
    }
  }
  const maze = level.maze
  if (!maze.width || !maze.height || !maze.walls || !maze.startPosition || !maze.targets) {
    return false
  }
  if (!Array.isArray(maze.walls) || !Array.isArray(maze.targets)) {
    return false
  }
  for (const wall of maze.walls) {
    if (typeof wall.x !== 'number' || typeof wall.z !== 'number' || 
        typeof wall.width !== 'number' || typeof wall.height !== 'number') {
      return false
    }
  }
  for (const target of maze.targets) {
    if (typeof target.x !== 'number' || typeof target.z !== 'number' || 
        typeof target.points !== 'number' || !target.color) {
      return false
    }
  }
  return true
}
export function createEmptyLevel() {
  return {
    id: Date.now(),
    name: "Custom Level",
    description: "A custom created level",
    difficulty: "Custom",
    maze: {
      width: 10,
      height: 10,
      walls: [
        { x: 0, z: 0, width: 10, height: 1, wallHeight: 1 },
        { x: 0, z: 9, width: 10, height: 1, wallHeight: 1 },
        { x: 0, z: 0, width: 1, height: 10, wallHeight: 1 },
        { x: 9, z: 0, width: 1, height: 10, wallHeight: 1 }
      ],
      startPosition: { x: 1, z: 1 },
      targets: [
        { x: 8, z: 8, points: 100, color: '#00ff00' }
      ]
    }
  }
}
