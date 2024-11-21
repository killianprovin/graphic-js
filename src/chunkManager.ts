// src/chunkManager.ts

import { Chunk, createChunk } from './world.js';
import { Camera, degToRad, Vector3D } from './camera.js';
import { Canvas } from './canvas.js';

export class ChunkManager {
  private chunks: Map<string, Chunk>;
  private chunkSize: number;
  private renderDistance: number;

  constructor(chunkSize: number, renderDistance: number) {
    this.chunks = new Map();
    this.chunkSize = chunkSize;
    this.renderDistance = renderDistance;
  }

  getChunksAroundCamera(camera: Camera, canvas: Canvas): Chunk[] {
    const chunksToRender: Chunk[] = [];
    const { c_x, c_y } = this.getChunkCoords(camera.position.x, camera.position.y);

    // Calculer la portée des chunks à charger
    const chunkRadius = Math.ceil(this.renderDistance / this.chunkSize);
    const closeRadius = Math.ceil(chunkRadius / 8);

    for (let x = c_x - chunkRadius; x <= c_x + chunkRadius; x++) {
      for (let y = c_y - chunkRadius; y <= c_y + chunkRadius; y++) {
        // Calculer les coordonnées centrales du chunk
        const chunkCorners = this.getChunkCorners(x, y, this.chunkSize);

        // Vérifier si au moins un coin est dans le champ de vision
        const isVisible = chunkCorners.some(corner => this.isPointInCameraView(corner, camera, canvas));

        // Calculer la distance entre le chunk et la caméra
        const chunkCenter = { x: x * this.chunkSize + this.chunkSize / 2, y: y * this.chunkSize + this.chunkSize / 2 };
        const distanceToCamera = Math.sqrt(
          (chunkCenter.x - camera.position.x) ** 2 +
          (chunkCenter.y - camera.position.y) ** 2
        );

        // Inclure le chunk s'il est visible ou dans la zone proche
        if (isVisible || distanceToCamera <= closeRadius * this.chunkSize) {
          const chunkKey = `${x},${y}`;
          let chunk = this.chunks.get(chunkKey);
          if (!chunk) {
            // Générer un nouveau chunk
            chunk = createChunk(x, y, this.chunkSize);
            this.chunks.set(chunkKey, chunk);
          }
          chunksToRender.push(chunk);
        }
      }
    }

    return chunksToRender.sort((a, b) => {
      return this.calculateChunkDistance(b, camera.position) - this.calculateChunkDistance(a, camera.position);
    });
  }

  private getChunkCorners(chunkX: number, chunkY: number, chunkSize: number): Vector3D[] {
    const baseX = chunkX * chunkSize;
    const baseY = chunkY * chunkSize;
    const z = 0; // Assumer une hauteur constante
  
    return [
      { x: baseX, y: baseY, z }, // Coin bas-gauche
      { x: baseX + chunkSize, y: baseY, z }, // Coin bas-droit
      { x: baseX, y: baseY + chunkSize, z }, // Coin haut-gauche
      { x: baseX + chunkSize, y: baseY + chunkSize, z }, // Coin haut-droit
    ];
  }

  /**
   * Vérifie si un point est dans le champ de vision de la caméra.
   */
  private isPointInCameraView(point: Vector3D, camera: Camera, canvas: Canvas, margin: number = 0.2): boolean {
    const aspectRatio = canvas.screenWidth / canvas.screenHeight;
    const fovRad = degToRad(camera.fov);
    const f = 1 / Math.tan(fovRad / 2);

    const dx = point.x - camera.position.x;
    const dy = point.y - camera.position.y;
    const dz = point.z - camera.position.z;

    const x_rot = dx * Math.cos(camera.yaw) - dy * Math.sin(camera.yaw);
    const z_rot = dx * Math.sin(camera.yaw) + dy * Math.cos(camera.yaw);
    const y_rot = dz * Math.cos(camera.pitch) - z_rot * Math.sin(camera.pitch);
    const z_rot_pitched = dz * Math.sin(camera.pitch) + z_rot * Math.cos(camera.pitch);

    // Vérifier si le point est devant la caméra
    if (z_rot_pitched <= 0) return false;

    // Calculer la projection sur le plan de la caméra
    const x_proj = (x_rot / z_rot_pitched) * f / aspectRatio;
    const y_proj = (y_rot / z_rot_pitched) * f;

    // Ajuster les limites avec une marge
    const minX = -1 - margin;
    const maxX = 1 + margin;
    const minY = -1 - margin;
    const maxY = 1 + margin;

    // Vérifier si le point projeté est dans le rectangle du champ de vision élargi
    return (
      x_proj >= minX && x_proj <= maxX &&
      y_proj >= minY && y_proj <= maxY
    );
  }

  removeDistantChunks(camera: Camera): void {
    const { c_x, c_y } = this.getChunkCoords(camera.position.x, camera.position.y);
    const chunkRadius = Math.ceil(this.renderDistance / this.chunkSize) + 1; // Rayon légèrement plus grand

    for (const key of this.chunks.keys()) {
      const [xStr, yStr] = key.split(',');
      const x = parseInt(xStr);
      const y = parseInt(yStr);

      if (Math.abs(x - c_x) > chunkRadius || Math.abs(y - c_y) > chunkRadius) {
        this.chunks.delete(key);
      }
    }
  }

  getChunkCoords(x: number, y: number): { c_x: number; c_y: number } {
    const c_x = Math.floor(x / this.chunkSize);
    const c_y = Math.floor(y / this.chunkSize);
    return { c_x, c_y };
  }

  calculateChunkDistance(chunk: Chunk, cameraPosition: { x: number; y: number }): number {
    const c_x = chunk.c_x * this.chunkSize + this.chunkSize / 2;
    const c_y = chunk.c_y * this.chunkSize + this.chunkSize / 2;
    return (c_x - cameraPosition.x) ** 2 + (c_y - cameraPosition.y) ** 2;
  }
}
