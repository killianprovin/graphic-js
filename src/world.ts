// src/world.ts

import { Cube, createCube, cubeTemplate } from './cube.js';
import { Vector3D } from './camera.js';


export function createFloor(
  size: number,
  height: number,
  color: [number, number, number]
): Cube[] {
  const halfSize = Math.floor(size / 2);
  const floor: Cube[] = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      floor.push(
        createCube(
          cubeTemplate,
          { x: x - halfSize, y: y - halfSize, z: height },
          color
        )
      );
    }
  }
  return floor;
}

export function createWorld(): Cube[] {
  return [
    createCube(cubeTemplate, { x: 0, y: 0, z: 0 }, [0, 255, 0]),
    createCube(cubeTemplate, { x: 2, y: 0, z: 0 }, [255, 0, 0]),
    createCube(cubeTemplate, { x: 0, y: 2, z: 0 }, [0, 255, 0]),
    createCube(cubeTemplate, { x: 2, y: 2, z: 0 }, [0, 255, 0]),
    ...createFloor(201, -1, [127, 127, 127])
  ];
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

export function sortCubesByDistance(world: Cube[], cameraPosition: Vector3D): Cube[] {
  return world.sort((a, b) => {
    const distanceA = calculateDistance(a, cameraPosition);
    const distanceB = calculateDistance(b, cameraPosition);
    return distanceB - distanceA;
  });
}
