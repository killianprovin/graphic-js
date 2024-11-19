// src/block.ts

export enum BlockType {
    Grass,
    Dirt,
    Stone
}

export function getBlockColor(blockType: BlockType): [number, number, number] {
    switch (blockType) {
      case BlockType.Grass:
        return [34, 139, 34]; // Vert pour l'herbe
      case BlockType.Dirt:
        return [139, 69, 19]; // Marron pour la terre
      case BlockType.Stone:
        return [128, 128, 128]; // Gris pour la pierre
      default:
        return [255, 255, 255]; // Blanc par défaut
    }
  }