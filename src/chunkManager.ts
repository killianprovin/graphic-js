// src/chunkManager.ts

import { Chunk, createChunk } from './world.js';
import { Camera } from './camera.js';

export class ChunkManager {
  private chunks: Map<string, Chunk>;
  private chunkSize: number;
  private renderDistance: number;

  constructor(chunkSize: number, renderDistance: number) {
    this.chunks = new Map();
    this.chunkSize = chunkSize;
    this.renderDistance = renderDistance;
  }

  getChunksAroundCamera(camera: Camera): Chunk[] {
    const chunksToRender: Chunk[] = [];
    const { c_x, c_y } = this.getChunkCoords(camera.position.x, camera.position.y);

    // Calculer la portée des chunks à charger
    const chunkRadius = Math.ceil(this.renderDistance / this.chunkSize);

    for (let x = c_x - chunkRadius; x <= c_x + chunkRadius; x++) {
      for (let y = c_y - chunkRadius; y <= c_y + chunkRadius; y++) {
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

    return chunksToRender;
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
}
