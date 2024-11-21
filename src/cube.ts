// src/cube.ts
import { BlockType, getBlockColor } from './block.js';
import { Chunk } from './world.js';
import { Vector3D } from './camera.js';

export interface Cube extends CubeTemplate {
  color: [number, number, number, number];
  blockType: BlockType; // Nouveau champ pour le type de bloc
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type Edge = [number, number];
export type Face = {exposed: boolean, points: number[]};

export interface CubeTemplate {
  position: Point3D;
  points: Point3D[];
  edges: Edge[];
  faces: Face[];
}

export const cubeTemplate: CubeTemplate = {
  position: { x: 0, y: 0, z: 0 },
  points: [
    { x: 1, y: 1, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 1, y: 1, z: 1 },
    { x: 0, y: 1, z: 1 },
    { x: 0, y: 0, z: 1 },
    { x: 1, y: 0, z: 1 }
  ],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ],
  faces: [
    {exposed: true, points: [0, 1, 5, 4]},
    {exposed: true, points: [1, 2, 6, 5]},
    {exposed: true, points: [2, 3, 7, 6]},
    {exposed: true, points: [3, 0, 4, 7]},
    {exposed: true, points: [4, 5, 6, 7]},
    {exposed: true, points: [0, 3, 2, 1]}
  ]
};

export function createCube(
  template: CubeTemplate,
  pos: Point3D,
  blockType: BlockType
): Cube {

  const position = {x: template.position.x + pos.x, y: template.position.y + pos.y, z: template.position.z + pos.z};
  
  const points = template.points.map(point => ({
    x: point.x + pos.x,
    y: point.y + pos.y,
    z: point.z + pos.z
  }));

  const color = getBlockColor(blockType);

  return {
    position,
    points,
    edges: template.edges,
    faces: template.faces,
    color,
    blockType
  };
}