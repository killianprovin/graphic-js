// src/perlin.ts

export class PerlinNoise {
    private permutation: number[] = [];
  
    constructor(seed: number = 0) {
      this.permutation = this.generatePermutation(seed);
    }
  
    private generatePermutation(seed: number): number[] {
      const p = new Array(256);
      for (let i = 0; i < 256; i++) {
        p[i] = i;
      }
  
      // Shuffle using the seed
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(this.random(seed) * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
        seed++;
      }
  
      return p.concat(p);
    }
  
    private random(seed: number): number {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }
  
    private fade(t: number): number {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
  
    private lerp(t: number, a: number, b: number): number {
      return a + t * (b - a);
    }
  
    private grad(hash: number, x: number, y: number, z: number): number {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
  
    public noise(x: number, y: number = 0, z: number = 0): number {
      const floorX = Math.floor(x) & 255;
      const floorY = Math.floor(y) & 255;
      const floorZ = Math.floor(z) & 255;
  
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
  
      const u = this.fade(x);
      const v = this.fade(y);
      const w = this.fade(z);
  
      const A = this.permutation[floorX] + floorY;
      const AA = this.permutation[A] + floorZ;
      const AB = this.permutation[A + 1] + floorZ;
      const B = this.permutation[floorX + 1] + floorY;
      const BA = this.permutation[B] + floorZ;
      const BB = this.permutation[B + 1] + floorZ;
  
      const res = this.lerp(w,
        this.lerp(v,
          this.lerp(u,
            this.grad(this.permutation[AA], x, y, z),
            this.grad(this.permutation[BA], x - 1, y, z)
          ),
          this.lerp(u,
            this.grad(this.permutation[AB], x, y - 1, z),
            this.grad(this.permutation[BB], x - 1, y - 1, z)
          )
        ),
        this.lerp(v,
          this.lerp(u,
            this.grad(this.permutation[AA + 1], x, y, z - 1),
            this.grad(this.permutation[BA + 1], x - 1, y, z - 1)
          ),
          this.lerp(u,
            this.grad(this.permutation[AB + 1], x, y - 1, z - 1),
            this.grad(this.permutation[BB + 1], x - 1, y - 1, z - 1)
          )
        )
      );
  
      // Normaliser le résultat pour qu'il soit entre -1 et 1
      return res;
    }
  }
  