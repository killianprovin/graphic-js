// src/world.ts
import { Vector3D } from './camera.js';
import { Cube, createCube, cubeTemplate } from './cube.js';
import { BlockType } from './block.js';

export interface Chunk {
  c_x: number;
  c_y: number;
  cubes: Cube[];
}

// Fonction pour créer un chunk à la position donnée
export function createChunk(c_x: number, c_y: number, chunkSize: number): Chunk {
  const cubes: Cube[] = [];

  for (let x_b = 0; x_b < chunkSize; x_b++) {
    for (let y_b = 0; y_b < chunkSize; y_b++) {
      const worldX = c_x * chunkSize + x_b;
      const worldY = c_y * chunkSize + y_b;

      // Générer une hauteur pour le terrain (par exemple, une fonction simple)
      const height = generateHeight(worldX, worldY);

      // Déterminer le type de bloc en fonction de la hauteur
      const blockType = getBlockTypeAtHeight(height);

      cubes.push(
        createCube(
          cubeTemplate,
          { x: worldX, y: worldY, z: height },
          blockType
        )
      );
    }
  }

  return {
    c_x,
    c_y,
    cubes,
  };
}

export function calculateDistance(cube: Cube, cameraPosition: Vector3D): number {
  const center = cube.points.reduce(
    (sum, point) => ({
      x: sum.x + point.x / cube.points.length,
      y: sum.y + point.y / cube.points.length,
      z: sum.z + point.z / cube.points.length
    }),
    { x: 0, y: 0, z: 0 }
  );

  const dx = center.x - cameraPosition.x;
  const dy = center.y - cameraPosition.y;
  const dz = center.z - cameraPosition.z;

  return dx * dx + dy * dy + dz * dz;
}

function generateHeight(x: number, y: number): number {
  // Exemple simple : un terrain ondulé avec une sinusoïde
  const frequency = 0.1;
  const amplitude = 5;

  const height = Math.floor(
    Math.sin(x * frequency) * amplitude + Math.cos(y * frequency) * amplitude
  );

  return height;
}

export function sortCubesByDistance(world: Cube[], cameraPosition: Vector3D): Cube[] {
  return world.sort((a, b) => {
    const distanceA = calculateDistance(a, cameraPosition);
    const distanceB = calculateDistance(b, cameraPosition);
    return distanceB - distanceA;
  });
}

export function getBlockTypeAtHeight(height: number): BlockType {
  if (height >= 0) {
    return BlockType.Grass;
  } else if (height >= -3) {
    return BlockType.Dirt;
  } else {
    return BlockType.Stone;
  }
}