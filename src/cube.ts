// src/cube.ts

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type Edge = [number, number];
export type Face = number[];

export interface CubeTemplate {
  points: Point3D[];
  edges: Edge[];
  faces: Face[];
}

export interface Cube extends CubeTemplate {
  color: [number, number, number];
}

export const cubeTemplate: CubeTemplate = {
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
    [0, 1, 5, 4],
    [1, 2, 6, 5],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
    [4, 5, 6, 7],
    [0, 3, 2, 1]
  ]
};

export function createCube(
  template: CubeTemplate,
  position: Point3D,
  color: [number, number, number] = [128, 128, 128]
): Cube {
  return {
    ...template,
    points: template.points.map(point => ({
      x: point.x + position.x,
      y: point.y + position.y,
      z: point.z + position.z
    })),
    color
  };
}
