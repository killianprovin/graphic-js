// src/world.ts
import { PerlinNoise } from './perlin.js';
import { Vector3D } from './camera.js';
import { Cube, createCube, cubeTemplate } from './cube.js';
import { BlockType } from './block.js';


// Initialiser le bruit avec une graine fixe
const perlin = new PerlinNoise(123456);


export interface Chunk {
  c_x: number;
  c_y: number;
  cubes: Cube[];
}


export function sortCubesByDistance(world: Cube[], cameraPosition: Vector3D): Cube[] {
  return world.sort((a, b) => {
    const distanceA = calculateDistance(a, cameraPosition);
    const distanceB = calculateDistance(b, cameraPosition);
    return distanceB - distanceA;
  });
}


// Fonction pour créer un chunk à la position donnée
export function createChunk(c_x: number, c_y: number, chunkSize: number): Chunk {
  const cubes: Cube[] = [];

  const chunkMinX = c_x * chunkSize;
  const chunkMaxX = chunkMinX + chunkSize;
  const chunkMinY = c_y * chunkSize;
  const chunkMaxY = chunkMinY + chunkSize;

  // Décider si un arbre doit être placé dans ce chunk
  const placeTreeInChunk = shouldPlaceTreeInChunk(c_x, c_y);

  // Si oui, déterminer la position de l'arbre dans le chunk
  let treePosition: { x: number; y: number } | null = null;
  if (placeTreeInChunk) {
    treePosition = getTreePositionInChunk(c_x, c_y, chunkSize);
  }

  for (let x_b = 0; x_b < chunkSize; x_b++) {
    for (let y_b = 0; y_b < chunkSize; y_b++) {
      const worldX = chunkMinX + x_b;
      const worldY = chunkMinY + y_b;

      const height = generateHeight(worldX, worldY);
      const blockType = getBlockTypeAtHeight(height);

      // Créer le bloc de terrain
      cubes.push(
        createCube(
          cubeTemplate,
          { x: worldX, y: worldY, z: height },
          blockType
        )
      );
      
      if (height < -3){
        for (let z_b = height+1; z_b <= -3; z_b++) {
          cubes.push(
            createCube(
              cubeTemplate,
              { x: worldX, y: worldY, z: z_b },
              BlockType.Water
            )
          );
        }
      }

      // Si un arbre doit être placé et que c'est la position choisie
      if (
        treePosition &&
        worldX === treePosition.x &&
        worldY === treePosition.y &&
        blockType === BlockType.Grass
      ) {
        const treeCubes = createTree(worldX, worldY, height + 1);
        cubes.push(...treeCubes);
      }
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
  const scale = 0.01;
  const amplitude = 10;
  let height = 0;

  // Octave 1
  height += perlin.noise(x * scale, y * scale) * amplitude;

  // Octave 2
  height += perlin.noise(x * scale * 2, y * scale * 2) * (amplitude / 2);

  // Octave 3
  height += perlin.noise(x * scale * 4, y * scale * 4) * (amplitude / 4);

  return Math.floor(height);
}

function shouldPlaceTreeInChunk(c_x: number, c_y: number): boolean {
  const scale = 0.1; // Ajustez le scale pour contrôler la densité des arbres
  const threshold = 0.6; // Seuil pour décider de placer un arbre

  // Utiliser les coordonnées du chunk pour générer une valeur de bruit
  const noiseValue = perlin.noise(c_x * scale + 1000, c_y * scale + 1000);

  // Normaliser la valeur de bruit entre 0 et 1
  const normalizedNoise = (noiseValue + 1) / 2;

  return normalizedNoise > threshold;
}

function getTreePositionInChunk(c_x: number, c_y: number, chunkSize: number): { x: number; y: number } {
  // Utiliser une fonction déterministe pour choisir une position dans le chunk
  // Par exemple, en utilisant un simple hash des coordonnées du chunk

  // Générer des nombres pseudo-aléatoires basés sur les coordonnées du chunk
  const seedX = c_x * 31 + c_y * 17 + 12345;
  const seedY = c_x * 17 + c_y * 31 + 54321;

  const randX = Math.abs(Math.sin(seedX) * 10000) % chunkSize;
  const randY = Math.abs(Math.sin(seedY) * 10000) % chunkSize;

  const worldX = c_x * chunkSize + Math.floor(randX);
  const worldY = c_y * chunkSize + Math.floor(randY);

  return { x: worldX, y: worldY };
}


function createTree(x: number, y: number, baseHeight: number): Cube[] {
  const treeCubes: Cube[] = [];
  const trunkHeight = 4;

  // Créer le tronc
  for (let i = 0; i < trunkHeight; i++) {
    treeCubes.push(
      createCube(
        cubeTemplate,
        { x, y, z: baseHeight + i },
        BlockType.Wood
      )
    );
  }

  // Créer le feuillage
  const leafOffsets = [
    { dx: -1, dy: 0, dz: 0 },
    { dx: 1, dy: 0, dz: 0 },
    { dx: 0, dy: -1, dz: 0 },
    { dx: 0, dy: 1, dz: 0 },
    { dx: 0, dy: 0, dz: 0 },
    { dx: 0, dy: 0, dz: 1 },
  ];

  leafOffsets.forEach(offset => {
    const leafX = x + offset.dx;
    const leafY = y + offset.dy;
    const leafZ = baseHeight + trunkHeight + offset.dz;

    // Vous pouvez ajouter une vérification si vous souhaitez que les feuilles restent dans les limites du chunk
    treeCubes.push(
      createCube(
        cubeTemplate,
        { x: leafX, y: leafY, z: leafZ },
        BlockType.Leaves
      )
    );
  });

  return treeCubes;
}

export function getBlockTypeAtHeight(height: number): BlockType {
  if (height >= -2) {
    return BlockType.Grass;
  } else if (height >= -3) {
    return BlockType.Sand;
  } else if (height >= -5) {
    return BlockType.Dirt;
  } else {
    return BlockType.Stone;
  }
}