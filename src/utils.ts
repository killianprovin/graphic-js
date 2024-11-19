import { Face } from './cube.js';
import { Vector3D } from './camera.js';
import { degToRad } from './camera.js';
import { Camera } from './camera.js';
import { Cube } from './cube.js';
import { Chunk } from './world.js';
import { getBlockColor } from './block.js';

// Fonction utilitaire pour projeter un point dans le plan 2D
export function project(
  point: Vector3D,
  camera: Camera,
  screenWidth: number,
  screenHeight: number
): { x: number; y: number } | null {
  const aspectRatio = screenWidth / screenHeight;
  const fovRad = degToRad(camera.fov);
  const f = 1 / Math.tan(fovRad / 2);

  const dx = point.x - camera.position.x;
  const dy = point.y - camera.position.y;
  const dz = point.z - camera.position.z;

  const x_rot = dx * Math.cos(camera.yaw) - dy * Math.sin(camera.yaw);
  const z_rot = dx * Math.sin(camera.yaw) + dy * Math.cos(camera.yaw);
  const y_rot = dz * Math.cos(camera.pitch) - z_rot * Math.sin(camera.pitch);
  const z_rot_pitched = dz * Math.sin(camera.pitch) + z_rot * Math.cos(camera.pitch);

  if (z_rot_pitched <= 0) return null;

  const x_proj = (x_rot / z_rot_pitched) * f / aspectRatio;
  const y_proj = (y_rot / z_rot_pitched) * f;

  return {
    x: (x_proj * screenWidth) / 2 + screenWidth / 2,
    y: -(y_proj * screenHeight) / 2 + screenHeight / 2
  };
}

// Vérifie si une face est visible
export function isFaceVisible(face: Face, cube: Cube, cameraPosition: Vector3D): boolean {
  const p0 = cube.points[face[0]];
  const p1 = cube.points[face[1]];
  const p2 = cube.points[face[2]];

  const v1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
  const v2 = { x: p2.x - p0.x, y: p2.y - p0.y, z: p2.z - p0.z };

  const normal = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  };

  const toCamera = {
    x: cameraPosition.x - p0.x,
    y: cameraPosition.y - p0.y,
    z: cameraPosition.z - p0.z
  };

  const dotProduct = normal.x * toCamera.x + normal.y * toCamera.y + normal.z * toCamera.z;

  return dotProduct > 0;
}


function getFaceNormal(face: Face, cube: Cube): Vector3D {
  const p0 = cube.points[face[0]];
  const p1 = cube.points[face[1]];
  const p2 = cube.points[face[2]];

  const v1 = {
    x: p1.x - p0.x,
    y: p1.y - p0.y,
    z: p1.z - p0.z,
  };

  const v2 = {
    x: p2.x - p0.x,
    y: p2.y - p0.y,
    z: p2.z - p0.z,
  };

  const normal = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };

  // Normaliser le vecteur
  const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
  return {
    x: normal.x / length,
    y: normal.y / length,
    z: normal.z / length,
  };
}


export function isFaceExposed(face: Face, cube: Cube, chunk: Chunk): boolean {
  // Récupérer le centre de la face (le premier sommet)
  const faceCenter = cube.points[face[0]];

  // Calculer la normale de la face
  const faceNormal = getFaceNormal(face, cube);

  // Calculer la position du voisin adjacent à la face
  const neighborPosition = {
    x: faceCenter.x + faceNormal.x,
    y: faceCenter.y + faceNormal.y,
    z: faceCenter.z + faceNormal.z,
  };

  // Vérifier si un cube opaque (opacité = 1) existe à cette position
  const neighborCube = chunk.cubes.find(c =>
    c.points[0].x === neighborPosition.x &&
    c.points[0].y === neighborPosition.y &&
    c.points[0].z === neighborPosition.z
  );

  // Si un cube existe et qu'il est opaque, la face n'est pas exposée
  if (neighborCube) {
    const [_, __, ___, alpha] = getBlockColor(neighborCube.blockType);
    return alpha < 1; // Exposé si l'opacité est inférieure à 1
  }

  // Si aucun cube n'est présent, la face est exposée
  return true;
}
