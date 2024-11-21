// src/block.ts

export enum BlockType {
  Grass,
  Dirt,
  Stone,
  Sand,
  Water,
  Wood,
  Leaves
}

export function getBlockColor(blockType: BlockType): [number, number, number, number] {
  switch (blockType) {
    case BlockType.Grass:
      return [34, 170, 34, 1]; // Vert
    case BlockType.Dirt:
      return [139, 69, 19, 1]; // Marron
    case BlockType.Stone:
      return [128, 128, 128, 1]; // Gris
    case BlockType.Sand:
      return [210, 180, 140, 1]; // Sable
    case BlockType.Water:
      return [30, 144, 255, 0.5]; // Bleu
    case BlockType.Wood:
      return [101, 67, 33, 1]; // Marron foncé
    case BlockType.Leaves:
      return [15, 125, 43, 0.8]; // Vert
    default:
      return [255, 255, 255, 1]; // Blanc par défaut
  }
}
